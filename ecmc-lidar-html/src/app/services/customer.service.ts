import { Injectable } from '@angular/core';
import { Customer } from '../models/customer';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  constructor( private http : HttpClient) { }

  public async listCustomer(): Promise<Customer[]> {   
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <Customer[]>await this.http.get(`${URL}/customer/`).toPromise();
  }
  public async getCustomer(customer: Customer): Promise<Customer> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <Customer>await this.http.get(`${URL}/customer/${customer._id}`).toPromise();
  }
  public async addCustomer(customer: Customer): Promise<Customer> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <Customer>await this.http.post(`${URL}/customer/`, customer).toPromise();
  }
  public async updCustomer(customer: Customer): Promise<Customer> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <Customer>await this.http.put(`${URL}/customer/${customer._id}`, customer).toPromise();
  }
  public async delCustomer(customer: Customer): Promise<Customer> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <Customer>await this.http.delete(`${URL}/customer/${customer._id}`).toPromise();
  }

}
