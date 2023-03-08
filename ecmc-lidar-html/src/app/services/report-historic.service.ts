import { Injectable } from '@angular/core';
import * as fs from 'file-saver';
import * as logoFile from './mylogo.js';
import { Scan } from 'src/app/models/scan';
import { ScanService } from 'src/app/services/scan.service';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class ReportHistoricService {

  scanList: Scan[];

  constructor(private scanService: ScanService) {}

  async generateExcelbyTravel(travel: Number) {
    
    var p  = await this.scanService.getHistoricobytravel(travel);
    
    let result = p.map((ite: any) => [(ite.nro_reserva == 0 ? 'S/R' : ite.nro_reserva.toString()), moment(ite.fecha).format("DD-MM-YYYY"), moment.utc(ite.fecha).format("HH:mm:ss"), 
    ite.travel.num.toString(), ite.ruta, ite.rut, (ite.patente2) ? ite.patente+' / '+ite.patente2 : ite.patente, ite.embarcador, ite.mi, ite.peso, ite.equipo, ite.driver, ite.nro_recepcion,
    ite.sa, ite.dice_contener, ite.observaciones.recepcion]);

    const Excel = require('exceljs');

    const header = ["Reserva", "Fecha Presentación", "Hora Presentación", "Nro Viaje", "Ruta", "RUT Cliente", "Patente", "Cliente Embarcador",
    "MI", "Peso(Kg)", "Tipo Equipo", "Chofer Entrega", "N° Recepción", "S/A (Sobre Ancho)", "Dice Contener", "Observaciones"]

    const workbook = new Excel.Workbook();
    let worksheet = workbook.addWorksheet('Recepción de carga');

    let logo = workbook.addImage({
      base64: logoFile.logoBase64,
      extension: 'png',
    });
    worksheet.addImage(logo, {
      tl: {
        col: 1, row: 0.5
      },
      ext: { width: 120, height: 100 }
    });
    worksheet.mergeCells('A1:B6');


    worksheet.addTable({
      name: 'Tabla de Recepción',
      ref: 'A8',
      headerRow: true,
      totalsRow: false,
      style: {
        theme: 'TableStyleDark3',
        showRowStripes: true,
      },
      columns: [
        { name: header[0], filterButton: true },
        { name: header[1], filterButton: true },
        { name: header[2], filterButton: true },
        { name: header[3], filterButton: true },
        { name: header[4], filterButton: true },
        { name: header[5], filterButton: true },
        { name: header[6], filterButton: true },
        { name: header[7], filterButton: true },
        { name: header[8], filterButton: true },
        { name: header[9], filterButton: true },
        { name: header[10], filterButton: true },
        { name: header[11], filterButton: true },
        { name: header[12], filterButton: true },
        { name: header[13], filterButton: true },
        { name: header[14], filterButton: true },
        { name: header[15], filterButton: true }
      ],
      rows: result,
    });

    worksheet.addRows([]);


    worksheet.getColumn(1).width = 10;
    worksheet.getColumn(2).width = 20;
    worksheet.getColumn(3).width = 20;
    worksheet.getColumn(4).width = 10;
    worksheet.getColumn(5).width = 30;
    worksheet.getColumn(6).width = 20;
    worksheet.getColumn(7).width = 40;
    worksheet.getColumn(8).width = 30;
    worksheet.getColumn(9).width = 10;
    worksheet.getColumn(10).width = 20;
    worksheet.getColumn(11).width = 20;
    worksheet.getColumn(12).width = 20;
    worksheet.getColumn(13).width = 30;
    worksheet.getColumn(14).width = 30;
    worksheet.getColumn(15).width = 50;
    

    workbook.xlsx.writeBuffer().then((data:any) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, 'Reportes-Recepción-viaje-nro-' + travel.toString() + '.xlsx');
    })
  }

  async generateExcelByRange(date1 : string, date2: string) {

    var p = await this.scanService.getHistoricobyrange(date1, date2);
    
    let result = p.map((ite: any) => [(ite.nro_reserva == 0 ? 'S/R' : ite.nro_reserva.toString()), moment(ite.fecha).format("DD-MM-YYYY"), moment.utc(ite.fecha).format("HH:mm:ss"), 
    ite.travel.num.toString(), ite.ruta, ite.rut, (ite.patente2) ? ite.patente+' / '+ite.patente2 : ite.patente, ite.embarcador, ite.mi, ite.peso, ite.equipo, ite.driver, ite.nro_recepcion,
    ite.sa, ite.dice_contener, ite.observaciones.recepcion]);

    const Excel = require('exceljs');

    const header = ["Reserva", "Fecha Presentación", "Hora Presentación", "Nro Viaje", "Ruta", "RUT Cliente", "Patente", "Cliente Embarcador",
    "MI", "Peso(Kg)", "Tipo Equipo", "Chofer Entrega", "N° Recepción", "S/A (Sobre Ancho)", "Dice Contener", "Observaciones"]

    const workbook = new Excel.Workbook();
    let worksheet = workbook.addWorksheet('Recepción de carga');

    let logo = workbook.addImage({
      base64: logoFile.logoBase64,
      extension: 'png',
    });
    worksheet.addImage(logo, {
      tl: {
        col: 1, row: 0.5
      },
      ext: { width: 120, height: 100 }
    });
    worksheet.mergeCells('A1:B6');


    worksheet.addTable({
      name: 'Tabla de Recepción',
      ref: 'A8',
      headerRow: true,
      totalsRow: false,
      style: {
        theme: 'TableStyleDark3',
        showRowStripes: true,
      },
      columns: [
        { name: header[0], filterButton: true },
        { name: header[1], filterButton: true },
        { name: header[2], filterButton: true },
        { name: header[3], filterButton: true },
        { name: header[4], filterButton: true },
        { name: header[5], filterButton: true },
        { name: header[6], filterButton: true },
        { name: header[7], filterButton: true },
        { name: header[8], filterButton: true },
        { name: header[9], filterButton: true },
        { name: header[10], filterButton: true },
        { name: header[11], filterButton: true },
        { name: header[12], filterButton: true },
        { name: header[13], filterButton: true },
        { name: header[14], filterButton: true },
        { name: header[15], filterButton: true }
      ],
      rows: result,
    });

    worksheet.addRows([]);


    worksheet.getColumn(1).width = 10;
    worksheet.getColumn(2).width = 20;
    worksheet.getColumn(3).width = 20;
    worksheet.getColumn(4).width = 10;
    worksheet.getColumn(5).width = 30;
    worksheet.getColumn(6).width = 20;
    worksheet.getColumn(7).width = 40;
    worksheet.getColumn(8).width = 30;
    worksheet.getColumn(9).width = 10;
    worksheet.getColumn(10).width = 20;
    worksheet.getColumn(11).width = 20;
    worksheet.getColumn(12).width = 20;
    worksheet.getColumn(13).width = 30;
    worksheet.getColumn(14).width = 30;
    worksheet.getColumn(15).width = 50;

    workbook.xlsx.writeBuffer().then((data:any) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, 'Reportes-Recepción-desde-' + date1 +'hasta-' + date2 + '.xlsx');
    })
  }
}


