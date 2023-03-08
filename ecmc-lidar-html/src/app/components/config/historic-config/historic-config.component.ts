import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Scan } from 'src/app/models/scan';
import { Login } from 'src/app/models/login';
import { GalleryComponent } from './gallery/gallery.component';
import { ScanService } from 'src/app/services/scan.service';
import { ReportHistoricService } from '../../../services/report-historic.service';
import * as moment from 'moment';
import { faFilePdf, faImages, faFileExcel, faSave, faTrash } from '@fortawesome/free-solid-svg-icons';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { TravelService } from 'src/app/services/travel.service';
import { MqttService } from 'src/app/services/mqtt.service';
import { Travel } from 'src/app/models/travel';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD-MM-YYYY',
  },
  display: {
    dateInput: 'DD-MM-YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD MM',
    monthYearA11yLabel: 'MMMM YYYY'
  },
};

@Component({
  selector: 'app-historic-config',
  templateUrl: './historic-config.component.html',
  styleUrls: ['./historic-config.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ]
})
export class HistoricConfigComponent implements OnInit {
  scanList: Scan[];
  travelList : Travel[] = []
  ds_historicScans: MatTableDataSource<Scan>;
  displayColumns = ['nro_recepcion','patente', 'nro_reserva', 'travel', 'peso', 'alto','largo', 'ancho', 'fecha' , 'hora', 'actions']
  
  patenteFilter = new FormControl();
  travelNumFilter = new FormControl();
  nroRecepcionFilter = new FormControl();

  faFilePdf = faFilePdf;
  faImages = faImages;
  faTrash = faTrash;
  faFileExcel = faFileExcel;
  faSave = faSave;

  //Rangos de fechas
  range : FormGroup
  ran_ini : string;
  ran_fin : string;

  tomorrow : Date;
  login: Login = {
    user: localStorage.getItem('user'),
    name: localStorage.getItem('name'),
    category: parseInt(localStorage.getItem('category'))
  };

  filteredValues = { nro_recepcion: '', patente: '', nro_reserva: '', travel: '', peso: '', alto: '', largo: '', ancho: '', fecha: '', hora: '' };
  hideSpinner : boolean = false
  constructor(private snackbar: MatSnackBar,  private Mqtt: MqttService , private travelService: TravelService, private scanService: ScanService, public dialog: MatDialog,
              private reportHistoricService: ReportHistoricService) {
    this.ds_historicScans = new MatTableDataSource(this.scanList);
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
  }

  @ViewChild('scanPaginator', { read: MatPaginator }) scanPaginator: MatPaginator;

  async ngOnInit() {
    this.getHistorics();
    this.getTravels();

    this.Mqtt
    .getMessages(['scan/new_scan'])
    .subscribe(({ message, topic })=>{
      switch (topic){
        case 'scan/new_scan':
          this.getHistorics()
          this.getTravels()
        break;
      }})

    this.tomorrow = moment(moment(moment().toDate()).add(1, 'day').format('YYYY-MM-DD hh:mm:ss')).toDate();

    this.range = new FormGroup({
      start: new FormControl(),
      end: new FormControl()
    });
  }

  async getHistorics(){
    this.scanList = await this.scanService.getHistoric()
    this.ds_historicScans = new MatTableDataSource(this.scanList);

    this.nroRecepcionFilter.valueChanges.subscribe((nroRecepcionFilterValue) => {

      this.filteredValues['nro_recepcion'] = nroRecepcionFilterValue;
      this.ds_historicScans.filter = JSON.stringify(this.filteredValues);
    });

    this.patenteFilter.valueChanges.subscribe((patenteFilterValue) => {
      this.filteredValues['patente'] = patenteFilterValue;
      this.ds_historicScans.filter = JSON.stringify(this.filteredValues);
    });

    this.travelNumFilter.valueChanges.subscribe((travelNumFilterValue) => {
      this.filteredValues['travel'] = (travelNumFilterValue) ? travelNumFilterValue : "";
      this.ds_historicScans.filter = JSON.stringify(this.filteredValues);
    });

    this.range.controls.end.valueChanges.subscribe((end) => {
      this.filteredValues['fecha_ini'] = this.range.controls.start.value 
      this.filteredValues['fecha_fin'] = end
      this.ds_historicScans.filter = JSON.stringify(this.filteredValues);
    })

    this.ds_historicScans.filterPredicate = this.customFilterPredicate();
    this.ds_historicScans.paginator = this.scanPaginator;
  }

  async getTravels(){
    this.travelList = await this.travelService.list()
    this.travelList.forEach(function (travel : any) {
      travel.new_travel = 0;
    });
  }

  async searchtravel(travelNumFilter: number) {
    if(travelNumFilter){
      let travel = await this.travelService.getTravel(travelNumFilter);
      if (travel[0])
        this.reportHistoricService.generateExcelbyTravel(travelNumFilter);
      else
        this.snackbar.open('No se encontraron coincidencias', 'Close', { panelClass: ['warning-snackbar'], duration: 3000 });
      
      return
    }
    this.snackbar.open('Por favor, ingrese un número de viaje', 'Close', { panelClass: ['warning-snackbar'], duration: 3000 });  
  }

  searchrange() {
    var fecha1 = this.range.controls.start
    var fecha2 = this.range.controls.end

    if(fecha1.value && fecha2.value){
      if(!fecha1.hasError('matStartDateInvalid') && !fecha2.hasError('matStartDateInvalid')){


        let epa1 = moment.utc(fecha1.value).format('YYYY-MM-DD')
        let epa2 = moment.utc(fecha2.value).format('YYYY-MM-DD')

        this.reportHistoricService.generateExcelByRange(epa1, epa2);  
      }else
        this.snackbar.open('Por favor, ingrese un formato válido de fecha', 'Close', { panelClass: ['warning-snackbar'], duration: 3000 });
    
      return
    }
    this.snackbar.open('Por favor, ingrese ambas fechas', 'Close', { panelClass: ['warning-snackbar'], duration: 3000 });
  }

  customFilterPredicate() {
    const myFilterPredicate = function (data: Scan, filter: string): boolean {
      let searchString = JSON.parse(filter);
      
      let nroRecepcionFound = data.nro_recepcion.toString().trim().toLowerCase().indexOf(searchString.nro_recepcion.toLowerCase()) !== -1
      let patenteFound = data.patente.toString().trim().toLowerCase().indexOf(searchString.patente.toLowerCase()) !== -1
      let travelNumFound = data.travel['num'].toString().trim().indexOf(searchString.travel) !== -1

      let begin = searchString.fecha_ini
      let end   = searchString.fecha_fin
      
      let fechaFound = (searchString.fecha_ini && searchString.fecha_fin) ? (data.fecha >= begin && data.fecha <= end) : true;

      if (searchString.topFilter) {
        return patenteFound || travelNumFound || fechaFound || nroRecepcionFound
      } else {
        return patenteFound && travelNumFound && fechaFound && nroRecepcionFound
      }
    }
    return myFilterPredicate;
  }
  
  async delScan(scan){
    if(confirm("¿Está seguro que desea eliminar el Registro: "+scan.nro_recepcion+" ?")){
      await this.scanService.delScan(scan)
      this.getHistorics()
      this.snackbar.open('Registro elimando correctamente', 'Close', { panelClass: ['warning-snackbar'], duration: 3000 });
    }
  }

  async generatePdf(scan_id: String, type: Number) {
    console.log('****',scan_id);

    this.hideSpinner = true;
    let scanList = await this.scanService.getOneHistoric(scan_id);

    let nro_recepcion = scanList[0].nro_recepcion;
    let patente = (!scanList[0].patente2) ? scanList[0].patente : scanList[0].patente +' / '+ scanList[0].patente2;
    let fecha = moment.utc(scanList[0].fecha).format('DD-MM-YYYY');
    let hora = moment.utc(scanList[0].fecha).format('HH:mm:ss');
    let alto = scanList[0].medidas.alto;
    let ancho = scanList[0].medidas.ancho;
    let largo = scanList[0].medidas.largo;
    let peso = scanList[0].medidas.peso;
    let terminal_embarque = scanList[0].travel.terminal_embarque;
    let terminal_destino = scanList[0].travel.terminal_destino;
    let customer = scanList[0].customer;
    let driver = scanList[0].driver;
    let travel = scanList[0].travel.num;
    let zarpe = moment(scanList[0].zarpe).format('DD-MM-YYYY')
    let tipo_carga = scanList[0].tipo_carga;
    let dice_tener = scanList[0].dice_tener;
    let carga_peligrosa = scanList[0].carga_peligrosa;
    let repuesto_neumatico = scanList[0].repuesto_neumatico;
    let observaciones_recepcion = scanList[0].observaciones.recepcion;
    let observaciones_destino = scanList[0].observaciones.destino;
    let categoria_carga = scanList[0].nro_recepcion.replace(/[^a-zA-Z]+/g, '') // 'VM', 'C', etc...

    const documentDefinition = {
      info: {
        title: 'Reporte Nro Orden: ' + nro_recepcion,
        author: 'SAUT',
        subject: 'Reporte de recepción del vehículo con orden: ' + nro_recepcion,
        keywords: 'Reporte',
      },
      content: [
        {
          columns: [
            {
              image: await this.getBase64ImageFromURL(
                "assets/logo-navimag2.png"
              ),
              width: 120,
            },
            [
              {
                text: 'RECEPCIÓN DE CARGA RODADA',
                width: '*',
                fontSize: 12,
                bold: true,
                alignment: 'right',
                margin: [0, 0, 0, 10],
              },
              {
                stack: [
                  {
                    columns: [
                      {
                        text: 'N°.',
                        bold: true,
                        width: '*',
                        fontSize: 10,
                        alignment: 'right',
                      },
                      nro_recepcion,
                    ],
                  },
                ],
              },
            ],
          ],
        },
        '\n',
        {
          table: {
            widths: ["20%", "20%", "20%", "15%", "15%", "10%"],
            headerRows: 2,
            body: [
              [
                { text: 'Terminal\n Embarque', rowSpan: 2, alignment: 'center', margin: [0, 5, 0, 0], fontSize: 10, bold: true },
                { text: 'Terminal\n Destino', rowSpan: 2, alignment: 'center', margin: [0, 5, 0, 0], fontSize: 10, bold: true },
                { text: 'Presentación', colSpan: 2, alignment: 'center', fontSize: 10, bold: true },
                {},
                { text: 'Viaje', rowSpan: 2, alignment: 'center', margin: [0, 10, 0, 0], fontSize: 10, bold: true },
                { text: 'Zarpe', rowSpan: 2, alignment: 'center', margin: [0, 10, 0, 0], fontSize: 10, bold: true },
              ],
              ["", "",
                { text: "Fecha", alignment: 'center', fontSize: 10, bold: true },
                { text: "Hora", alignment: 'center', fontSize: 10, bold: true }
                , "", ""],
              [{ text: terminal_embarque, alignment: 'center', margin: [0, 3, 0, 0], fontSize: 8 },
              { text: terminal_destino, alignment: 'center', margin: [0, 3, 0, 0], fontSize: 8 },
              { text: fecha, alignment: 'center', margin: [0, 3, 0, 0], fontSize: 8 },
              { text: hora, alignment: 'center', margin: [0, 3, 0, 0], fontSize: 8 },
              { text: travel, alignment: 'center', margin: [0, 3, 0, 0], fontSize: 8 },
              { text: zarpe, alignment: 'center', margin: [0, 3, 0, 0], fontSize: 8 }]
            ]
          },
        },
        '\n',
        {
          headerRows: 2,
          table: {
            widths: ['40%', '60%'],
            headerRows: 2,
            body: [
              [
                { text: 'Cliente Embarcador', alignment: 'left', fontSize: 10, bold: true },
                { text: customer.name, alignment: 'center', fontSize: 8, margin: [0, 2, 0, 0] },
              ],
              [
                { text: "Chofer Entrega", alignment: 'left', fontSize: 10, bold: true },
                { text: driver.name+' - '+driver.RUT, alignment: 'center', fontSize: 8, margin: [0, 2, 0, 0] }
              ],
            ]
          },
        },
        '\n\n',
        (categoria_carga == 'VM') ? 
          {
            headerRows: 1,
            table: {
              widths: ['100%'],
              headerRows: 1,
              body: [
                [ {
                  image: await this.getBase64ImageFromURL(
                    "assets/vehiculo_menor.png"
                  ),
                  width: 500,
                  height: 320,
                  alignment: 'center'
                }
                ]
              ]
            },
          } : '',
        (categoria_carga == 'VM') ? '\n\n' : '',
        {
          layout: {
            defaultBorder: false
          },
          headerRows: 2,
          table: {
            widths: ["20%", "20%", "20%", "10%", "20%", "10%"],
            headerRows: 2,
            body: [
              [
                {},
                { text: 'Romaneo', alignment: 'center', fontSize: 10, bold: true, border: [true, true, true, true] },
                {},
                { text: 'Dimensiones', colSpan: 3, alignment: 'center', fontSize: 10, bold: true, border: [true, true, true, true] },
                {},
                {},
              ],
              [{ text: 'Patente', alignment: 'center', fontSize: 10, bold: true, border: [true, true, true, true] },
              { text: 'Peso Total', alignment: 'center', fontSize: 10, bold: true, border: [true, true, true, true] },
              { text: "Largo Rampla", alignment: 'center', fontSize: 10, bold: true, border: [true, true, true, true] },
              { text: "Largo", alignment: 'center', fontSize: 10, bold: true, border: [true, true, true, true] },
              { text: "Ancho", alignment: 'center', fontSize: 10, bold: true, border: [true, true, true, true] },
              { text: "Alto", alignment: 'center', fontSize: 10, bold: true, border: [true, true, true, true] }],
              [{ text: patente, alignment: 'center', margin: [0, 3, 0, 0], fontSize: 8, border: [true, true, true, true] },
              { text: peso, alignment: 'center', margin: [0, 3, 0, 0], fontSize: 8, border: [true, true, true, true] },
              { text: largo, alignment: 'center', margin: [0, 3, 0, 0], fontSize: 8, border: [true, true, true, true] },
              { text: largo, alignment: 'center', margin: [0, 3, 0, 0], fontSize: 8, border: [true, true, true, true] },
              { text: ancho, alignment: 'center', margin: [0, 3, 0, 0], fontSize: 8, border: [true, true, true, true] },
              { text: alto, alignment: 'center', margin: [0, 3, 0, 0], fontSize: 8, border: [true, true, true, true] }]
            ]
          },
        },
        '\n\n',
        {
          layout: {
            defaultBorder: false
          },
          headerRows: 3,
          table: {
            widths: ['25%', '25%', '25%', '25%'],
            headerRows: 3,
            body: [
              [
                { text: 'Tipo Equipo', rowSpan: 3, alignment: 'left', fontSize: 10, bold: true, margin: [0, 10, 0, 0], border: [true, true, false, true] },
                { text: tipo_carga, rowSpan: 3, alignment: 'center', fontSize: 8, margin: [0, 10, 0, 0], border: [false, true, true, true] },
                { text: 'Dice Contener', alignment: 'left', fontSize: 10, bold: true, border: [true, true, true, true] },
                { text: dice_tener, alignment: 'center', fontSize: 8, margin: [0, 3, 0, 0], border: [true, true, true, true] },
              ],
              [
                {},
                {},
                { text: "Carga peligrosa", alignment: 'left', fontSize: 10, bold: true, border: [true, true, true, true] },
                { text: (carga_peligrosa) ? "SI√  NO" : "SI  NO√", alignment: 'center', fontSize: 8, margin: [0, 3, 0, 0], border: [true, true, true, true] }
              ],
              [
                {},
                {},
                { text: "Repuesto Neumático", alignment: 'left', fontSize: 10, bold: true, border: [true, true, true, true] },
                { text: (repuesto_neumatico.lleva) ? "SI√ "+repuesto_neumatico.cuantos : "SI  NO√", alignment: 'center', fontSize: 8, margin: [0, 3, 0, 0], border: [true, true, true, true] }
              ],
            ]
          },
        },
        '\n\n',
        {
          headerRows: 2,
          table: {
            widths: ['100%'],
            headerRows: 2,
            heights: [10, 50],
            body: [
              [
                { text: 'OBSERVACIONES RECEPCIÓN', alignment: 'left', fontSize: 10, bold: true },
              ],
              [
                { text: observaciones_recepcion, alignment: 'left', fontSize: 8 },
              ]
            ]
          },
        },
        '\n\n',
        {
          headerRows: 2,
          table: {
            widths: ['100%'],
            headerRows: 2,
            heights: [10, 50],
            body: [
              [
                { text: 'OBSERVACIONES DESTINO', alignment: 'left', fontSize: 10, bold: true },
              ],
              [
                { text: observaciones_destino, alignment: 'left', fontSize: 8 },
              ]
            ]
          },
        },
        '\n\n',
        {
          headerRows: 2,
          table: {
            widths: ["25%", "25%", "25%", "25%"],
            headerRows: 2,
            body: [
              [
                { text: 'TERMINAL ORIGEN', colSpan: 2, alignment: 'center', fontSize: 10, bold: true },
                {},
                { text: 'TERMINAL DESTINO', colSpan: 2, alignment: 'center', fontSize: 10, bold: true },
                {}
              ],
              [
                { text: "Fuente", alignment: 'center', fontSize: 10, bold: true },
                { text: "Funcionario", alignment: 'center', fontSize: 10, bold: true },
                { text: "Funcionario", alignment: 'center', fontSize: 10, bold: true },
                { text: "Fuente", alignment: 'center', fontSize: 10, bold: true }],
              [{ text: "Nombre", alignment: 'left', margin: [0, 2, 0, 0], fontSize: 8, bold: true },
              { text: "Nombre", alignment: 'left', margin: [0, 2, 0, 0], fontSize: 8, bold: true },
              { text: "Nombre", alignment: 'left', margin: [0, 2, 0, 0], fontSize: 8, bold: true },
              { text: "Nombre", alignment: 'left', margin: [0, 2, 0, 0], fontSize: 8, bold: true }],
              [{ text: "RUT", alignment: 'left', margin: [0, 2, 0, 0], fontSize: 8, bold: true },
              { text: "RUT", alignment: 'left', margin: [0, 2, 0, 0], fontSize: 8, bold: true },
              { text: "RUT", alignment: 'left', margin: [0, 2, 0, 0], fontSize: 8, bold: true },
              { text: "RUT", alignment: 'left', margin: [0, 2, 0, 0], fontSize: 8, bold: true }],
              [{ text: "Firma", alignment: 'left', margin: [0, 2, 0, 0], fontSize: 8, bold: true },
              { text: "Firma", alignment: 'left', margin: [0, 2, 0, 0], fontSize: 8, bold: true },
              { text: "Firma", alignment: 'left', margin: [0, 2, 0, 0], fontSize: 8, bold: true },
              { text: "Firma", alignment: 'left', margin: [0, 2, 0, 0], fontSize: 8, bold: true }],
              [{ text: "Fecha", alignment: 'left', margin: [0, 2, 0, 0], fontSize: 8, bold: true },
              { text: "Fecha", alignment: 'left', margin: [0, 2, 0, 0], fontSize: 8, bold: true },
              { text: "Fecha", alignment: 'left', margin: [0, 2, 0, 0], fontSize: 8, bold: true },
              { text: "Fecha", alignment: 'left', margin: [0, 2, 0, 0], fontSize: 8, bold: true }]
            ]
          },
        },
        
        {
          text: 'NOTA: Terminal de destino Navimag S.A. no se hace responsable de daños posteriores',
          style: 'notesTitle',
          pageBreak: (categoria_carga != 'VM') ? 'after' : '',
        },
        {
          table: {
            widths: ['*', '*'],

            body: [
              [
                { text: 'ANEXOS', colSpan: 2, alignment: 'center', fontSize: 10, bold: true },
                {},
              ],
              
              (categoria_carga != 'VM') ? [await this.getImageperNumber(scan_id, fecha, 31), await this.getImageperNumber(scan_id, fecha, 32)] : [{}, {}],
              (categoria_carga != 'VM') ? [await this.getImageperNumber(scan_id, fecha, 33), await this.getImageperNumber(scan_id, fecha, 34)] : [{}, {}],
              [await this.getImageperNumber(scan_id, fecha, 35), await this.getImageperNumber(scan_id, fecha, 36)],
              [await this.getImageperNumber(scan_id, fecha, 37), await this.getImageperNumber(scan_id, fecha, 38)]
              /*
              (categoria_carga != 'VM') ? [await this.getImageperNumber(scan_id, fecha, 2), await this.getImageperNumber(scan_id, fecha, 3)] : [{}, {}],
              (categoria_carga != 'VM') ? [await this.getImageperNumber(scan_id, fecha, 4), await this.getImageperNumber(scan_id, fecha, 5)] : [{}, {}],
              [await this.getImageperNumber(scan_id, fecha, 6), await this.getImageperNumber(scan_id, fecha, 3)],
              [await this.getImageperNumber(scan_id, fecha, 2), await this.getImageperNumber(scan_id, fecha, 8)]*/
            ]
          },
        }
      ],
      styles: {
        notesTitle: {
          fontSize: 7,
          bold: true,
          margin: [0, 10, 0, 1],
        },
      },
      defaultStyle: {
        columnGap: 20,
      },

    };
    
    this.hideSpinner = false;
    switch (type) {
      case 1:
        pdfMake.createPdf(documentDefinition).open();
        this.Mqtt.publish('client/reload', localStorage.getItem('token'))
        break;
      case 2:
        pdfMake.createPdf(documentDefinition).download('Reporte-Nro-' + nro_recepcion + '.pdf');
        break;
    }
  }
  
  async getImageperNumber(scan_id: String, fecha: String, Ncam: Number) {
    var doc = {};
    let link1 = localStorage.getItem('API_URL');
    let link2 = link1.slice(0, (link1.length - 5));

    console.log(link2+"/upload/scan_id/" + scan_id + "/" + fecha + "/image/" + Ncam + ".jpg");
    
    if (this.fileExists(link2+"/upload/scan_id/" + scan_id + "/" + fecha + "/image/" + Ncam + ".jpg") == false) {
    //if (this.fileExists("/var/www/upload/scan_id/" + scan_id + "/" + fecha + "/image/" + Ncam + ".jpg") == false) {
      doc = {
        image: await this.getBase64ImageFromURL(
          "assets/not_found.png"
        ),
        width: 250,
        height: 180,
        alignment: 'center'
      }
    } else {
      doc = {
        image: await this.getBase64ImageFromURL(
          link2+"/upload/scan_id/" + scan_id + "/" + fecha + "/image/" + Ncam + ".jpg"
          //"/var/www/html/upload/scan_id/" + scan_id + "/" + fecha + "/image/" + Ncam + ".jpg"
        ),
        width: 250,
        height: 180,
        alignment: 'center'
      };
    }
    
    console.log(doc);
    
    return doc;
  }

  getBase64ImageFromURL(url) {
    return new Promise((resolve, reject) => {
      var img = new Image();

      img.setAttribute("crossOrigin", "anonymous");
      img.onload = () => {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        var dataURL = canvas.toDataURL("image/png");
        resolve(dataURL);
      };
      img.onerror = error => {
        reject(error);
      };
      img.src = url;
    });
  }

  fileExists(url: string) {
    if (url) {
      var req = new XMLHttpRequest();
      req.open('GET', url, false);
      req.send();
      return req.status == 200;
    } else {
      return false;
    }
  }

  existTravel(scan){
    return (scan.travel.new_travel != scan.travel.num) ?
       ((this.travelList.some(t => t.num == scan.travel.new_travel)) ? true : false) : false
       
  }

  async changeScanTravel(scan){
    scan.travel = this.travelList.filter(t => t.num == scan.travel.new_travel)[0]
    await this.scanService.changeScanTravel(scan)

    this.Mqtt.publish('scan/travel_changed', { text : 'La carga '+scan.nro_recepcion+' fue reasignada al viaje Nª'+scan.travel.num, token : localStorage.getItem('token')} );
    this.snackbar.open('Viaje modificado correctamente', 'Close', { duration: 2000 });
  }

  async showGallery(scan_id){
    this.hideSpinner = true;
    let scanList = await this.scanService.getOneHistoric(scan_id);
    let fecha = moment(scanList[0].fecha).format('DD-MM-YYYY');

    let imgList = []
    /*
    imgList.push(await this.getImageperNumber(scan_id, fecha, 2))
    imgList.push(await this.getImageperNumber(scan_id, fecha, 3))
    imgList.push(await this.getImageperNumber(scan_id, fecha, 4))
    imgList.push(await this.getImageperNumber(scan_id, fecha, 5))
    imgList.push(await this.getImageperNumber(scan_id, fecha, 6))
    imgList.push(await this.getImageperNumber(scan_id, fecha, 3))
    imgList.push(await this.getImageperNumber(scan_id, fecha, 2))
    imgList.push(await this.getImageperNumber(scan_id, fecha, 8))
    */

    imgList.push(await this.getImageperNumber(scan_id, fecha, 31))
    imgList.push(await this.getImageperNumber(scan_id, fecha, 32))
    imgList.push(await this.getImageperNumber(scan_id, fecha, 33))
    imgList.push(await this.getImageperNumber(scan_id, fecha, 34))
    imgList.push(await this.getImageperNumber(scan_id, fecha, 35))
    imgList.push(await this.getImageperNumber(scan_id, fecha, 36))
    imgList.push(await this.getImageperNumber(scan_id, fecha, 37))
    imgList.push(await this.getImageperNumber(scan_id, fecha, 38))
    
    
    this.hideSpinner = false;
    
    const dialogRef = this.dialog.open(GalleryComponent, {
      width: '55%',
      position: {top: '2px'},
      data: { files : imgList }
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

}
