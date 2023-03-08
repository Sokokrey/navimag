import { Injectable } from '@angular/core';
import { Terminal } from '../models/terminal'
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class TerminalService {

  constructor(private http: HttpClient) { }

  public async getTerminals(): Promise<Terminal[]> {
    let API_URI = localStorage.getItem('API_URL');   
    let URL=`${API_URI}/ecmc_lidar`;
    return <Terminal[]>await this.http.get(`${URL}/terminal`).toPromise();
  }

}
