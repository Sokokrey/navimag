//Modelos
import { Login } from 'src/app/models/login';
import { Travel } from 'src/app/models/travel';

//Servicios
import { CustomerService } from 'src/app/services/customer.service';
import { TravelService } from 'src/app/services/travel.service';
import { DriverService } from 'src/app/services/driver.service';
import { LoadTypeService } from 'src/app/services/load-type.service';
import { DiceTenerService } from 'src/app/services/dice-tener.service';
import { ScanService } from 'src/app/services/scan.service';
import { MqttService } from 'src/app/services/mqtt.service';

//Componentes
import { HistoricConfigComponent } from '../../config/historic-config/historic-config.component';

//Angular
import { Component, OnInit, Input, SimpleChange, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormGroupDirective, FormControl } from '@angular/forms';
import { trigger, transition, animate, style, keyframes } from '@angular/animations'
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';

//Otros
import { faShip, faCheck, faSave, faCamera } from '@fortawesome/free-solid-svg-icons';
import * as Highcharts from 'highcharts';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import JSMpeg from 'jsmpeg-player';

import flvjs from 'flv.js'

require('highcharts/highcharts-3d')(Highcharts);
require('highcharts/modules/cylinder')(Highcharts);
require('highcharts/modules/boost')(Highcharts);

@Component({
  selector: 'app-scan',
  templateUrl: './scan.component.html',
  styleUrls: ['./scan.component.scss'],
  animations: [
    trigger('fade', [
      transition('* <=> *', animate('2s ease-in-out', keyframes([
        style({ opacity: 0 }),
        style({ opacity: 1 })
      ]))) // How do I specify the iterations, or the direction? 
    ])
  ]
})

export class ScanComponent implements OnInit {

  @Input() current_login: Login;
  @Input() highcharts: any = Highcharts;
  @Input() chartUpdate: boolean = false;
  @Input() chartOptions: any = null;
  @Input() scanParams: any;

  ///// FORMULARIO /////
  formGroup: FormGroup;
  formConfirmado: boolean = false;

  @Input() nro_reserva: Number = null;
  @Input() sin_reserva: boolean = false;
  @Input() patente: string = null;
  @Input() patente2: string = '';
  @Input() sin_patente: boolean = false;
  @Input() driver: any = { name: '', RUT: '' }; //Chofer entrega
  @Input() load_type: any = { name: '',  category: '', loads: []}; //Tipo de equipo
  @Input() load: any = ''; // Equipo/Carga
  @Input() dice_tener: any = { name: ''};
  @Input() carga_peligrosa: boolean = false;
  @Input() repuesto_neumatico : any = { lleva: false, cuantos : 0 };
  @Input() conditional: any = '';
  @Input() travel: Travel = /*Viaje*/ { num: null, ferry: null, terminal_embarque: '', terminal_destino: '', zarpe: null, embarked: false };
  @Input() customer: any = { name: '', RUT: '' }; //Cliente embarcador / Empresa
  @Input() observaciones_recepcion: any = '';
  @Input() observaciones_destino: any = '';
  @Input() alto: any = 0; r_alto: any;
  @Input() ancho: any; r_ancho: any;
  @Input() largo: any = 0;
  @Input() peso: any = 0;
  @Input() volumen: any; r_volumen: any;

  //Filtrados para listas desplegables del formulario
  filteredCustomers: Observable<string[]>;
  filteredDriverName: Observable<string[]>;
  filteredDriverRUT: Observable<string[]>;
  filteredPatente: Observable<string[]>;
  filteredDice_tener: Observable<string[]>;

  //Datos para listas desplegables
  patenteList = []
  travelList = [];
  customerList = [];
  driverList = [];
  dice_tenerList = []
  conditionalList = [ 'ALTURA', 'ESTIBA', 'FUERA DE HORARIO', 'PESO', 'PROBLEMAS MECÁNICOS', 'RESERVA', 'SOBRE ANCHO', 'TRINCA' ]
  loadTypeList = [];
  filterLoads = [];
  historic_scans = []

  //Auxiliares
  allConditionalsSelected : Boolean =false;
  @ViewChild('conditionalSelect') conditionalSelect: MatSelect;
  conditionalsSelected = []
  showGif: boolean = false;

  //Camara lateral que se despliega apretando el icono de la camara en pestaña Scanner
  @ViewChild('streamingL', { static: true }) public streamingcanvasL: ElementRef;
  URl: string;
  playerL: JSMpeg.Player;
  zoomCamera: boolean = false;
  hiddenL: boolean = true;

  //Iconos
  faShip = faShip;
  faCheck = faCheck;
  faSave = faSave;
  faCamera= faCamera; 

  constructor(private travelService: TravelService, private snackbar: MatSnackBar, private historicComponent: HistoricConfigComponent, private diceTenerService : DiceTenerService,
              private customerService: CustomerService, private driverService: DriverService, private loadTypeService: LoadTypeService, private scanService: ScanService, private formBuilder: FormBuilder, 
              private Mqtt: MqttService) { }

  ngOnInit(): void {


    this.getTravels();
    this.getHistoric(); //Que se filtran por patente
    this.getCustomers();
    this.getDrivers();
    this.getLoadTypes();
    this.getDiceTener();
    this.createForm();
    this.createFilters();

    let link1 = localStorage.getItem('API_URL');
    this.URl = link1.slice(7, (link1.length - 5));

    this.Mqtt.getMessages(['travel/added', 'travel/updated', 'travel/deleted', 'client/reload']).subscribe(({ message, topic })=>{
      switch (topic){
        case 'travel/added': 
          this.getTravels();
          this.snackbar.open(message.text, 'Close', { duration: 5000 });
        break;
        case 'travel/updated': 
          this.getTravels();
          this.snackbar.open(message.text, 'Close', { duration: 5000 });
        break;
        case 'travel/deleted': 
          this.getTravels();
          this.snackbar.open(message.text, 'Close',  { panelClass: ['warning-snackbar'], duration: 5000 });
        break;
        case 'client/reload':
            if(message == localStorage.getItem('token'))
              window.location.reload();
        break;
      }  
    })
  }

  ngOnChanges(changes: SimpleChange) { 
    if (!["peso"].includes(Object.keys(changes)[0])) {
      this.count_to()
    }
  }
  
  async getTravels() {
    this.travelList = await this.travelService.list();
  }
  async getCustomers() {
    this.customerList = await this.customerService.listCustomer();
  }

  async getDrivers() {
    this.driverList = await this.driverService.listDriver();
  }

  async getLoadTypes() {
    this.loadTypeList = await this.loadTypeService.list();
  }

  async getDiceTener() {
    this.dice_tenerList = await this.diceTenerService.list();
  }

  async getHistoric() {
    this.historic_scans = await this.scanService.getHistoric();
    this.patenteList = this.historic_scans.map(function(item) {
      return item.patente;
    });
  }

  createForm() {
    let numericRegex = /^[0-9]+$/;
    this.formGroup = this.formBuilder.group({
      'nro_reserva': [null, [this.checkNroReserva.bind(this)]],
      'sin_reserva': [null, []],
      'patente': [null, [ this.checkSinPatente.bind(this), this.checkPatente,  Validators.minLength(6),  Validators.maxLength(7)]],
      'patente2': [null, [this.checkPatente, Validators.maxLength(7)]],
      'sin_patente': [null, []],
      'driver_name': [null, [Validators.required, this.existDriver.bind(this), this.noWhitespaceValidator]],
      'driver_rut': [null, [Validators.required, this.checkRUT, this.existDriverRUT.bind(this), Validators.minLength(3), Validators.maxLength(10)]],
      'load_type': [null, [Validators.required]],
      'load': [null, [Validators.required]],
      'dice_tener': [null, [Validators.required, , this.noWhitespaceValidator]],
      'carga_peligrosa': [null, []],
      'repuesto_neumatico': [null, []],
      'numero_neumaticos': [null, []],
      'conditional': [null, []],
      'travel': [null, [ Validators.compose([ Validators.required, this.nonZero, this.existTravel.bind(this) ])]],
      'customer_name': [null, [Validators.required, , this.noWhitespaceValidator]],
      'customer_rut': [null, [Validators.required, this.checkRUT, this.existRUT.bind(this), Validators.minLength(3), Validators.maxLength(10)]],
      'observaciones_recepcion': [null, []],
      'observaciones_destino': [null, []]
    });
  }
  
  createFilters(){
    this.filteredCustomers = this.formGroup.controls['customer_name'].valueChanges
      .pipe(
        startWith(''),
        map(value => this._filterCustomer(value))
      );

    this.filteredDriverName = this.formGroup.controls['driver_name'].valueChanges
      .pipe(
        startWith(''),
        map(value => this._filterNameDriver(value))
      );

    this.filteredDriverRUT = this.formGroup.controls['driver_rut'].valueChanges
      .pipe(
        startWith(''),
        map(value => this._filterRUTDriver(value))
      );

    this.filteredDice_tener = this.formGroup.controls['dice_tener'].valueChanges
      .pipe(
        startWith(''),
        map(value => this._filterDice_tener(value))
      );
    
    this.filteredPatente = this.formGroup.controls['patente'].valueChanges
      .pipe(
        startWith(''),
        map(value => this._filterPatente(value))
      );
  }

  _filterCustomer(value: any): string[] {
    const filters = (value) ? value.split(' ') : [];
    return this.customerList.filter(customer =>
      this.validateCustomer(customer.name, filters)
    );
  }

  _filterNameDriver(value: any): string[] {
   const filterValue = value;
    return (filterValue) ? (this.driverList.filter(driver =>
      driver.name.includes(filterValue.toUpperCase()
      )).sort()) : [];
  }

  _filterRUTDriver(value: any): string[] {
   const filterValue = value;
    return (filterValue) ? (this.driverList.filter(driver =>
      driver.RUT.includes(filterValue.toUpperCase()
      )).sort()) : [];
  }

  _filterDice_tener(value: any): string[] {
    const filterValue = value;
    return (filterValue) ? (this.dice_tenerList.filter(dice_tener =>
      dice_tener.name.includes(filterValue.toUpperCase()
      )).sort()) : [];
  }

  _filterPatente(value: any): string[] {
    const filterValue = value;
    if(filterValue){
      //Obtengo un array con las patente de todos los scans
      let patentes = this.patenteList.filter(patente =>
        patente.includes(filterValue.toUpperCase())
      ).sort();
      
      //Verifico que no se repitan las patentes
      return (filterValue) ? (patentes.filter(function(item, pos) {
          return patentes.indexOf(item) == pos;
        }
      ).sort()) : [];
    }
  }

  
  //Funciones de validacion

  nonZero(control:FormControl):{ [key: string]: any; } {
    if (Number(control.value) <= 0) {
      return {nonZero: true};
    } else {
      return null;
    }
  }

  noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }

  validateCustomer(customer: any, filters: any) {
    let aux = 0; //Acumulará los filtros pasados
    filters.forEach((filter, i) => {
      aux = (customer.includes(filter.toUpperCase())) ? ++aux : aux;
    })
    return (aux == filters.length) ? true : false;
  }

  // Funciones para levantar informacion en caso de existir
  travelExist(num) {
    let travel = this.travelList.filter(t => t.num === num);
    return (travel.length > 0) ? true : false
  }

  customerExist() {
    let customersByName = this.customerList.filter(c => c.name === this.customer.name);
    let customersByRUT = this.customerList.filter(c => c.RUT === this.customer.RUT);

    if (customersByName.length == 1)
      this.customer.RUT = customersByName[0].RUT

    if (customersByName.length == 0)
      this.customer.RUT = (customersByRUT.length == 1) ? '' : this.customer.RUT;

  }

  driverExist() {
    let driversByName = this.driverList.filter(d => d.name === this.driver.name.toUpperCase());
    let driversByRUT = this.driverList.filter(d => d.RUT === this.driver.RUT);

    if (driversByName.length == 1)
      this.driver.RUT = driversByName[0].RUT

    if (driversByRUT.length == 0)
      this.driver.RUT = (Number(driversByRUT.length) == 1) ? '' : this.driver.RUT;
  }

  patenteExist(){
    let scan : any = this.historic_scans.filter(scan => scan.patente === this.patente.toUpperCase())[0]
    if(scan){
      this.load_type          = this.loadTypeList.filter(load_type => load_type.name === scan.tipo_carga)[0]
      this.filterLoads        = this.load_type.loads.sort(this.sortByProperty('name'))
      this.load               = this.filterLoads.filter(load => load.name === scan.carga)[0]
      this.largo       = scan.medidas.largo
      this.alto        = scan.medidas.alto
      this.ancho       = scan.medidas.ancho
      this.peso        = scan.medidas.peso
      this.volumen     = scan.medidas.volumen
      this.patente2    = ''
      if(scan.patente.includes("//")){
        let patentes = scan.patente.split("//")
        this.patente = patentes[0].trim()
        this.patente2 = patentes[1].trim()
      }
    }
  }

  // Funciones para verificar si existe la informacion dentro de las listas
  existRUT(rut) {
    if (rut.value && !this.customerList.some(c => c.name === this.customer.name))
      return (this.customerList.some(customer => customer.RUT == rut.value)) ? { 'exist': true } : null
    return null
  }

  existTravel(control) { //Levanta y valida
    let travel = (control.value) ? control.value : '';
    this.travelList.forEach((travel) => {
      if(travel.num === control.value){
        this.travel.terminal_embarque  = travel.terminal_embarque
        this.travel.terminal_destino   = travel.terminal_destino
        this.travel.ferry              = travel.ferry
        this.travel.zarpe              = travel.zarpe
      }
    });

    return (!this.travelList.some(t => t.num === travel)) ? { 'requeriments': true } : null
  }

  existDriver(control) {
    let driver = (control.value) ? control.value : '';
    return (this.driverList.some(d => d.RUT === this.driver.RUT 
                                   && d.name !== driver.toUpperCase()))
            ? { 'requeriments': true } : null
    
  }

  existDriverRUT(rut) {
    if (rut.value && !this.driverList.some(c => c.name === this.driver.name))
      return (this.driverList.some(driver => driver.RUT == rut.value)) ? { 'exist': true } : null
    return null
  }

  checkNroReserva(nro){
    if (!nro.value) 
      return (this.sin_reserva) ? null : { 'required': true }
    else
      return (nro.value > 0) ? null : { 'required': true }
  }

  checkSinPatente(patente) {
    if (!patente.value) 
      return (this.sin_patente) ? null : { 'required': true }
    else
      return (this.patente != '') ? null : { 'required': true }
  }

  ///////////////////////////////

  // Funciones auxiliares
  getLoads(){
    this.load = '';
    this.filterLoads = this.load_type.loads.sort(this.sortByProperty('name'))
    if(this.load_type.category == 'VM'){
      this.largo = 3.5
      this.alto = 1.6
      this.ancho = 2.6
      this.volumen = 14.56
      this.peso = 1500
      this.count_to()
    }
  }

  showPatente2(){
    let patente1 = (this.formGroup.controls['patente'].value) ? this.formGroup.controls['patente'].value : '';
    return (patente1.length > 6) ? false : true
  }
  
  agregarGuion(value){
    if (value.indexOf('-') == -1){
      for (var i = 0; i < value.length; i++) {
        if(/^-?\d+$/.test(value.charAt(i)) && i > 1){ //Verifico que parta desde la segunda posicion, y pregunto si es un numero
          return [value.slice(0, i), '-', value.slice(i)].join('');
        }
      }
    }
    return value
  }

  checkPatente(control) {
    let patente = control.value
    
    let patenteCheck1 = /^[A-Z, a-z][A-Z, a-z][-][0-9][0-9][0-9][0-9]/;
    let patenteCheck2 = /^[A-Z, a-z][A-Z, a-z][A-Z, a-z][A-Z, a-z][-][0-9][0-9]/;
    let patenteCheck3 = /^[A-Z, a-z][A-Z, a-z][A-Z, a-z][-][0-9][0-9][0-9]/;

    return ((!patenteCheck1.test(patente) && !patenteCheck2.test(patente) && !patenteCheck3.test(patente)) && patente) ? { 'requeriments': true } : null;
  }

  cameraChart() { //Se llama desde el html
    this.hiddenL = (this.hiddenL) ? false : true;
    
    
    if(!this.playerL){
      this.playerL = new JSMpeg.Player('ws://' + this.URl + ':9200/', {
        canvas: this.streamingcanvasL.nativeElement,
        autoplay: true,
        audio: false,
        loop: true,
        responsive: true
      });
    }
    
    /*
    let link1= localStorage.getItem('API_URL');
    this.URl= link1.slice(7, (link1.length - 5));
    
    const camera = [200];
    camera.forEach((i)=>{
      if (flvjs.isSupported()) {
        const videoElement =    <HTMLAudioElement>document.getElementById('canvasL');
        const flvPlayer = flvjs.createPlayer({
          type: 'flv',
          //url: 'wss://'+ this.URl +':8443/live/CAMERA_1.flv'
          url: 'ws://'+ this.URl +':8443/live/CAMERA_'+i+'.flv'
        });
        flvPlayer.attachMediaElement(videoElement);
        flvPlayer.load();
        flvPlayer.play();
      }
    })
    */
  }
  zoomCameraL() { //Se llama desde el html
    let canvas: any = document.getElementById('canvasL');
    if (!this.zoomCamera) {
      this.zoomCamera = true;
      canvas.setAttribute("style", "width: 80%; opacity: 0.4; left : 48%");
    }
    else {
      this.zoomCamera = false;
      canvas.setAttribute("style", "width: 80%; height: 10%; opacity: 0.4;");
    }
  }

  sortByProperty(property) {
    return function (a, b) {
      if (a[property] > b[property])
        return 1;
      else if (a[property] < b[property])
        return -1;
      return 0;
    }
  }

  checkRUT(rut) {
    let Fn = {
      // Valida el rut con su cadena completa "XXXXXXXX-X"
      validaRut(rutCompleto) {
        if (!/^[0-9]+-[0-9kK]{1}$/.test(rutCompleto))
          return false;
        var tmp = rutCompleto.split('-');
        var digv = tmp[1];
        var rut = tmp[0];
        if (digv == 'K') digv = 'k';
        return (Fn.dv(rut) == digv);
      },
      dv: function (T) {
        var M = 0, S = 1;
        for (; T; T = Math.floor(T / 10))
          S = (S + T % 10 * (9 - M++ % 6)) % 11;
        return S ? S - 1 : 'k';
      }
    }
    return (!Fn.validaRut(rut.value)) ? { 'requeriments': true } : null;
  }

  conditionalClick() {
    let newStatus = true;
    this.conditionalSelect.options.forEach((item: MatOption) => {
      if (!item.selected) {
        newStatus = false;
      }
    });
    this.allConditionalsSelected = newStatus;
  }
  
  toggleAllConditionalSelection() {
    if (this.allConditionalsSelected) {
      this.conditionalSelect.options.forEach((item: MatOption) => item.select());
    } else {
      this.conditionalSelect.options.forEach((item: MatOption) => item.deselect());
    }
  }

  //Mensajes de error
  getErrorPatente() {
    return this.formGroup.get('patente').hasError('required') ? 'Este campo es requerido' :
      this.formGroup.get('patente').hasError('requeriments') ? 'El formato de la patente no es correcto. (Ej: WH2677)' : '';
  }

  getErrorNro_reserva() {
    return this.formGroup.get('nro_reserva').hasError('required') ? 'Este campo es requeridooo' :
      this.formGroup.get('nro_reserva').hasError('requeriments') ? 'qqqq' :
        this.formGroup.get('nro_reserva').hasError('pattern') ? 'El número de reserva debe ser un número entero' : '';
  }

  getErrorTipoCarga() {
    return this.formGroup.get('load_type').hasError('required') ? 'Este campo es requerido' : '';
  }
  getErrorDriver() {
    return this.formGroup.get('driver_name').hasError('required') ? 'Este campo es requerido' :
      this.formGroup.get('driver_name').hasError('requeriments') ? 'Ya hay un Chofer con este RUT' : '';
  }
  getErrorTravel() {
    return this.formGroup.get('travel').hasError('required') ? 'Este campo es requerido' :
      this.formGroup.get('travel').hasError('requeriments') ? 'No se encontraron viajes' : '';
  }
  getErrorDriverRUT() {
    return this.formGroup.get('driver_rut').hasError('required') ? 'Este campo es requerido' :
      this.formGroup.get('driver_rut').hasError('requeriments') ? 'El RUT no es válido' :
        this.formGroup.get('driver_rut').hasError('exist') ? 'Ya existe un cliente con este RUT' : '';
  }
  getErrorCustomerRUT() {
    return this.formGroup.get('customer_rut').hasError('required') ? 'Este campo es requerido' :
      this.formGroup.get('customer_rut').hasError('requeriments') ? 'El RUT no es válido' :
        this.formGroup.get('customer_rut').hasError('exist') ? 'Ya existe un cliente con este RUT' : '';
  }
  getErrorRequired(field) {
    return this.formGroup.get(field).hasError('required') ? 'Este campo es requerido' : '';
  }
  
  // Funciones para las medidas
  changeLarge(nuevo_largo) {
    nuevo_largo = (nuevo_largo) ? parseFloat(nuevo_largo.toString().trim().replace(",", ".")) : 0;
    if (isNaN(nuevo_largo)) {
      this.largo = 0;
      return;
    }
    this.largo = nuevo_largo;
    this.count_to();
  }

  changeAlto(nuevo_alto) {
    nuevo_alto = (nuevo_alto) ? parseFloat(nuevo_alto.toString().trim().replace(",", ".")) : 0;
    if (isNaN(nuevo_alto)) {
      this.alto = 0;
      return;
    }
    this.alto = nuevo_alto;
    this.count_to();
  }
  
  changeAncho(nuevo_ancho) {
    nuevo_ancho = (nuevo_ancho) ? parseFloat(nuevo_ancho.toString().trim().replace(",", ".")) : 0;
    if (isNaN(nuevo_ancho)) {
      this.ancho = 0;
      return;
    }
    this.ancho = nuevo_ancho;
    this.count_to();
  }

  changeWeight(nuevo_peso) {
    nuevo_peso = (nuevo_peso) ? parseFloat(nuevo_peso.toString().trim().replace(",", ".")) : 0;
    if (isNaN(nuevo_peso)) {
      this.peso = 0;
      return;
    }
    this.peso = (nuevo_peso > 0) ? nuevo_peso : 0;
  }

  count_to() {
    this.r_alto = this.r_volumen = 0;
    this.volumen = (this.largo) ? parseFloat(((this.alto) * (this.ancho) * (this.largo)).toFixed(2)) : 0
    
    
    var that = this
    var id = setInterval(frame, 200);
    function frame() {
      if (that.r_alto < 2)
        that.r_alto += 0.5
      else
        that.r_alto = that.alto
      if (that.r_volumen < that.volumen)
        that.r_volumen += 5
      else{
        that.r_volumen = that.volumen
      }
      if (that.r_volumen == 20)
        clearInterval(id);

    }

  }

  //Guardar formulario
  async confirmarMedidas(): Promise<Boolean> {
    if (!this.formGroup.valid) {
      this.snackbar.open('Por favor, llenar antes los campos del formulario', 'Close', { panelClass: ['warning-snackbar'], duration: 3000 });
      for (var i in this.formGroup.controls) {
        if (!(i == 'nro_reserva' && this.sin_reserva))
          this.formGroup.controls[i].markAsTouched()
        
        if (!(i == 'patente' && this.sin_patente))
          this.formGroup.controls[i].markAsTouched()
      }
      return false;
    }
    
    if (this.peso === 0) {
      alert('El peso aún no ha sido ingresado');
      return false;
    }

    if (this.largo === 0) {
      alert('El largo aún no ha sido ingresado');
      return false;

    }
    
    if (this.alto === 0) {
      alert('El alto aún no ha sido ingresado');
      return false;

    }

    if (this.ancho === 0) {
      alert('El ancho aún no ha sido ingresado');
      return false;
    }
    
    this.formConfirmado = true;
    return true;
  }

  async save(formDirective: FormGroupDirective) {
    
    if (!await this.confirmarMedidas()) {
      alert('Un error ocurrió, favor de confirmar nuevamente el formulario');
      this.formConfirmado = false;
      return false;
    }

    this.conditionalSelect.options.forEach((op : any)=>{
      if(op.selected)
        this.conditionalsSelected.push(op._mostRecentViewValue)
    })
    
    var data: any = {
      driver: {
        name: this.driver.name.toUpperCase(),
        RUT: this.driver.RUT
      },
      patente: (this.patente) ? this.patente.toUpperCase() : 0,
      nro_reserva: (this.nro_reserva) ? this.nro_reserva : 0,
      condicionales: this.conditionalsSelected,
      nro_recepcion: this.load_type.category,
      tipo_carga: this.load_type.name,
      carga: this.load.name,
      categoria_carga: (this.load_type.name == 'VEHICULO') ? 'Menor' : 'Mayor',
      dice_tener: this.dice_tener.name.toUpperCase(),
      carga_peligrosa: this.carga_peligrosa,
      repuesto_neumatico: this.repuesto_neumatico,
      customer: {
        name: this.customer.name,
        RUT: this.customer.RUT
      },
      travel: {
        num : this.travel.num,
        ferry: this.travel.ferry,
        terminal_embarque: this.travel.terminal_embarque,
        terminal_destino: this.travel.terminal_destino,
        zarpe: this.travel.zarpe
      },
      observaciones: {
        recepcion: this.observaciones_recepcion + '\n CONDICIONAL POR: ' + this.conditionalsSelected.toString(),
        destino: this.observaciones_destino
      },
      medidas:{
        alto: this.alto,
        largo: this.largo,
        ancho: this.ancho,
        volumen: this.volumen,
        peso: this.peso
      },
      /*configuracion: {
        frecuencia: this.scanParams.frecuencia,
        resolucion_angular: this.scanParams.resolucion_angular,
        angulo_inicial: -5,
        angulo_final: 185,
        numero_serial: this.scanParams.numero_serial,
        cantidad_datos: this.scanParams.cantidad_datos
      },*/
      user: localStorage.getItem('user')
    }
    if(this.patente2)
      data.patente2 = this.patente2.toUpperCase()

    if(!this.sin_reserva)
        data.observaciones.recepecion = data.observaciones.recepecion + '\n RESERVA Nª: '+ this.nro_reserva

    var that = this;
    await this.scanService.save(data).finally(async function () {
      let scan: any = await that.scanService.getLastScanInfo();
      console.log('Ultimo scan:', scan);

      that.scanService.snapChat(scan._id);

      var id = setInterval(frame, 850);
      var cont = 0;
      that.showGif = true;

      
      function frame() {
        if (cont == 9){ //Tiempo que necesita para guardar las imagenes
          that.historicComponent.generatePdf(scan._id, 1)
          that.Mqtt.publish(`scan/new_scan`, { text : 'Se ha recepcionado una nueva carga ('+scan.nro_recepcion+')', token : localStorage.getItem('token')} );
        }
        cont += 1
      }
      //formDirective.resetForm();¡
    });

    this.snackbar.open('Cambios guardados correctamente', 'Close', { duration: 2000 });
  }
}
