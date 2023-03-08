import { Component, OnInit, Input, Output } from '@angular/core';
import { Login } from 'src/app/models/login';
import { MqttService } from 'src/app/services/mqtt.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent implements OnInit {
  
  @Output() notifications = [];
  unread_notifications = 0
  title = "Navimag - ECMC Lidar"

  login:Login={
    user:localStorage.getItem('user'),
    name:localStorage.getItem('name'),
    category:parseInt(localStorage.getItem('category'))
  };

  constructor(private router: Router,  private Mqtt: MqttService, private titleService: Title) { }
  ngOnInit() {
    if(this.login.category == 3){
      this.router.navigate(['']);
    }
    
    this.Mqtt
    .getMessages(['scan/new_scan', 'travel/embarked'])
    .subscribe(({ message, topic })=>{
      switch (topic){
        case 'scan/new_scan':
          if(this.login.category == 1){
            this.notifications.push({ message : 'Se ha recepcionado una nueva carga ('+message.nro_recepcion+') al viaje Nª'+message.travel.num})
            this.set_title()
          }
        break;
        case 'travel/embarked':
          if(this.login.category == 1){
            this.notifications.push({ message : 'Acaba de ser embarcado el viaje Nª'+message})
            this.set_title()
          }
        break;
      }})
  }

  set_title(){
    this.unread_notifications++;
    this.titleService.setTitle("("+this.unread_notifications+") "+this.title);
  }

  clear_title(){
    this.unread_notifications = 0;
    this.titleService.setTitle(this.title);
  }
}
