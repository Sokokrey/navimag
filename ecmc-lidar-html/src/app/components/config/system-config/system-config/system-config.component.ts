import { Component, OnInit, Input } from '@angular/core';
import { ScanService } from 'src/app/services/scan.service';

@Component({
  selector: 'app-system-config',
  templateUrl: './system-config.component.html',
  styleUrls: ['./system-config.component.scss']
})

export class SystemConfigComponent implements OnInit {
  
  @Input() sensorStatus : any;

  infoCards = [
    {name: 'Status del laser:' },
    {name: 'Resolucion angular:' },
    {name: 'Rango de medida:', value: ''},
    {name: 'Cantidad de datos por barrido:', value: ''},
    {name: 'Serial Number:', value: ''},
    {name: 'Frecuencia de escaneo:', value: ''}
  ];
  contentCards = [
    {name: 'Info'}
  ];
  scanParams : any = [];

  constructor(private scanService: ScanService) { }

  ngOnInit(): void {
    
  }
  
  ngOnChanges(){
    if (this.sensorStatus == 1) this.getLastScanInfo();
  }

  async getLastScanInfo(){
    this.scanParams = await this.scanService.getLastScanInfo();
    this.scanParams.configuracion.angulo_final = this.scanParams.configuracion.angulo_inicial + 190
    
    this.infoCards[0].value = (this.sensorStatus == 1 ) ? 'Conectado' : 'Desconectado';
    this.infoCards[1].value = parseFloat(this.scanParams.configuracion.resolucion_angular).toFixed(4)+'°';
    this.infoCards[2].value = this.scanParams.configuracion.angulo_inicial+'° a '+this.scanParams.configuracion.angulo_final+'°';
    this.infoCards[3].value = this.scanParams.configuracion.cantidad_datos;
    this.infoCards[4].value = this.scanParams.configuracion.numero_serial;
    this.infoCards[5].value = this.scanParams.configuracion.frecuencia+'Hz';

  }
}
