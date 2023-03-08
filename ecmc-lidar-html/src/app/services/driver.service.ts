import { Injectable } from '@angular/core';
import { Driver } from '../models/driver';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DriverService {

  constructor( private http : HttpClient) { }

  public async listDriver(): Promise<Driver[]> {   
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <Driver[]>await this.http.get(`${URL}/driver/`).toPromise();
  }
  public async getDriver(driver: Driver): Promise<Driver> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <Driver>await this.http.get(`${URL}/driver/${driver.RUT}`).toPromise();
  }
  public async addDriver(driver: Driver): Promise<Driver> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <Driver>await this.http.post(`${URL}/driver/`, driver).toPromise();
  }
  public async updDriver(driver: Driver): Promise<Driver> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <Driver>await this.http.put(`${URL}/driver/${driver.RUT}`, driver).toPromise();
  }
  public async delDriver(driver: Driver): Promise<Driver> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <Driver>await this.http.delete(`${URL}/driver/${driver.RUT}`).toPromise();
  }

}
