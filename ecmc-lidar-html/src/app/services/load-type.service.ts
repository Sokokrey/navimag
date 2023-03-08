import { Injectable } from '@angular/core';
import { LoadType } from '../models/load_type';
import { LoadCategory } from '../models/load_category';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LoadTypeService { 

  constructor( private http : HttpClient) { }

  public async list(): Promise<LoadType[]> {   
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <LoadType[]>await this.http.get(`${URL}/load_type/`).toPromise();
  }

  public async get(load_type: LoadType): Promise<LoadType> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <LoadType>await this.http.get(`${URL}/load_type/${load_type._id}`).toPromise();
  }

  public async add(load_type: LoadType): Promise<LoadType> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <LoadType>await this.http.post(`${URL}/load_type/`, load_type).toPromise();
  }
  public async upd(load_type: LoadType): Promise<LoadType> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <LoadType>await this.http.put(`${URL}/load_type/${load_type._id}`, load_type).toPromise();
  }
  public async del(load_type: LoadType): Promise<LoadType> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <LoadType>await this.http.delete(`${URL}/load_type/${load_type._id}`).toPromise();
  }

  ///// LOADS /////

  public async addLoad(load_type_id, load): Promise<any> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <any>await this.http.post(`${URL}/load_type/load/${load_type_id}`, load).toPromise();
  }
  public async delLoad(load_type : LoadType, load): Promise<any> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <any>await this.http.put(`${URL}/load_type/load/${load_type._id}`, load).toPromise();
  }

  ///// LOAD CATEGORYS /////

  public async getLoadCategorys(): Promise<LoadCategory[]> {
    let API_URI = localStorage.getItem('API_URL'); 
    let URL=`${API_URI}/ecmc_lidar`;
    return <LoadCategory[]>await this.http.get(`${URL}/load_category`).toPromise();
  }

  public async addLoadCategory(load_category: LoadCategory): Promise<LoadCategory> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <LoadCategory>await this.http.post(`${URL}/load_category/`, load_category).toPromise();
  }
  public async updLoadCategory(load_category: LoadCategory): Promise<LoadCategory> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <LoadCategory>await this.http.put(`${URL}/load_category/${load_category._id}`, load_category).toPromise();
  }
  public async delLoadCategory(load_category: LoadCategory): Promise<LoadCategory> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <LoadCategory>await this.http.delete(`${URL}/load_category/${load_category._id}`).toPromise();
  }
}
