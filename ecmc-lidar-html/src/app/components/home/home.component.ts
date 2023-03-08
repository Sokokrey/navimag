import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Login } from 'src/app/models/login';
import { Sensor } from '../../models/sensor';
import { Ferry } from 'src/app/models/ferry';
import { ScanService } from 'src/app/services/scan.service';
import { FerryService } from 'src/app/services/ferry.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { faSatelliteDish, faShip, faTools, faCheckCircle, faCube, faSquare, faCircle, faUndo, faClock, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import * as Highcharts from 'highcharts';
import { Router } from '@angular/router';
import JSMpeg from 'jsmpeg-player';
import { MqttService } from 'src/app/services/mqtt.service';


require('highcharts/highcharts-3d')(Highcharts);
require('highcharts/modules/cylinder')(Highcharts);
require('highcharts/modules/boost')(Highcharts);

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})

export class HomeComponent implements OnInit {
  
  @Input() alto: number = 0;
  @Input() largo: number = 0;
  @Input() ancho: number = 0;
  @Input() volumen: number = 0;
  @Input() peso: number = 0;
  @Input() dimension: number = 2;
  @Input() progress_percentage: number = 0;
  @Input() sensorStatus: boolean; //Llega de main-nav
  @Input() scanChart: Highcharts.Chart
  @Input() scanParams: any = []; //Arreglo con la coniguración del Scan

  @Input() chartUpdate: boolean = false;
  @Input() chartOptions: any = '';
  
  @ViewChild('streamingZ', { static: true }) public streamingcanvasZ: ElementRef;
  zoomedCamera: boolean = false;
  playerZ: JSMpeg.Player;

  //////variables funcion flag////////
  sensor: Sensor;
  flag: number = 0;
  
  scan_coords = []; //Arreglo con todas las coordenadas que arrojará el barrido y que pasen los filtros
  graphic_coords: any = []; //Arreglo con las coordenas que serán graficadas
  labels: any = [];
  filtro = 0.5; //limita la altura minima para contar los puntos como medida en el eje x-y
  ran_min = -19; //establece el punto límite mínimo de medicion de la izquierda en el eje x
  ran_max = 7.4; //establece el punto límite maximo de medicion de la derecha en el eje x
  aux_ran_min: any; //guarda el nuevo limite mínimo de x cuando se acorta la zona de medición
  aux_ran_max: any; //guarda el nuevo limite máximo de x cuando se acorta la zona de medición
  y_scan_arr: any = []; //Guardará las medidas mas altas en el eje y

  ////Variables auxiliares////
  max_alt: number = 0;
  ant_alt: any;
  ant_anch: any;
  
  ///botones////////////
  faClock = faClock; faTools = faTools; faCheckCircle = faCheckCircle; faSatelliteDish = faSatelliteDish; faSquare = faSquare; 
  faCube = faCube; faCircle = faCircle; faUndo = faUndo; faShip = faShip; faTimesCircle = faTimesCircle;
  ferries : Array<Ferry> = [];
  login: Login = {
    user: localStorage.getItem('user'),
    name: localStorage.getItem('name'),
    category: parseInt(localStorage.getItem('category'))
  };
  isDisabled: boolean = false; // Deshabilita los botones de escaneo mientras se escanea 

  constructor(private scanService: ScanService, private Mqtt: MqttService, private ferryService: FerryService, private snackbar: MatSnackBar, private router: Router) { }
  
  ngOnInit() {
    if (this.login.category == 3) //Embarcador
      this.router.navigate(['/shipper']);
    
    this.getFerries();
  }

  async getFerries(){
    this.ferries = await this.ferryService.list();
  }

  async initScan() {
    let sensorlist = await this.scanService.getsensorflag(); //Para saber si el laser está ocupado
    this.sensor = sensorlist[0];

    console.log(this.sensor.flag);
    
    if (this.sensor.flag == 1) {
      this.flag = 1
      this.snackbar.open('Sensor Ocupado Espere', 'Close', { duration: 3000 });
      var id = setInterval(g, 850);
      var that = this;
      var cont = 0;
      this.progress_percentage = 0
      var g = function frame() {
        if (cont < 10) {
          cont++
        } else {
          that.flag = 0
          clearInterval(id);
        }
      }
    } else {
      this.flag = 0
      this.sensorStatus = true
      let cantidad_datos = 0;

      this.sensor.flag = 1;
      //await this.scanService.putsensorflag(this.sensor);
      
      this.isDisabled = true; //Inhabilitar botón de inicio
      var that = this;

      var ye = setInterval(function(){
          if (that.progress_percentage < 99)
            that.progress_percentage += 1;
          else {
            that.progress_percentage = 100;
            clearInterval(ye);
          }
      },850)
            
      let scanData : any = [];
      scanData = await this.scanService.initScan(this.dimension).finally(async function () {
        that.isDisabled = false;
        that.snackbar.open('Medición finalizada', 'Close', { duration: 2000 });
        that.sensor.flag = 0;

        clearInterval(ye);
        //await that.scanService.putsensorflag(that.sensor);
      });

      scanData = scanData.toString().replace("[", '');
      scanData = scanData.toString().replace("]", '');
      scanData = scanData.toString().replace(/'/g, '');
      scanData = scanData.toString().replace(/ /g, '');
      scanData = scanData.toString().split("|");
      
      console.log(scanData);
      
      this.scanParams = JSON.parse(scanData[0]);

      console.log('****');
      
      scanData.shift();
      
      let z = 0; //A 'z' se le irá sumando la resolucion angular en radianes 
      scanData.forEach((medicion: any, m) => {
        medicion = medicion.split('_');
        
        let arr_coords = [];
        medicion.forEach((coords: any, i) => {
          let x_y = coords.split(',');
          let x = parseFloat(x_y[0]);
          let y = parseFloat(x_y[1]) + 13.82; // +13.82 para situarlo a partir del eje 0
          
          if (x > this.ran_min && x < this.ran_max && y >= this.filtro && x != 0) {
            if (y < 6) { //Altura máxima
              arr_coords.push([x,y]);
              
              this.graphic_coords.push([x,y]);
              this.labels.push('grey');
              
              cantidad_datos += arr_coords.length;

              if (y >= this.max_alt)
                this.max_alt = y;
            }
          }
        });

        if (this.max_alt > 0)
          this.y_scan_arr.push(this.max_alt)

        this.scan_coords.push(arr_coords.sort((a, b) => a.x - b.x))

        this.scanParams.cantidad_datos = cantidad_datos;
        
        z = z + 0.000683502; //Valor en radianes de la resolución angular
      });

      if (this.scan_coords.length == 0) {
        this.snackbar.open('Nada para escanear', 'Close',  { panelClass: ['warning-snackbar'], duration: 3000 } );
      }
      /*
      for(let u = 0 ; u < 10; u++){
        let arr_coords = [];
        for (let i = 0; i < 9; i++){
          let ying : number = Math.random() * 30
          let yang : number = Math.random() * 4
          let yong : number = Math.random() * 7
          this.graphic_coords.push([parseFloat(ying.toString()),parseFloat(yang.toString())])
          arr_coords.push([parseFloat(ying.toString()),parseFloat(yang.toString())])
          this.labels.push('grey'); 
          if (parseFloat(yang.toString()) >= this.max_alt)
            this.max_alt = parseFloat(yang.toString());
        
        }
        if (this.max_alt > 0) 
          this.y_scan_arr.push(this.max_alt)

        this.scan_coords.push(arr_coords.sort((a, b) => a.x - b.x))
      }
      */
      this.progress_percentage = 0
      this.max_alt = parseFloat(this.max_alt.toFixed(2));
      this.graphic_coords = this.graphic_coords.sort((a, b) => a.x - b.x);

      this.reducirMargenError(this.y_scan_arr);
      this.getAncho(this.ran_min, this.ran_max);
      this.makeChart();
    }
  }


  makeChart() {
    var that = this;
    this.chartOptions = {
      chart: {
          zoomType: 'x',
          backgroundColor: 'transparent',
          selectionMarkerFill: '#56ea0a54',
          height: 448
      },
      title: {
          text: ''
      },
      tooltip: {
          valueDecimals: 2
      },
      xAxis:{
        events:{
          afterSetExtremes:function (e){
            let left_range = (e.userMin) ? e.userMin : e.dataMin;
            let right_range = (e.userMax) ? e.userMax : e.dataMax;
            
            let aux_range = left_range;
            if(left_range > right_range){
              left_range  = right_range;
              right_range = aux_range;
            }
            
            if(e.userMin && e.userMax) //Zoom in
              that.getWithLimits(left_range, right_range)
            else { //Zoom out
              that.largo = 0;
              that.ancho = that.ant_anch;
              that.alto  = that.ant_alt;
            }
          }
        },
      },
      series: [{
          type: 'scatter',
          color: 'rgba(89, 89, 89, .5)',
          data: this.graphic_coords,
          showInLegend: false,
          lineWidth: 0.5
      }],
      credits: {  
          enabled: false
      },
      plotOptions: {
        scatter: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
              enabled: false,
          }
        }
      }
    };
  }

  reducirMargenError(alturasArr) {
    try{
      let sum_alt = alturasArr.reduce((previous, current) => current += previous);
      let avg_alt = sum_alt / alturasArr.length;
      let dif_alt = (parseFloat(avg_alt.toFixed(2)) * 100) / this.max_alt;

      if (dif_alt <= 98 || dif_alt >= 102) {
        let new_arr_alt = [];
        for (let new_y of alturasArr) {
          if (new_y >= avg_alt && new_y <= this.max_alt)
            new_arr_alt.push(new_y);
        }
        let sum2 = new_arr_alt.reduce((previous, current) => current += previous);
        let avg2 = sum2 / new_arr_alt.length;
        this.alto = parseFloat(avg2.toFixed(2));
      } else {
        this.alto = parseFloat(this.max_alt.toFixed(2));
      }
    } catch(e){
      this.alto = parseFloat(this.max_alt.toFixed(2));
    }

    if(this.largo == 0)
      this.ant_alt = this.alto;
  }

  getAncho(ran_min, ran_max) {
    let z_arr = [];
    for (let barr of this.scan_coords) {
      let a = 0;
      for (let punt of barr) {
        if (punt[0] >= ran_min && punt[0] <= ran_max) {
          if (punt[1] > a)
            a = punt[1]
        }
      }
      if (a > 0)
        z_arr.push(a)
    }
    
    console.log(z_arr.length);
    
    let z_avg = (z_arr.reduce((previus, current) => current += previus)) / z_arr.length
    //casos para el calculo del ancho, teniendo en cuenta la cantidad de arreglos con datos utiles tras barrido 

    if (z_avg <= 1.5)
      this.ancho = parseFloat((0.0087962962962 * z_arr.length).toFixed(2))

    if (z_avg > 1.5 && z_avg <= 2)
      this.ancho = parseFloat((0.0087962962962 * z_arr.length).toFixed(2))

    if (z_avg > 2 && z_avg <= 2.5)
      this.ancho = parseFloat((0.0087962962962 * z_arr.length).toFixed(2))

    if (z_avg > 2.5 && z_avg <= 3)
      this.ancho = parseFloat((0.0087962962962 * z_arr.length).toFixed(2))

    if (z_avg > 3 && z_avg <= 4)
      this.ancho = parseFloat((0.0085714285714 * z_arr.length).toFixed(2))

    if (z_avg > 4 && z_avg <= 4.5) {
      //this.ancho = parseFloat((0.0092705167173 * z_arr.length).toFixed(2))
      this.ancho = parseFloat((0.0085714285714 * z_arr.length).toFixed(2))
    }
    if (z_avg > 4.5 && z_avg <= 5)
      this.ancho = parseFloat((0.0092705167173 * z_arr.length).toFixed(2))

    if(this.largo == 0)
      this.ant_anch = this.ancho;
  }

  getWithLimits(left_range, right_range){ // Establece las nuevas medidas de la carga de acuerdo a los límites establecidos por el operario
    this.max_alt = 0; // Pues la altura máxima podría cambiar
    let y_scan_arr = [];
    
    let puntosAbarcados = [];
    this.graphic_coords.forEach((coord: any, i) => {
      if (coord[0] > left_range && coord[0] < right_range) 
        puntosAbarcados.push(coord[0])
    });

    let aux_ran_min = Math.min.apply(null, puntosAbarcados);
    let aux_ran_max = Math.max.apply(null, puntosAbarcados);
    
    this.largo = parseFloat((aux_ran_max - aux_ran_min).toFixed(2));

    this.scan_coords.forEach((medicion: any, m) => {
      medicion.forEach(( coords: any, i) => {
        if (coords[0] >= aux_ran_min && coords[0] <= aux_ran_max) {
          if (coords[1] >= this.max_alt)
            this.max_alt = coords[1];
        }
      })
      
      if(this.max_alt > 0)
        y_scan_arr.push(this.max_alt);
    });

    this.max_alt = parseFloat(this.max_alt.toFixed(2));
    
    this.reducirMargenError(y_scan_arr)
    this.getAncho(aux_ran_min, aux_ran_max);
    
    this.volumen = parseFloat((this.largo * this.ancho * this.alto).toFixed(2))
  }

  zoomCamera(e){
    if(e.type == 'click'){
      let URL = e.target.value.source.url;
      if(this.playerZ) this.playerZ.pause()

      this.playerZ = new JSMpeg.Player(URL, {
        canvas: this.streamingcanvasZ.nativeElement,
        autoplay: true,
        audio: false,
        loop: true,
        responsive: true
      });
      
      this.zoomedCamera = true;
    }else{
      this.zoomedCamera = false;
    }
  }
}
