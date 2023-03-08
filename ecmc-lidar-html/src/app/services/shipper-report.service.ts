import { Injectable } from '@angular/core';
import * as fs from 'file-saver';
import * as logoFile from './mylogo.js';
import { TravelService } from 'src/app/services/travel.service';

@Injectable({
  providedIn: 'root'
})

export class ShipperReportService {
  constructor(private travelService: TravelService) { }

  async generateDecksDetailExcel(travel: Number) {
    var decks  = await this.travelService.getShipLayout(travel); //Cubiertas que poseen registros para esta nave
    
    const Excel = require('exceljs');
    const header = ["N", "PATENTE", "CLIENTE", "M/L", "KILOS", "TIPO EQUIPO"]
    const workbook = new Excel.Workbook();
    let worksheet = workbook.addWorksheet('Plan de Carga');

    let logo = workbook.addImage({
      base64: logoFile.logoBase64,
      extension: 'png',
    });

    worksheet.addImage(logo, {
      tl: { col: 1, row: 0.5 },
      ext: { width: 120, height: 100 }
    });
    worksheet.mergeCells('A1:B6');
    
    // Almacenara los scans de cada cubierta si corresponde
    let superior_rows = []
    let principal_rows = []
    let bodega_rows = []
    let condicional_rows = []
    let totals_row = []

    console.log(decks);
    decks.forEach((deck : any) => {
      switch(deck.id){
        case 0:
          condicional_rows = deck.scans.map((ite: any, i) => [i + 1,
                                                            (ite.patente2) ? ite.patente+' / '+ite.patente2 : ite.patente,
                                                            ite.customer.name+"/"+ite.customer.RUT,
                                                            ite.medidas.largo,
                                                            ite.medidas.peso,
                                                            ite.equipo   ])

          let sum_peso = condicional_rows.reduce(function(sum, scan : any) { return sum + scan[3] }, 0);
          let sum_largo = condicional_rows.reduce(function(sum, scan : any) { return sum + scan[4] }, 0);
          
          totals_row.push([ { name : "TOTAL C." , peso: sum_peso , largo : sum_largo }])

        break;
        case 1:
          superior_rows = deck.scans.map((ite: any, i) => [i + 1,
                                                            (ite.patente2) ? ite.patente+' / '+ite.patente2 : ite.patente,
                                                            ite.customer.name+"/"+ite.customer.RUT,
                                                            ite.medidas.largo,
                                                            ite.medidas.peso,
                                                            ite.equipo   ])
          
          sum_peso = superior_rows.reduce(function(sum, scan : any) { return sum + scan[3] }, 0);
          sum_largo = superior_rows.reduce(function(sum, scan : any) { return sum + scan[4] }, 0);
          
          totals_row.push([ { name : "TOTAL CBTA.SUP." , peso: sum_peso , largo : sum_largo }])
        break;
        case 2:
          principal_rows = deck.scans.map((ite: any, i) => [i + 1,
                                                            (ite.patente2) ? ite.patente+' / '+ite.patente2 : ite.patente,
                                                            ite.customer.name+"/"+ite.customer.RUT,
                                                            ite.medidas.largo,
                                                            ite.medidas.peso,
                                                            ite.equipo   ])

          sum_peso = principal_rows.reduce(function(sum, scan : any) { return sum + scan[3] }, 0);
          sum_largo = principal_rows.reduce(function(sum, scan : any) { return sum + scan[4] }, 0);
          

          totals_row.push([ { name : "TOTAL CBTA.PPAL." , peso: sum_peso , largo : sum_largo }])                        
        break;
        case 3:
          bodega_rows = deck.scans.map((ite: any, i) => [i + 1,
                                                            (ite.patente2) ? ite.patente+' / '+ite.patente2 : ite.patente,
                                                            ite.customer.name+"/"+ite.customer.RUT,
                                                            ite.medidas.largo,
                                                            ite.medidas.peso,
                                                            ite.equipo   ])
              
          sum_peso = bodega_rows.reduce(function(sum, scan : any) { return sum + scan[3] }, 0);
          sum_largo = bodega_rows.reduce(function(sum, scan : any) { return sum + scan[4] }, 0);
        
          totals_row.push([ { name : "TOTAL B." , peso: sum_peso , largo : sum_largo }])
                                                            
        break;
        default:
        
        break;
      }
    })

    //Cubierta con mas registros
    var max_cubierta = Math.max.apply(Math, [superior_rows.length, principal_rows.length, bodega_rows.length, condicional_rows.length]); 
    

    let ref_ini = 0
    let ref_fin = 5

    ////////////////////////////////////////////////////////////////////
    ////////////////////// CUBIERTA SUPERIOR ///////////////////////////
    ////////////////////////////////////////////////////////////////////

    if(superior_rows.length > 0){

      worksheet.addTable({
        ref: this.colName(ref_ini)+7,
        columns: [
            { name: 'CUBIERTA SUPERIOR', filterButton: true },
        ],
        rows: [],
      });

      worksheet.getCell(this.colName(ref_ini)+7).alignment = { vertical : 'top', horizontal : 'center' };
      worksheet.getCell(this.colName(ref_ini)+7).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb:'193dcad9' } };
    
      worksheet.mergeCells(this.colName(ref_ini)+7+':'+this.colName(ref_fin)+7);

      worksheet.addTable({
        name: 'CUBIERTA SUPERIOR',
        ref: this.colName(ref_ini)+8,
        headerRow: true,
        totalsRow: false,
        columns: [
          { name: header[0], filterButton: true },
          { name: header[1], filterButton: true },
          { name: header[2], filterButton: true },
          { name: header[3], filterButton: true },
          { name: header[4], filterButton: true },
          { name: header[5], filterButton: true }
        ],
        rows: superior_rows,
      });
      worksheet.addRows([]);

      worksheet.getColumn(ref_ini+1).width = 3;
      worksheet.getColumn(ref_ini+2).width = 15;
      worksheet.getColumn(ref_ini+3).width = 40;
      worksheet.getColumn(ref_ini+4).width = 10;
      worksheet.getColumn(ref_ini+5).width = 10;
      worksheet.getColumn(ref_ini+6).width = 30;

      ref_ini += 6
      ref_fin += 6
    }

    ////////////////////////////////////////////////////////////////////
    ////////////////////// CUBIERTA PRINCIPAL //////////////////////////
    ////////////////////////////////////////////////////////////////////

    if(principal_rows.length > 0){
      
      worksheet.addTable({
          ref: this.colName(ref_ini)+7,
          columns: [
              { name: 'CUBIERTA PRINCIPAL', filterButton: true }
          ],
          rows: [],
      });

      worksheet.getCell(this.colName(ref_ini)+7).alignment = { vertical : 'top', horizontal : 'center' };
      worksheet.getCell(this.colName(ref_ini)+7).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb:'2170ff69' } };
    
      worksheet.mergeCells(this.colName(ref_ini)+7+':'+this.colName(ref_fin)+7);
                                              
      worksheet.addTable({
        name: 'CUBIERTA PRINCIPAL',
        ref: this.colName(ref_ini)+8,
        headerRow: true,
        totalsRow: false,
        columns: [
          { name: header[0], filterButton: true },
          { name: header[1], filterButton: true },
          { name: header[2], filterButton: true },
          { name: header[3], filterButton: true },
          { name: header[4], filterButton: true },
          { name: header[5], filterButton: true }
        ],
        rows: principal_rows,
      });
      worksheet.addRows([]);

      worksheet.getColumn(ref_ini+1).width = 3;
      worksheet.getColumn(ref_ini+2).width = 15;
      worksheet.getColumn(ref_ini+3).width = 40;
      worksheet.getColumn(ref_ini+4).width = 10;
      worksheet.getColumn(ref_ini+5).width = 10;
      worksheet.getColumn(ref_ini+6).width = 30;
      
      ref_ini += 6
      ref_fin += 6
    }
    ////////////////////////////////////////////////////////////////////
    ////////////////////// BODEGA (DE EXISTIR) /////////////////////////
    ////////////////////////////////////////////////////////////////////

    if(bodega_rows.length > 0){

      worksheet.addTable({
        ref: this.colName(ref_ini)+7,
        columns: [
            { name: 'BODEGA', filterButton: true },
        ],
        rows: [],
      });

      worksheet.getCell(this.colName(ref_ini)+7).alignment = { vertical : 'top', horizontal : 'center' };
      worksheet.getCell(this.colName(ref_ini)+7).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb:'281baca2' } };
    
      worksheet.mergeCells(this.colName(ref_ini)+7+':'+this.colName(ref_fin)+7);

      worksheet.addTable({
        name: 'BODEGA',
        ref: this.colName(ref_ini)+8,
        headerRow: true,
        totalsRow: false,
        columns: [
          { name: header[0], filterButton: true },
          { name: header[1], filterButton: true },
          { name: header[2], filterButton: true },
          { name: header[3], filterButton: true },
          { name: header[4], filterButton: true },
          { name: header[5], filterButton: true }
        ],
        rows: bodega_rows,
      });
      worksheet.addRows([]);

      worksheet.getColumn(ref_ini+1).width = 3;
      worksheet.getColumn(ref_ini+2).width = 15;
      worksheet.getColumn(ref_ini+3).width = 40;
      worksheet.getColumn(ref_ini+4).width = 10;
      worksheet.getColumn(ref_ini+5).width = 10;
      worksheet.getColumn(ref_ini+6).width = 30;

      ref_ini += 6
      ref_fin += 6
    }
  
    ///////////////////////////////////////////////////////////////////////////
    ////////////////////// CONDICIONALES (DE EXISTIR) /////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    if(condicional_rows.length > 0){
        
        worksheet.addTable({
          ref: this.colName(ref_ini)+7,
          columns: [
              { name: 'CONDICIONALES', filterButton: true },
          ],
          rows: [],
        });
        
        worksheet.getCell(this.colName(ref_ini)+7).alignment = { vertical : 'top', horizontal : 'center' };
        worksheet.getCell(this.colName(ref_ini)+7).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb:'1f10aa69' } };
      
        worksheet.mergeCells(this.colName(ref_ini)+7+':'+this.colName(ref_fin)+7);

        worksheet.addTable({
          name: 'RECEPCIONADO FUERA DE LISTA Y CONDICIONALES',
          ref: this.colName(ref_ini)+8,
          headerRow: true,
          totalsRow: false,
          columns: [
            { name: header[0], filterButton: true },
            { name: header[1], filterButton: true },
            { name: header[2], filterButton: true },
            { name: header[3], filterButton: true },
            { name: header[4], filterButton: true },
            { name: header[5], filterButton: true }
          ],
          rows: condicional_rows,
        });
        worksheet.addRows([]);

        worksheet.getColumn(ref_ini+1).width = 3;
        worksheet.getColumn(ref_ini+2).width = 15;
        worksheet.getColumn(ref_ini+3).width = 40;
        worksheet.getColumn(ref_ini+4).width = 10;
        worksheet.getColumn(ref_ini+5).width = 10;
        worksheet.getColumn(ref_ini+6).width = 30;

    }
    
    //////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////

    ///// TOTALES PARA CADA CUBIERTA /////
    let row_num = max_cubierta + 15

    let arr_totales = []
    totals_row.forEach((t) => {
      arr_totales.push(["", "", t[0].name, t[0].peso, t[0].largo, ""])
    })

    worksheet.insertRow(row_num, []);

    let row = worksheet.addRow([].concat(...arr_totales))
    row.alignment = {
      vertical : 'top', 
      horizontal : 'right'
    };

    var that = this
    let arr_cells = [].concat(...arr_totales).map(function(item, i) { return that.colName(i)+(row_num+1) });

    arr_cells.map(key => { 
      worksheet.getCell(key).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '96C8FB' }, 
        bgColor: { argb: '96C8FB' }
      };
    });
    ////////////////////////////////////////
    
    ///// CUADRO GENERAL DE TOTALES /////

    row_num += 10
    worksheet.insertRow(row_num, ["","",'TOTALES X CUBIERTA', 'ML', 'TONS'])

    for(let k = 2; k < 5 ; k++){
      worksheet.mergeCells(this.colName(k)+row_num+':'+this.colName(k)+(row_num+1));
      worksheet.getCell(this.colName(k)+row_num).alignment = { vertical : 'middle', horizontal : 'center' };
      worksheet.getCell(this.colName(k)+row_num).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '3338FB' },
        bgColor: { argb: '3338FB' }
      };
    }
   
    let peso_total = totals_row.reduce(function(sum, total) { return sum + total[0]['peso'] }, 0);
    let largo_total = totals_row.reduce(function(sum, total) { return sum + total[0]['largo'] }, 0);

    totals_row.push([{ name : "CARGA TOTAL", largo : largo_total, peso: peso_total }])
    totals_row.forEach((total) => {
      row_num += 2
      worksheet.insertRow(row_num, total.map(function(ite) { return ["", "", ite.name, ite.peso, ite.largo] })[0]);
      for(let k = 2; k < 5 ; k++){
        worksheet.mergeCells(this.colName(k)+row_num+':'+this.colName(k)+(row_num+1));
        worksheet.getCell(this.colName(k)+row_num).alignment = { vertical : 'middle', horizontal : 'center' };
        worksheet.getCell(this.colName(k)+row_num).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '3338FB' },
          bgColor: { argb: '3338FB' }
        };
      }
    })
    ////////////////////////////////////////

    workbook.xlsx.writeBuffer().then((data:any) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, 'PLAN_DE_CARGA_VIAJE-' + travel.toString() + '.xlsx');
    })
  }
  
  colName(n) {
    var ordA = 'a'.charCodeAt(0);
    var ordZ = 'z'.charCodeAt(0);
    var len = ordZ - ordA + 1;
  
    var s = "";
    while(n >= 0) {
        s = String.fromCharCode(n % len + ordA) + s;
        n = Math.floor(n / len) - 1;
    }
    return s.toUpperCase();
  }

}
