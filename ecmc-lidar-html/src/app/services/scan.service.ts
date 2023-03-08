import { Injectable } from '@angular/core';
import { Scan } from '../models/scan';
import { Sensor} from '../models/sensor';
import { HttpClient } from '@angular/common/http';
import { Date } from '../models/date';

@Injectable({
  providedIn: 'root'
})

export class ScanService {

  constructor(private http: HttpClient) { }
 
  public async initScan(dimension : Number): Promise<Scan> {
    let API_URI = localStorage.getItem('API_URL'); 
    let URL=`${API_URI}/ecmc_lidar`;
    return (<Scan>await this.http.get(`${URL}/scan/dimension/${dimension}`).toPromise());
  }

  public async save(scan: Scan): Promise<Scan> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <Scan>await this.http.post(`${URL}/scan/`, scan).toPromise();
  }

  public async delScan(scan): Promise<any> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <any>await this.http.delete(`${URL}/scan/${scan._id}`).toPromise();
  }

  public async getSensorStatus() : Promise<boolean> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <boolean> await this.http.get(`${URL}/scan/sensor_status`).toPromise();
  }
  
  public async getHistoric(): Promise<Scan[]> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <Scan[]>await this.http.get(`${URL}/scan/historic`).toPromise();
  }

  public async getHistoricobytravel(travel: Number) : Promise<Scan[]> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <Scan[]>await this.http.get(`${URL}/scan/historic_travel/${travel}`).toPromise();
  }

  public async getHistoricobyrange(date1: String, date2: String) : Promise<Date[]> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <Date[]>await this.http.get(`${URL}/scan/historic_range/${date1}/${date2}`).toPromise();
  }

  public async getLastScanInfo(): Promise<Scan> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <Scan>await this.http.get(`${URL}/scan/last_scan`).toPromise();
  }
  
  public async getOneHistoric(scan_id: String): Promise<Scan> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <Scan>await this.http.get(`${URL}/scan/historic/${scan_id}`).toPromise();
  }

  public async assignDeck(scan): Promise<any> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <any>await this.http.put(`${URL}/scan/assign_deck/${scan._id}`, scan.deck_assign).toPromise();
  }

  public async getsensorflag(): Promise<Sensor>{
    let API_URI= localStorage.getItem('API_URL');
    let URL = `${API_URI}/ecmc_lidar`;
    return <Sensor> await this.http.get(`${URL}/sensor/status/`).toPromise();
  }
  public async putsensorflag(sensor:Sensor): Promise<Sensor>{
    let API_URI= localStorage.getItem('API_URL');
    let URL= `${API_URI}/ecmc_lidar`;    
    return <Sensor> await this.http.put(`${URL}/sensor/change_status/${sensor.name}`, sensor).toPromise();
  }
  public async snapChat(scan_id: String): Promise<Scan> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <Scan>await this.http.get(`${URL}/scan_camera/${scan_id}`).toPromise();
  }

  public async changeScanTravel(scan): Promise<any> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <any>await this.http.put(`${URL}/scan/change_travel/${scan._id}`, scan).toPromise();
  }

}
