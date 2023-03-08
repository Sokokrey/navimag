import { Request, Response } from 'express';
import Scan from '../models/scan';
import Sensor from '../models/sensor';
import Customer from '../models/customer';
import Driver from '../models/driver';
import moment from 'moment';
import client from '../mqtt';

class ScanController {


    public async del(req: Request, res: Response): Promise<void> {
      const { id } = req.params;
      await Scan.findOneAndRemove( { _id : id }, function (err: any){
          if(err) throw err; 
          res.json({ res: 'ok' });
      });
    }
    
    public async scan(req: Request, res: Response): Promise<any> {
      const { dimension } = req.params;
      const spawn = require("child_process").spawn;

      let file = (Number(dimension) === 2) ? "./scan2d.py" : "./scan3d.py" ;
      const process = spawn('python3',[file]);
      
      let arr: any = []; 
      process.stdout.on('data', (data:any) => {  
          arr.push(data.toString());
      });  

      let flag:any= await Sensor.find({})
      process.stdout.on('close', async (code:any) => {
          await Sensor.updateOne({name:flag[0].name}, {flag:0},{ upsert: true })
          res.json(arr);
      }); 
    }

    public async getSensorStatus(req: Request, res: Response): Promise<any> {
      const spawn = require("child_process").spawn;
      const process = spawn('python3', ["./sensor_status.py"]);
      let status: number;
      process.stdout.on('data', (data: any) => {
          status = parseInt(data.toString().trim());
      });
      process.stdout.on('close', (code: any) => {
          res.json(status);
      });
    }


    public async getsensorflag(req: Request, res: Response): Promise<void> {
      await Sensor.find({}, function (err:any,data:any){
          if(data)
              res.json(data)
          else
              res.status(404).json({ res: 'not found' });
      })
    }

    public async putsensorflag(req: Request, res: Response): Promise<void>{
        await Sensor.update({}, req.body,{ upsert: true }, function(err: any, data:any){
            if(err) throw err;
            res.json({ res: 'ok' });
        });
    }

    public async getLastScanInfo(req: Request, res: Response): Promise<any> {
      let last_scan = await Scan.findOne().sort({ field: 'asc', _id: -1 }).limit(1);
      res.json(last_scan);   
    } 


    public async save(req: Request, res: Response): Promise<void> {    
        let last_scan : any = await Scan.findOne().sort({ field: 'asc', _id: -1 }).limit(1);

        //Creacion del numero de recepcion
        if (last_scan){
            let new_nro_recepcion = (parseInt(last_scan.nro_recepcion.replace(/[^0-9]/g,'')) + 1).toString();
            while(new_nro_recepcion.toString().length < 7){
                new_nro_recepcion =+ '0'+new_nro_recepcion
            }
            req.body.nro_recepcion = req.body.nro_recepcion + new_nro_recepcion.toString();
        } else
            req.body.nro_recepcion = req.body.nro_recepcion + '0000001';
        
        //Si es carga sin patente, esta pasa a ser igual al nro de recepcion 
        if(req.body.patente == 0)
          req.body.patente = req.body.nro_recepcion
        
        //Crea nuevo cliente en caso de que no exista el ingresado
        await Customer.find( { RUT : req.body.customer.RUT }, async function(err : any, data: any) {
          if(data.length == 0){
            await Customer.create( { name : req.body.customer.name.toUpperCase(), RUT : req.body.customer.RUT }, function(err:any){
              if(err) throw err; 
            });
          }
        })

        //Crea nuevo chofer en caso de que no exista el ingresado
        await Driver.find( { RUT : req.body.driver.RUT }, async function(err : any, data: any) {
          if(data.length == 0){
            await Driver.create( { name : req.body.driver.name.toUpperCase(), RUT : req.body.driver.RUT }, function(err:any){
              if(err) throw err; 
            });
          }
        })
        
        //Almacena en registro
        let today = new Date(moment().format())
        req.body.travel.zarpe = new Date(new Date(req.body.travel.zarpe).getTime() - today.getTimezoneOffset() * 60000 )
        req.body.fecha = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
        await Scan.create(req.body, function(err:any){
          if(err) throw err;
          res.json({ res: 'ok' });
        });
    }

    public async getOneHistoric(req: Request, res: Response): Promise<void> {
      const { scan_id } = req.params;
      await Scan.find({ _id: scan_id }, function (err: any, data: any) {
          if (data)
              res.json(data);
          else
              res.status(404).json({ res: 'not found' });
      });
    }

    public async getHistoric(req: Request, res: Response): Promise<void> {
          await Scan.aggregate([{ $project: {
              patente: { $concat: 
                          [ "$patente",
                            { $cond: [ 
                              { $ifNull: ["$patente2", null] }, 
                                  { $concat: [ " // ","$patente2" ]}, ""  
                            ]}
              ]},
              driver: { $concat: [ "$driver.name", " - ", "$driver.RUT" ] },
              nro_reserva: "$nro_reserva",
              nro_recepcion: "$nro_recepcion", 
              tipo_carga: "$tipo_carga",
              carga: "$carga",  
              dice_tener: "$dice_tener",
              carga_peligrosa: "$carga_peligrosa",
              terminal_embarque: "$travel.terminal_embarque",
              terminal_destino: "$travel.terminal_destino",
              customer: "$customer",
              travel: "$travel",
              medidas: "$medidas",
              fecha: "$fecha",
              user: "$user",
              hora:{
                $dateToString: {format: "%H:%M",date: {$toDate: "$fecha"}}
              },
              deck_assign: "$deck_assign"
          }}, 
            { $sort : { fecha : -1 } }], function(err:any, data: JSON[]){
            res.json(data); 
        });  
    }

    public async getHistoricbyrange(req: Request, res: Response): Promise<void> {
      const { fecha_ini } = req.params;
      const { fecha_fin } = req.params;

      let ran_ini_date = new Date(fecha_ini)
      let ran_fin_date = new Date(fecha_fin)

      let ran_ini_utc = new Date(ran_ini_date.getTime() + ran_ini_date.getTimezoneOffset() * 60000);
      let ran_fin_utc = new Date(ran_fin_date.getTime() + ran_fin_date.getTimezoneOffset() * 60000);
      
      await Scan.aggregate([
          {
            $project: {
              _id : 0 ,
              nro_reserva: "$nro_reserva",
              fecha: "$fecha",
              hora:{
                $dateToString: {format: "%H:%M",date: {$toDate: "$fecha"}}
              },
              ruta:{ $concat: [ "$travel.terminal_embarque", " - ", "$travel.terminal_destino" ] },
              rut: "$customer.RUT",
              travel: "$travel",
              embarcador:"$customer.name",
              driver: { $concat: [ "$driver.name", " - ", "$driver.RUT" ] },
              patente: "$patente",
              patente2: "$patente2",
              nro_recepcion : "$nro_recepcion",
              mi: "$medidas.largo",
              sa: "$medidas.ancho",
              equipo:{ $concat: [ "$tipo_carga", " - ", "$carga" ] },
              dice_contener: "$dice_tener",
              peso: "$medidas.peso",
              observaciones: "$observaciones",
              year: {
                $year: {
                  $toDate: "$fecha"
                }
              }
            }
          },
          {
            $match: {
              fecha: {
                $gte: ran_ini_utc,
                $lte: ran_fin_utc
              }
            }
          }
        ], function(err:any, data: JSON[]){
          res.json(data); 
      }); 
    }
    
    public async getHistoricbytravel(req: Request, res: Response): Promise<void> {
      const { travel } = req.params;
          await Scan.aggregate([
              {
                $project: {
                  _id : 0 ,
                  nro_reserva: "$nro_reserva",
                  fecha: "$fecha",
                  hora:{
                    $dateToString: {format: "%H:%M",date: {$toDate: "$fecha"}}
                  },
                  ruta:{ $concat: [ "$travel.terminal_embarque", " - ", "$travel.terminal_destino" ] },
                  rut: "$customer.RUT",
                  travel: "$travel",
                  embarcador:"$customer.name",
                  driver: { $concat: [ "$driver.name", " - ", "$driver.RUT" ] },
                  patente: "$patente",
                  patente2: "$patente2",
                  nro_recepcion : "$nro_recepcion",
                  mi: "$medidas.largo",
                  sa: "$medidas.ancho",
                  equipo:{ $concat: [ "$tipo_carga", " - ", "$carga" ] },
                  dice_contener: "$dice_tener",
                  peso: "$medidas.peso",
                  observaciones: "$observaciones",
                }
              },
              {
                $match: {
                  "travel.num": parseInt(travel,10)
                }
              }
            ], function(err:any, data: JSON[]){
              res.json(data); 
          }); 
      }
    
    public async scanCamera(req: Request, res: Response): Promise<any> {
        const Recorder = require('node-rtsp-recorder').Recorder
        const { scan_id } = req.params;

        /*
        //const camera = [1,2,3,4,5,6,7,8];
        const camera = [2,3,4,5,6,7,2,8];
        
        let url;
        camera.forEach((id) => {
            // Get the UDP stream URL
            url = 'rtsp://victorid:id1234@10.0.2.33:554/unicast/c' + id + '/s2/live/';
            
            
            //let host = require("os").userInfo().username;
            var rec = new Recorder({
                url: url,
                folder: '/var/www/html/upload',
                name: 'scan_id/' + scan_id + '/' ,
                directoryPathFormat: 'DD-MM-YYYY',
                fileNameFormat: id + '',
                type: 'image'
            })
            rec.captureImage(() => {
                console.log('Image Captured')
            })
        })
        res.json({ res: 'Imagenes Capturadas' });
        */
        
        const camera = [31,32,33,34,35,36,37,38];
        let url;
        camera.forEach((id, i) => {
            // Get the UDP stream URL
            if (id == 34 || id == 32 || id == 33 || id == 38){
                url = 'rtsp://admin:admin12345@192.168.210.' + id + ':554/cam/realmonitor?channel=1&subtype=1';
            
                var rec = new Recorder({
                    url: url,
                    folder: '/var/www/html/upload',
                    name: 'scan_id/' + scan_id + '/' ,
                    directoryPathFormat: 'DD-MM-YYYY',
                    fileNameFormat: id + '',
                    type: 'image'
                })
            } else {
                url ='rtsp://192.168.210.'+ id + '/user=admin_password=tlJwpbo6_channel=1_stream=0.sdp?real_stream';

                var rec = new Recorder({
                    url: url,
                    folder: '/var/www/html/upload',
                    name: 'scan_id/' + scan_id + '/' ,
                    directoryPathFormat: 'DD-MM-YYYY',
                    fileNameFormat: id + '',
                    type: 'image'
                })
            }
            rec.captureImage(() => {
                console.log('Image Captured')
            })
        })
        res.json({ res: 'Imagenes Capturadas' });
        
    }
    
    public async assignDeck(req: Request, res: Response): Promise<void>{
      const { id } = req.params;
      
      let today = new Date(moment().format())
      req.body.date = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
      await Scan.updateOne( { _id : id }, { $set : { deck_assign: req.body } }, { upsert: true }, function(err: any, data:any){
          if(err) throw err;
          res.json({ res: 'ok' });
      });
    }


    public async changeScanTravel(req: Request, res: Response): Promise<void> {
      const { id } = req.params;
      await Scan.updateOne( { _id: id }, { travel : req.body.travel , $unset: { deck_assign :1 } }, { upsert: true }, function(err: any){
          if(err) throw err;
          res.json({ res: 'ok' });
      });
    }

}

export const scanController = new ScanController();
