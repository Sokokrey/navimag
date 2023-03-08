import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DiceTenerService {

  constructor( private http : HttpClient ) { }

  public async list(): Promise<any[]> {
    let API_URI = localStorage.getItem('API_URL'); 
    let URL=`${API_URI}/ecmc_lidar`;
    return <any[]>await this.http.get(`${URL}/dice_tener`).toPromise();
  }
  public async addDiceTener(dice_tener): Promise<any> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <any>await this.http.post(`${URL}/dice_tener/`, dice_tener).toPromise();
  }
  public async updDiceTener(dice_tener): Promise<any> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <any>await this.http.put(`${URL}/dice_tener/${dice_tener._id}`, dice_tener).toPromise();
  }
  public async delDiceTener(dice_tener): Promise<any> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <any>await this.http.delete(`${URL}/dice_tener/${dice_tener._id}`).toPromise();
  }

}
