import { Component, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { MatOptionSelectionChange } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Ferry } from 'src/app/models/ferry';
import { Scan } from 'src/app/models/scan';
import { Travel } from 'src/app/models/travel';

import { FerryService } from 'src/app/services/ferry.service';
import { MqttService } from 'src/app/services/mqtt.service';
import { ScanService } from 'src/app/services/scan.service';
import { ShipperReportService } from 'src/app/services/shipper-report.service';
import { TravelService } from 'src/app/services/travel.service';
import { ReportHistoricService } from 'src/app/services/report-historic.service';

import { faSave, faShip, faFileExcel, faEdit, faRoute, faSearch, faBan } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import * as Highcharts from 'highcharts';

require('highcharts/highcharts-3d')(Highcharts);
require('highcharts/highcharts-more')(Highcharts);

@Component({
  selector: 'app-shipper',
  templateUrl: './shipper.component.html',
  styleUrls: ['./shipper.component.scss']
})
export class ShipperComponent implements OnInit {
  
  @Output() notifications = [];
  unread_notifications = 0
  title = "Navimag - ECMC Lidar"

  formGroup: FormGroup;
  travel: Travel = { num : null, terminal_embarque : '', terminal_destino: '', zarpe : null, embarked: false };
  ferry: Ferry = { name : '', ferry_decks : [], decks:[], color: '' };
  scanSelected = '';
  orderScansValue : number = 0;
  ferries : Array<Ferry> = [];
  genericFilter = new FormControl();
  travelFilter = new FormControl();

  faSave = faSave;
  faShip = faShip;
  faEdit = faEdit;
  faBan  = faBan;
  faRoute = faRoute;
  faFileExcel = faFileExcel;
  faSearch = faSearch;

  //Rangos de fechas
  range : FormGroup
  ran_ini : string;
  ran_fin : string;

  filteredTravels: Observable<string[]>;

  pendingTravels = [];
  embarkedTravels : any[] = [];
  embarkedTravelScans : any[] = []
  scanList: Scan[] = [];

  ds_scansToAssign: MatTableDataSource<Scan>;
  ds_embarkedTravels : MatTableDataSource<any>;
  ds_embarkedTravelScans : MatTableDataSource<any>;

  @ViewChild('travelsPaginator', { read: MatPaginator }) travelsPaginator: MatPaginator;
  @ViewChild('travelScansPaginator', { read: MatPaginator }) travelScansPaginator: MatPaginator;

  displayColumns = ['num','nro_recepcion','patente','travel','customer_name','customer_rut','load_category','load_type','load','peso', 'alto','largo', 'ancho', 'fecha', 'assign']
  travelInfo : Array<any> = [
    {name: 'Viaje N°' },
    {name: 'Ruta:'},
    {name: 'Zarpe:' }
  ];
  shippingInfo : Array<any> = [
    {name: 'PPAL:' },
    {name: 'SUP:' },
    {name: 'B:' },
    {name: 'C:' }
  ];

  filteredValues = { generic: '' }
  filteredTravelValues = { num: '' }

  public embarkChart = Highcharts;
  public embarkChartUpd: boolean = false;
  public embarkChartOpt: any = {};
 
  constructor(private formBuilder: FormBuilder, private snackbar: MatSnackBar, private ferryService: FerryService, 
              private travelService: TravelService, private scanService: ScanService, private reportHistoricService: ReportHistoricService,
              private shipperReportService : ShipperReportService, private Mqtt: MqttService, private titleService: Title) { 
    this.ds_scansToAssign = new MatTableDataSource(this.scanList)
    this.ds_embarkedTravels = new MatTableDataSource(this.embarkedTravels)
    this.ds_embarkedTravelScans = new MatTableDataSource(this.embarkedTravelScans)
  }

  
  ngOnInit(): void {
    
    this.getFerries()
    this.getPendingTravels()
    this.getEmbarkedTravels()
    
    this.Mqtt
    .getMessages(['travel/added', 'travel/updated', 'travel/deleted', 'scan/travel_changed', 'scan/new_scan'])
    .subscribe(({ message, topic })=>{
        if(!this.travel.num){ //Por si está justo revisando un viaje
          this.resetAll()
        }
      })
    
  }
  async getFerries(){
    this.ferries = await this.ferryService.list();
  }

  async getPendingTravels(){
    this.pendingTravels = await this.travelService.getPendingTravels()
    
    this.scanList = []
    
    this.pendingTravels.forEach((pendingTravel)=>{
      pendingTravel.scans = (pendingTravel.scans).filter((scan)=> scan._id); //Filtro para casos condicionales
      Array.prototype.push.apply(this.scanList, pendingTravel.scans); //Push to scanList
    })
    
    this.ds_scansToAssign = new MatTableDataSource(this.scanList);
    
    this.genericFilter.valueChanges.subscribe((genericFilterValue) => {
      this.filteredValues['generic'] = genericFilterValue;
      this.ds_scansToAssign.filter = JSON.stringify(this.filteredValues);
    });
    this.ds_scansToAssign.filterPredicate = this.customFilterPredicate();
  }

  customFilterPredicate() {
    const myFilterPredicate = function (data: Scan, filter: string): boolean {
      let searchString = JSON.parse(filter);
      let genericFound = data.nro_recepcion.toString().trim().toLowerCase().indexOf(searchString.generic.toLowerCase()) !== -1 || 
                         data.patente.toString().trim().toLowerCase().indexOf(searchString.generic.toLowerCase()) !== -1 || 
                         data.customer['name'].toString().trim().toLowerCase().indexOf(searchString.generic.toLowerCase()) !== -1 || 
                         data.customer['RUT'].toString().trim().toLowerCase().indexOf(searchString.generic.toLowerCase()) !== -1 ||
                         data.categoria_carga.toString().trim().toLowerCase().indexOf(searchString.generic.toLowerCase()) !== -1 ||
                         data.tipo_carga.toString().trim().toLowerCase().indexOf(searchString.generic.toLowerCase()) !== -1 || 
                         data.carga.toString().trim().toLowerCase().indexOf(searchString.generic.toLowerCase()) !== -1
      
      return genericFound
    }
    return myFilterPredicate;
  }

  customTravelFilterPredicate() {
    const myFilterPredicate = function (data: Travel, filter: string): boolean {
      let searchString = JSON.parse(filter);
      let numFound = data.num.toString().trim().toLowerCase().indexOf(searchString.num.toLowerCase()) !== -1
      
      return numFound
    }
    return myFilterPredicate;
  }

  async getEmbarkedTravels(){
    this.embarkedTravels = await this.travelService.getEmbarkedTravels()
    this.embarkedTravels.forEach((embarkedTravel)=>{
      embarkedTravel.scans = (embarkedTravel.scans).filter((scan)=> scan._id); //Filtro para casos condicionales
    })
    this.ds_embarkedTravels = new MatTableDataSource(this.embarkedTravels);

    this.travelFilter.valueChanges.subscribe((travelFilterValue) => {
      this.filteredTravelValues['num'] = travelFilterValue;
      this.ds_embarkedTravels.filter = JSON.stringify(this.filteredTravelValues);
    });
    this.ds_embarkedTravels.filterPredicate = this.customTravelFilterPredicate();
  }

  async getTravelInfo(travel){
    this.scanList = this.pendingTravels.filter(t => t.num === travel.num)[0].scans
    this.ds_scansToAssign = new MatTableDataSource(this.scanList);

    this.genericFilter.valueChanges.subscribe((genericFilterValue) => {
      this.filteredValues['generic'] = genericFilterValue;
      this.ds_scansToAssign.filter = JSON.stringify(this.filteredValues);
    });
    this.ds_scansToAssign.filterPredicate = this.customFilterPredicate();

    this.travel = (await this.travelService.getTravel(travel.num))[0];
    this.ferry = this.ferries.filter(f => f.name === this.travel.ferry)[0];

    this.travelInfo[0].value = this.travel.num
    this.travelInfo[1].value = this.travel.terminal_embarque+'/'+this.travel.terminal_destino
    this.travelInfo[2].value = moment(this.travel.zarpe).format('DD-MM-YYYY')

    this.genericFilter.setValue('')
    this.fillDecksChart(this.ds_scansToAssign);
  }

  async getEmbarkedTravelInfo(travel){
    this.embarkedTravelScans = this.embarkedTravels.filter(t => t.num === travel.num)[0].scans
    this.ds_embarkedTravelScans = new MatTableDataSource(this.embarkedTravelScans);

    this.genericFilter.valueChanges.subscribe((genericFilterValue) => {
      this.filteredValues['generic'] = genericFilterValue;
      this.ds_embarkedTravelScans.filter = JSON.stringify(this.filteredValues);
    });
    this.ds_embarkedTravelScans.filterPredicate = this.customFilterPredicate();
    
    this.travel = (await this.travelService.getTravel(travel.num))[0];

    this.ferry = this.ferries.filter(f => f.name === this.travel.ferry)[0];

    this.travelInfo[0].value = this.travel.num
    this.travelInfo[1].value = this.travel.terminal_embarque+'/'+this.travel.terminal_destino
    this.travelInfo[2].value = moment(this.travel.zarpe).format('DD-MM-YYYY')

    this.genericFilter.setValue('')
    this.fillDecksChart(this.ds_embarkedTravelScans);
  }

  fillDecksChart(scanList){
    var that = this
    this.embarkChartOpt = {
      chart: {
        type: 'pie',
        backgroundColor: "rgba(0,0,0,0)",
        height: 250
      },
      title:{
        text: null
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      plotOptions: {
        pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
                enabled: true,
                format: '<b>{point.abbreviation}</b>: {point.sum}'
            }
        }
      },
      yAxis: {
          title: {
              text: 'Total ($)'
          }
      },
      series: [{
        name: 'Porcentaje',
        colorByPoint: true,
        data: [
          {
            name: 'Superior',
            abbreviation: 'SUP',
            id: 1
          },
          {
            name: 'Principal',
            abbreviation: 'PPAL',
            id : 2
          },
          {
            name: 'Bodega',
            abbreviation: 'B',
            id: 3
          },
          {
            name: 'Conidicional',
            abbreviation: 'C',
            id: 0
          },
          {
            name: 'Sin Asignar',
            abbreviation: 'S.A',
            id: null
          }
        ],
        dataLabels: {
          enabled: true,
          yHigh: 20,
          yLow: -20,
          style: {
              color: 'white',
              fontSize: '12px',
              textShadow: '0px 1px 2px black '
          }
        },
        point: {
          events: {
            click: function(event) {
              let deck_id = (!this.selected) ? event.point.id : null
              that.filterByDeckId(deck_id)
            }
          }
        }
      }],
      credits: false
    };

    let cont_condicionales = scanList.filteredData.reduce(function(sum, scan : any) {
      try{  return (scan.deck_assign.deck.id == 0) ? sum + 1 : sum; } 
      catch(e){  return sum }
     }, 0);
     
    let cont_superior = scanList.filteredData.reduce(function(sum, scan : any) {
      try{  return (scan.deck_assign.deck.id == 1) ? sum + 1 : sum; } 
      catch(e){  return sum }
     }, 0);
    
    let cont_principal = scanList.filteredData.reduce(function(sum, scan : any) {
      try{  return (scan.deck_assign.deck.id == 2) ? sum + 1 : sum; } 
      catch(e){  return sum }
     }, 0);

    let cont_bodega = scanList.filteredData.reduce(function(sum, scan : any) {
      try{  return (scan.deck_assign.deck.id == 3) ? sum + 1 : sum; } 
      catch(e){  return sum }
     }, 0);

    var total = scanList.filteredData.length
    

    this.embarkChartOpt.series[0].data[0].sum = cont_superior
    this.embarkChartOpt.series[0].data[0].y = cont_superior*100/total

    this.embarkChartOpt.series[0].data[1].sum = cont_principal
    this.embarkChartOpt.series[0].data[1].y = cont_principal*100/total

    this.embarkChartOpt.series[0].data[2].sum = cont_bodega
    this.embarkChartOpt.series[0].data[2].y = cont_bodega*100/total

    this.embarkChartOpt.series[0].data[3].sum = cont_condicionales
    this.embarkChartOpt.series[0].data[3].y = cont_condicionales*100/total

    this.embarkChartOpt.series[0].data[4].sum = (total - cont_principal - cont_superior - cont_bodega - cont_condicionales)
    this.embarkChartOpt.series[0].data[4].y = (total - cont_principal - cont_superior - cont_bodega - cont_condicionales)*100/total
    
    this.embarkChartUpd = true;
  }

  async filterByDeckId(deck_id: any) {
    if(deck_id){
      let embarkedTravelScans = this.embarkedTravelScans.filter(s => s.deck_assign.deck.id === deck_id)
      this.ds_embarkedTravelScans = new MatTableDataSource(embarkedTravelScans);
      
    } else
      this.ds_embarkedTravelScans = new MatTableDataSource(this.embarkedTravelScans);
  }
  
  spliceScanFirst(nro_recepcion){
    this.scanSelected = nro_recepcion;
    var that = this
    this.scanList.forEach(function(s,i){
      if(s.nro_recepcion === nro_recepcion){
        that.scanList.splice(i, 1);
        that.scanList.unshift(s);
      }
    });
  }

  async assignDeck(event: MatOptionSelectionChange, scan, deck){
    if (event.source.selected){
      if(!scan.deck_assign || (scan.deck_assign.deck.name != deck.name)){ //Si aún no tiene asignada una cubierta o si la que ya tenia asignada es distinta a la entrante
        scan.deck_assign =  { ferry : this.ferry.name, deck : deck, date : new Date() }
        await this.scanService.assignDeck(scan)        
        
        this.snackbar.open('Cambios guardados correctamente', 'Close', { duration: 2000 });
        this.pendingTravels = await this.travelService.getPendingTravels()
        this.pendingTravels.forEach((pendingTravel)=>{
          pendingTravel.scans = (pendingTravel.scans).filter((scan)=> scan._id); //Filtro para casos condicionales
          Array.prototype.push.apply(this.scanList, pendingTravel.scans); //Push to scanList
        })
       
        this.getTravelInfo(this.travel)
        this.spliceScanFirst(this.scanSelected);
      }
    }
  }
  
  async finishTravel(){
    if(confirm('¿Está seguro que desea dar por finalizado este viaje?')){
      await this.travelService.finishTravel(this.travel.num, this.embarkedTravelScans)

      this.snackbar.open('Cargas desembarcadas correctamente', 'Close', { duration: 2000 });
      this.getEmbarkedTravels()
      this.resetAll();
    }
  }

  allAssignedScans(){
    try{
      let pendingTravel = this.pendingTravels.filter(t => t.num === this.travel.num)[0]
      return ((pendingTravel.asignados == pendingTravel.totales) && (!this.travel.embarked)) ? true : false;
    } catch(e){
      return false
    }
  }

  exportScansbyTravel() {
    if (this.travel.num)
      this.reportHistoricService.generateExcelbyTravel(this.travel.num);
    else
      this.snackbar.open('Por favor, ingrese un número de viaje', 'Close', { panelClass: ['warning-snackbar'], duration: 3000 });
  }
  
  async embarcarCargas(){
    if(confirm('¿Está seguro que desea continuar? Las cargas seleccionadas no podrán ser reasignadas unas vez embarcadas')){
      this.shipperReportService.generateDecksDetailExcel(this.travel.num)
      await this.travelService.embarcarCargas(this.travel.num, this.scanList)

      this.snackbar.open('Cargas embarcadas correctamente', 'Close', { duration: 2000 });
      this.getEmbarkedTravels()
      this.resetAll();
    }
  }

  resetAll(){
    this.travel = { num : null, terminal_embarque : '', terminal_destino: '', zarpe : null, embarked: false };
    this.scanSelected = '';
    this.ferry = {}
    this.getPendingTravels()
  }

  set_title(){
    this.unread_notifications++;
    this.titleService.setTitle("("+this.unread_notifications+") "+this.title);
  }

  clear_title(){
    this.unread_notifications = 0;
    this.titleService.setTitle(this.title);
  }
  
  orderScansBy(event: MatOptionSelectionChange){
    if (event.source.selected){
      switch(event.source.value){
        case 1:
          this.ds_scansToAssign = new MatTableDataSource(this.scanList.sort(this.deckAssignExist()));
        break;
        case 2:
          this.ds_scansToAssign = new MatTableDataSource(this.scanList.sort(this.sortByProperty("fecha")))
        break;
      }
      console.log(this.ds_scansToAssign);
      
    }
  }

  deckAssignExist(){  
    return function(a){  
       if(a['deck_assign'])  
          return 1;  
       else
          return -1;  
    }  
  }

  sortByProperty(property){  
    return function(a,b){  
       if(a[property] > b[property])  
          return 1;  
       else if(a[property] < b[property])  
          return -1;  
       return 0;  
    }  
  }
}
