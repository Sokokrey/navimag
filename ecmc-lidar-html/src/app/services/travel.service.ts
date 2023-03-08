import { Injectable } from '@angular/core';
import { Scan } from '../models/scan';
import { Travel } from '../models/travel';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class TravelService {

  constructor(private http: HttpClient) { }

  public async list(): Promise<Travel[]> {
    let API_URI = localStorage.getItem('API_URL'); 
    let URL=`${API_URI}/ecmc_lidar`;
    return <Travel[]>await this.http.get(`${URL}/travel`).toPromise();
  }

  public async getTravel(num: Number): Promise<Travel> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <Travel>await this.http.get(`${URL}/travel/${num}`).toPromise();
  }

  public async getPendingTravels(): Promise<Travel[]> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <Travel[]>await this.http.get(`${URL}/travels/pendings`).toPromise();
  }

  public async getEmbarkedTravels(): Promise<Travel[]> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <Travel[]>await this.http.get(`${URL}/travels/embarkeds`).toPromise();
  }

  public async getTravelScans(travel: Number): Promise<any[]> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <any[]>await this.http.get(`${URL}/travel/scans/${travel}`).toPromise();
  }

  public async getShipLayout(travel: Number) : Promise<Scan[]> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <Scan[]>await this.http.get(`${URL}/travel/ship_layout/${travel}`).toPromise();
  }

  public async addTravel(travel): Promise<any> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <any>await this.http.post(`${URL}/travel/`, travel).toPromise();
  }

  public async updTravel(travel): Promise<any> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;travel
    return <any>await this.http.put(`${URL}/travel/${travel._id}`, travel).toPromise();
  }

  public async delTravel(travel): Promise<any> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <any>await this.http.delete(`${URL}/travel/${travel._id}`).toPromise();
  }
  
  public async embarcarCargas(num: Number, scanList: Scan[]): Promise<Scan> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <Scan>await this.http.post(`${URL}/travel/embarcar/${num}`, scanList).toPromise();
  }
  
  public async finishTravel(num: Number, scanList: Scan[]): Promise<Scan> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <Scan>await this.http.post(`${URL}/travel/finish/${num}`, scanList).toPromise();
  }

}
