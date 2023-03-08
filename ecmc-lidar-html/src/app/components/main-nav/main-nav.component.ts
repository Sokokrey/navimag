import { Component, Output, Input, EventEmitter, IterableChanges, IterableDiffer, IterableDiffers } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LoginService } from '../../services/login.service';
import { MqttService } from 'src/app/services/mqtt.service';
import { faSignOutAlt, faShip, faUser, faCog, faHome, faBell } from '@fortawesome/free-solid-svg-icons';
import { Login } from 'src/app/models/login';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';


@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss']
})

export class MainNavComponent {
  login: Login = {
    user: localStorage.getItem('user'),
    name: localStorage.getItem('name'),
    category: parseInt(localStorage.getItem('category'))
  };
  
  faSignOutAlt = faSignOutAlt;
  faUser = faUser;
  faCog = faCog;
  faBell = faBell;
  faHome = faHome;
  faShip = faShip;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(result => result.matches)
  );
  
  now: Date = new Date();
  
  @Input() notifications = [];
  unread_notifications = 0

  isBadgeHidden : Boolean = false;
  notificationsCont = 0
  title = "Navimag - ECMC Lidar"

  _diffNotification: IterableDiffer<number> ; // Para detectar cuando llegue una nueva notificion para embarcador

  @Output() sensorStatus_msg : EventEmitter<any> = new EventEmitter<any>();
  @Output() clear_title : EventEmitter<any> = new EventEmitter<any>(); //Limpiar titulo del browser

  sensorStatus: Boolean;

  constructor( private breakpointObserver: BreakpointObserver,
               public router: Router,
               public loginService: LoginService,
               private Mqtt: MqttService,
               private titleService: Title,
               private _iterableDiffers: IterableDiffers ) { }
  
  ngOnInit() {
    console.log(this.router.url);
    
    this.login.user = localStorage.getItem('user');
    this.login.name = localStorage.getItem('name');
    this.login.category = parseInt(localStorage.getItem('category'));

    
    this._diffNotification = this._iterableDiffers.find(this.notifications).create();

    this.Mqtt
    .getMessages(['travel/added', 'travel/updated', 'travel/deleted', 'scan/travel_changed', 'scan/new_scan'])
    .subscribe(({ message, topic })=>{
      let token = localStorage.getItem('token')
      
      if(message.token != token){
        this.notifications.push({ message : message.text })
        this.set_title()
      }
    })
  
    setInterval(() => { 
      this.now = new Date();     
    }, 1000);

    setInterval(() => { 
      this.getSensorStatus();
    }, 4000);
  }

  ngDoCheck(): void { //Detecta las nuevas notificaciones
    const changes: IterableChanges<number> = this._diffNotification.diff(this.notifications);
    if (changes){
      this.isBadgeHidden = false
      this.notificationsCont++
    }
  }
  
  set_title(){
    this.unread_notifications++;
    this.titleService.setTitle("("+this.unread_notifications+") "+this.title);
  }

  async getSensorStatus(){
    //this.sensorStatus = await this.scanService.getSensorStatus();
    //this.sensorStatus_msg.emit(this.sensorStatus);
    this.sensorStatus = true
    this.sensorStatus_msg.emit(1);
  }

  clearNotifications(){
    this.clear_title.emit(1)
  }
}
