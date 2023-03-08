import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ScanService } from 'src/app/services/scan.service';
import { TravelService } from 'src/app/services/travel.service';
import { FerryService } from 'src/app/services/ferry.service';
import { TerminalService } from 'src/app/services/terminal.service';
import { Scan } from 'src/app/models/scan';
import { faEdit, faTrash, faBan, faSave } from '@fortawesome/free-solid-svg-icons';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { Login } from 'src/app/models/login';
import { Travel } from 'src/app/models/travel';
import { MqttService } from 'src/app/services/mqtt.service';
import { MatOptionSelectionChange } from '@angular/material/core';

@Component({
  selector: 'app-travel-config',
  templateUrl: './travel-config.component.html',
  styleUrls: ['./travel-config.component.scss']
})
export class TravelConfigComponent implements OnInit {

  constructor(private scanService: ScanService, private Mqtt: MqttService, private ferryService: FerryService, private snackBar: MatSnackBar,  private terminalService: TerminalService,  private travelService: TravelService, private formBuilder: FormBuilder) { }

  formGroup: FormGroup;
  ds_travels: MatTableDataSource<any>;
  ds_travelScans: MatTableDataSource<any>;

  travelList : Travel[] = []
  travelScansList : any[] = []
  terminalList = [];
  ferries = [];

  today = new Date();
  updateTravel: Boolean = false;
  sortScans : number = 0;

  @Input() travel = { num : '', terminal_embarque : '', ferry: '', terminal_destino : '', zarpe: '', embarked :false}

  @ViewChild(MatSort) travelSort: MatSort;
  @ViewChild('travelPaginator', { read: MatPaginator }) travelPaginator: MatPaginator;
  @ViewChild('travelScansPaginator', { read: MatPaginator }) travelScansPaginator: MatPaginator;

  displayColumns = ['nro_recepcion','patente','customer_name','customer_rut','load']
  
  filteredValues = { nro_recepcion: '', patente: '', nro_reserva: '', travel: '', hora: '' };

  patenteFilter = new FormControl();
  travelNumFilter = new FormControl();
  nroRecepcionFilter = new FormControl();
  
  filteredTravel: Observable<string[]>;

  faEdit = faEdit
  faTrash = faTrash
  faBan = faBan
  faSave = faSave

  login: Login = {
    user: localStorage.getItem('user'),
    name: localStorage.getItem('name'),
    category: parseInt(localStorage.getItem('category'))
  };

  async ngOnInit(): Promise<void> {
    this.createForm()
    this.getTravels()
    this.getFerries()
    this.getTerminals()

    this.Mqtt
    .getMessages(['scan/new_scan', 'travel/embarked'])
    .subscribe(({ message, topic })=>{
      switch (topic){
        case 'scan/new_scan':
          this.getTravelScans()
        break;
        case 'travel/embarked':
          this.getTravelScans()
        break;
      }})
  }
  
  createForm() {
    this.formGroup = this.formBuilder.group({
      'travel': [null, [Validators.required, Validators.min(1)]],
      'ferry': [null, [Validators.required]],
      'terminal_embarque': [null, [Validators.required]],
      'terminal_destino': [null, [Validators.required]],
      'zarpe': [null, [Validators.required]]
    });
  }

  getErrorRequired(field) {
    return this.formGroup.get(field).hasError('required') ? 'Este campo es requerido' : '';
  }

  async getTravels(){
    this.travelList = await this.travelService.list()
    this.travelList.forEach(function (travel : any) {
      travel.new_travel = 0;
      travel.estado = (travel.arrived) ? 'Finalizado' : ((travel.embarked) ? 'En Ruta' : 'En asignacion');
    });
    
    this.ds_travels = new MatTableDataSource(this.travelList);
    this.ds_travels.paginator = this.travelPaginator;
    this.ds_travels.sort = this.travelSort;
  }

  async getFerries(){
    this.ferries = await this.ferryService.list();
  }
  
  async getTerminals() {
    this.terminalList = await this.terminalService.getTerminals();
    this.travel.terminal_embarque = this.terminalList.filter(x => x.default == 1)[0].name;
  }

  async getTravelDetail(travel) {
    this.updateTravel = true;
    this.travel = travel;

    this.getTravelScans();
  }

  async getTravelScans(){
    this.travelScansList = await this.travelService.getTravelScans(parseInt(this.travel.num))
    
    this.ds_travelScans = new MatTableDataSource(this.travelScansList);
    this.nroRecepcionFilter.valueChanges.subscribe((nroRecepcionFilterValue) => {

      this.filteredValues['nro_recepcion'] = nroRecepcionFilterValue;
      this.ds_travelScans.filter = JSON.stringify(this.filteredValues);
    });

    this.patenteFilter.valueChanges.subscribe((patenteFilterValue) => {
      this.filteredValues['patente'] = patenteFilterValue;
      this.ds_travelScans.filter = JSON.stringify(this.filteredValues);
    });

    this.travelNumFilter.valueChanges.subscribe((travelNumFilterValue) => {
      this.filteredValues['travel'] = travelNumFilterValue;
      this.ds_travelScans.filter = JSON.stringify(this.filteredValues);
    });

    this.ds_travelScans.filterPredicate = this.customFilterPredicate();
    this.ds_travelScans.paginator = this.travelScansPaginator;
  }
  
  searchTravels(){
    this.ds_travels = new MatTableDataSource(this.travelList.filter((t) => t.num.toString().includes(this.travel.num.toString())));
    this.ds_travels.paginator = this.travelPaginator;
    this.ds_travels.sort = this.travelSort;
  }

  sortScansByState(event: MatOptionSelectionChange){
    this.travel = { num : '', terminal_embarque : '', terminal_destino : '', ferry: '', zarpe: '', embarked :false }
    if (event.source.selected){
      switch(event.source.value){
        case 1: //En asignacion
          let travels = this.travelList.filter((t : any) => !t.arrived && !t.embarked )
          this.ds_travels = new MatTableDataSource(travels)
        break;
        case 2: //En Ruta
          travels = this.travelList.filter((t : any) => !t.arrived && t.embarked )
          this.ds_travels = new MatTableDataSource(travels)
        break;
        case 3: //Finalizado
          travels = this.travelList.filter((t : any) => t.arrived && t.embarked )
          this.ds_travels = new MatTableDataSource(travels)
        break;
        default: //Todos
          this.ds_travels = new MatTableDataSource(this.travelList)
        break;
      }
    }
  }

  customFilterPredicate() {
    const myFilterPredicate = function (data: Scan, filter: string): boolean {
      let searchString = JSON.parse(filter);
  
      let nroRecepcionFound = data.nro_recepcion.toString().trim().toLowerCase().indexOf(searchString.nro_recepcion.toLowerCase()) !== -1
      let patenteFound = data.patente.toString().trim().toLowerCase().indexOf(searchString.patente.toLowerCase()) !== -1
      let travelNumFound = data.travel['num'].toString().trim().indexOf(searchString.travel) !== -1

      if (searchString.topFilter) {
        return patenteFound || travelNumFound || nroRecepcionFound
      } else {
        return patenteFound && travelNumFound && nroRecepcionFound
      }
    }
    return myFilterPredicate;
  }

  async addTravel(formDirective : FormGroupDirective) {
    if(this.formGroup.valid){
      this.travel.zarpe = this.formGroup.controls.zarpe.value
    
      await this.travelService.addTravel(this.travel);
      this.Mqtt.publish(`travel/added`, { text : 'Ha sido agregado un nuevo viaje ('+this.travel.num+')', token : localStorage.getItem('token')} );

      formDirective.resetForm();
      this.resetTravel();
      this.snackBar.open('Guardado correctamente', 'Close', { duration: 2000 });
    }
    else
      this.snackBar.open('Por favor ingrese todos los campos del formulario', 'Close', { panelClass: ['warning-snackbar'], duration: 3000 });
    
  }  
  async updTravel(formDirective : FormGroupDirective) {
    if(this.formGroup.valid){
      this.travel.zarpe = this.formGroup.controls.zarpe.value

      await this.travelService.updTravel(this.travel);
      this.Mqtt.publish(`travel/updated`, { text : 'Ha sido modificado el viaje Nª'+this.travel.num, token : localStorage.getItem('token')} );
      this.snackBar.open('Actualizado correctamente', 'Close', { duration: 2000 });
    
      formDirective.resetForm();
      this.resetTravel();  
    }
    else
      this.snackBar.open('Por favor ingrese todos los campos del formulario', 'Close', { panelClass: ['warning-snackbar'], duration: 3000 });
  
  }
  
  async delTravel(travel) {
    if(confirm("¿Está seguro que desea eliminar este viaje?")){
      await this.travelService.delTravel(travel);
      this.Mqtt.publish(`travel/deleted`, { text : 'Ha sido eliminado el viaje Nª'+travel.num, token : localStorage.getItem('token')} );

      this.resetTravel();
      this.snackBar.open('Eliminado correctamente', 'Close', { duration: 2000 });
    }
  } 

  async resetTravel() {
    this.updateTravel = false;
    this.travel = { num : '', terminal_embarque : '', terminal_destino : '', ferry: '', zarpe: '', embarked :false }
    this.travel.terminal_embarque = this.terminalList.filter(x => x.default == 1)[0].name;
    this.formGroup.controls['terminal_embarque'].setValue(this.travel.terminal_embarque)
    
    this.getTravels();
  }

}
