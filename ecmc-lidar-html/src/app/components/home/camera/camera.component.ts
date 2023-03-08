import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import JSMpeg from 'jsmpeg-player';
import flvjs from 'flv.js'

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss']
})

export class CameraComponent implements OnInit {
  @ViewChild('streaming', { static: true }) public streamingcanvas: ElementRef;
  @ViewChild('streaming2', { static: true }) public streamingcanvas2: ElementRef;
  @ViewChild('streaming3', { static: true }) public streamingcanvas3: ElementRef;
  @ViewChild('streaming4', { static: true }) public streamingcanvas4: ElementRef;
  @ViewChild('streaming5', { static: true }) public streamingcanvas5: ElementRef;
  @ViewChild('streaming6', { static: true }) public streamingcanvas6: ElementRef;
  @ViewChild('streaming7', { static: true }) public streamingcanvas7: ElementRef;
  @ViewChild('streaming8', { static: true }) public streamingcanvas8: ElementRef;

  @Output() zoomCamera: EventEmitter<any> = new EventEmitter<any>(); //Lo manda a home

  URl: string;
  player: JSMpeg.Player;
  player2: JSMpeg.Player;
  player3: JSMpeg.Player;
  player4: JSMpeg.Player;
  player5: JSMpeg.Player;
  player6: JSMpeg.Player; 
  player7: JSMpeg.Player;
  player8: JSMpeg.Player;

  constructor() { }

  ngOnInit() {
    let link1= localStorage.getItem('API_URL');
    this.URl= link1.slice(7, (link1.length - 5));
    
    const camera = [31,32,33,34,35,36,37,38];
    camera.forEach((i)=>{
      if (flvjs.isSupported()) {
        const videoElement =    <HTMLAudioElement>document.getElementById('videoElement'+i);
        const flvPlayer = flvjs.createPlayer({
          type: 'flv',
          //url: 'wss://'+ this.URl +':8443/live/CAMERA_1.flv'
          url: 'ws://'+ this.URl +':8001/live/CAMERA_'+i+'.flv'
        });
        flvPlayer.attachMediaElement(videoElement);
        flvPlayer.load();
        flvPlayer.play();
      }
    })
  
    /*
    this.player = new JSMpeg.Player('ws://'+this.URl+':9031/', {
    //this.player = new JSMpeg.Player('ws://'+this.URl+':9002/', {
      canvas: this.streamingcanvas.nativeElement,
      autoplay: true,
      audio: false,
      loop: true,
      responsive: true
    });

    this.player2 = new JSMpeg.Player('ws://'+this.URl+':9032/', {
    //this.player2 = new JSMpeg.Player('ws://'+this.URl+':9003/', {
      canvas: this.streamingcanvas2.nativeElement,
      autoplay: true,
      audio: false,
      loop: true,
      responsive: false
    });

    this.player3 = new JSMpeg.Player('ws://'+this.URl+':9033/', {
    //this.player3 = new JSMpeg.Player('ws://'+this.URl+':9004/', {
      canvas: this.streamingcanvas3.nativeElement,
      autoplay: true,
      audio: false,
      loop: true,
      responsive: false
    });

    this.player4 = new JSMpeg.Player('ws://'+this.URl+':9034/', {
    //this.player4 = new JSMpeg.Player('ws://'+this.URl+':9005/', {
      canvas: this.streamingcanvas4.nativeElement,
      autoplay: true,
      audio: false,
      loop: true,
      responsive: false
    });

    this.player5 = new JSMpeg.Player('ws://'+this.URl+':9035/', {
    //this.player5 = new JSMpeg.Player('ws://'+this.URl+':9006/', {
      canvas: this.streamingcanvas5.nativeElement,
      autoplay: true,
      audio: false,
      loop: true,
      responsive: false
    });

    this.player6 = new JSMpeg.Player('ws://'+this.URl+':9036/', {
    //this.player6 = new JSMpeg.Player('ws://'+this.URl+':9002/', {
      canvas: this.streamingcanvas6.nativeElement,
      autoplay: true,
      audio: false,
      loop: true,
      responsive: false
    });

    this.player7 = new JSMpeg.Player('ws://'+this.URl+':9037/', {
    //this.player7 = new JSMpeg.Player('ws://'+this.URl+':9007/', {
      canvas: this.streamingcanvas7.nativeElement,
      autoplay: true,
      audio: false,
      loop: true,
      responsive: false
    });

    this.player8 = new JSMpeg.Player('ws://'+this.URl+':9038/', {
    //this.player8 = new JSMpeg.Player('ws://'+this.URl+':9008/', {
      canvas: this.streamingcanvas8.nativeElement,
      autoplay: true,
      audio: false,
      loop: true,
      responsive: false
    });
    */
  }
}

