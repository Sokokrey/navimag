import { Injectable } from '@angular/core';
import { Ferry } from '../models/ferry';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FerryService {

  constructor( private http : HttpClient) { }

  public async list(): Promise<Ferry[]> {
    let API_URI = localStorage.getItem('API_URL'); 
    let URL=`${API_URI}/ecmc_lidar`;
    return <Ferry[]>await this.http.get(`${URL}/ferry`).toPromise();
  }

}
