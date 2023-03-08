import { Injectable } from '@angular/core';
import { connect, MqttClient } from 'mqtt';
import { Observer } from 'rxjs';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'  
})
export class MqttService {
  mqttClient: MqttClient;

  constructor() {
    this.mqttClient = connect(`https://192.168.210.8`, { port: 9001 });
    //this.mqttClient = connect(`https:`, { port: 9001 });
  }
  public publish(topic, msg) {
    this.mqttClient.publish(topic, JSON.stringify(msg))
  }
  public getMessages = (topic) => {
    return new Observable((observer: Observer<any>) => {
      this.mqttClient.subscribe(topic, (err) => {
        if (!err) {
          this.mqttClient.on('message', (topic, message) => {
            let msg = JSON.parse(message.toString());
            observer.next({ topic: topic, message: msg });
          })
        }
        else{
          console.log(err);
        }
      })
    })
  }
  public stopMessages(topic){
    this.mqttClient.unsubscribe(topic);
  }
  public disconnect() {
    this.mqttClient.end()
  }
}