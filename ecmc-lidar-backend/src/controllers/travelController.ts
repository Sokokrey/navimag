import { Request, Response } from 'express';
import Scan from '../models/scan';
import Travel from '../models/travel';
import moment from 'moment';
import client from '../mqtt';

class TravelController {
 
    public async list(req: Request, res: Response): Promise<void> {
        await Travel.find({}, function(err: any, data: any) {    
            if (data) 
                res.json(data);  
            else   
                res.status(404).json({ res: 'not found' });  
        }); 
    }

    public async get(req: Request, res: Response): Promise<void> {
        const { num } = req.params;
        await Travel.find( { num: num } , function(err: any, data: any) {
            if (data)
                res.json(data);
            else
                res.status(404).json({ res: 'not found' });    
        });
    } 

    public async add(req: Request, res: Response): Promise<void> {
        await Travel.create(req.body, function(err:any){
            if(err) throw err;
            res.json({ res: 'ok' });
        });
    }
    
    public async upd(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        await Travel.update( { _id: id }, req.body, { upsert: true }, function(err: any){
            if(err) throw err;
            res.json({ res: 'ok' });
        });
    }

    public async del(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        await Travel.findOneAndRemove( { _id : id }, function (err: any, data : any){
            if(err) throw err;
            res.json({ res: 'ok' });
        });
    }

    public async getTravelScans(req: Request, res: Response): Promise<void> {
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
            customer:"$customer",
            driver: { $concat: [ "$driver.name", " - ", "$driver.RUT" ] },
            patente: "$patente",
            patente2: "$patente2",
            nro_recepcion : "$nro_recepcion",
            mi: "$medidas.largo",
            sa: "$medidas.ancho",
            medidas: "$medidas",
            equipo:{ $concat: [ "$tipo_carga", " - ", "$carga" ] },
            dice_contener: "$dice_tener",
            peso: "$medidas.peso",
            observaciones: "$observaciones",
            deck_assign: "$deck_assign"
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

    //Obtengo un listado de travels agrupando los scans por numero de travel.
    //Para cada travel creo un field 'scans' que almacenara cada scan asignado a ese travel
    //Para saber si agregar o no el scan, pregunto si el atributo embarked de travel no esta en true, ese atributo solo pasa a true cuando se zarpa la nave una vez asignados todos los scans a alguna cubierta
    public async getPendingTravels(req: Request, res: Response): Promise<void> {
        await Scan.aggregate([
            {
              $group: {
                _id: { num: "$travel.num", ferry: "$travel.ferry" },
                asignados : { $sum: { $cond: [ { $and : [ { $ifNull: [ "$deck_assign", null ] },
                                                          { $ne: [ "$deck_assign.embarked", true ] } ] }, 1, 0 ] } },
                totales: { $sum: { $cond: [ { $ifNull: [ "$deck_assign.embarked", null ] }, 0, 1 ] } },
                scans : { $push: { $cond: [ { $ne: [ "$deck_assign.embarked", true ] }, "$$ROOT" ,  {}] } } // $$ROOT significa el objeto completo
              }
            },
            {
              $addFields: { 
                num : "$_id.num"
              }
            },
            {$match: { totales: { $gt: 0 } } },
            { $sort: { "_id.num" : 1 }}
          ], function(err:any, data: JSON[]){
            res.json(data); 
        }); 
    }  

    //Procedimiento similar, con la diferencia que aqui pregunto por los scans que tengan el atributo embarked en true, que quiere decir que el embarcador le dio Zarpar en la plataforma.
    public async getEmbarkedTravels(req: Request, res: Response): Promise<void> {
      await Scan.aggregate([  
          {
            $group: { 
              _id: { num: "$travel.num", ferry: "$travel.ferry" },
              totales : { $sum: { $cond: [ { $and : [ { $eq: [ "$deck_assign.embarked", true ] },
                                                      { $ne: [ "$deck_assign.deck.id", 0 ] },  
                                                      { $eq:  [ { $type : "$arrived" } , 'missing' ] } ] }, 1, 0 ] } },
              scans : { $push: { $cond: [ { $eq: [ "$deck_assign.embarked", true ] }, "$$ROOT" ,  {}] } } // $$ROOT significa el objeto completo
            }
          },
          {
            $addFields: {  
              num : "$_id.num"
            }
          },
          {$match: { totales: { $gt: 0 } } },
          { $sort: { "_id.num" : 1 }}
        ], function(err:any, data: JSON[]){
          res.json(data);
      }); 
    }

    //Distribucion de la nave por sus cubiertas
    public async getShipLayout(req: Request, res: Response): Promise<void> {
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
                customer:"$customer",
                driver: { $concat: [ "$driver.name", " - ", "$driver.RUT" ] },
                patente: "$patente",
                patente2: "$patente2",
                nro_recepcion : "$nro_recepcion",
                mi: "$medidas.largo",
                sa: "$medidas.ancho",
                medidas: "$medidas",
                equipo:{ $concat: [ "$tipo_carga", " - ", "$carga" ] },
                dice_contener: "$dice_tener",
                peso: "$medidas.peso",
                observaciones: "$observaciones",
                deck_assign: "$deck_assign"
              }
            },
            {  
              $match: {
                "travel.num": parseInt(travel,10)
              }
            },
            {
              $group : {
                _id : { deck_id : "$deck_assign.deck.id" , deck_name : "$deck_assign.deck.name"},
                scans : { $push: "$$ROOT"}
              }
            },
            {
              $addFields: { 
                deck : "$_id.deck_name",
                id: "$_id.deck_id"
              }
            },
            { $sort: { "_id.deck_id" : 1 }}
          ], function(err:any, data: JSON[]){
            res.json(data); 
        }); 
    }

    public async embarcarCargas(req: Request, res: Response): Promise<void> {
        const { num } = req.params;
        let today = new Date(moment().format())
        let fecha = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
        
        await Travel.updateOne( { num : num }, { embarked : true }, function(err: any){
            if(err) throw err;
        });
        
        req.body.forEach(async (scan : any, i : number) => {
            if(scan.deck_assign.deck.id != 0){ //Si no está condicional 
                await Scan.updateOne({ _id : scan._id }, { $set: { "deck_assign.embarked" : true } } , { multi: true }, function(err: any, data:any){
                    if(err) throw err;
                });
            }            
            if(req.body.length === i + 1){
              client.publish(`travel/embarked`, JSON.stringify(num));
              res.json({ res: 'ok' })
            }
        });
    }

    public async finishTravel(req: Request, res: Response): Promise<void> {
      const { num } = req.params;
      let today = new Date(moment().format())
      let fecha = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
      
      await Travel.updateOne( { num : num }, { $set: { arrived : fecha } }, { upsert: true },function(err: any){
          if(err) throw err;
      });
      
      req.body.forEach(async (scan : any, i : number) => {
          await Scan.updateOne({ _id : scan._id },  { $set: { arrived : fecha } }, { multi: true, upsert: true }, function(err: any, data:any){
              if(err) throw err;
          });
          if(req.body.length === i + 1){
            res.json({ res: 'ok' })
          }
      });
  }
}

export const travelController = new TravelController();
