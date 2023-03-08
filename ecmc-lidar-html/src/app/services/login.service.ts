import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Login } from '../models/login';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http: HttpClient, private router: Router) { }

  public login(login: Login) {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return this.http.post<any>(`${URL}/login`, login);
  }
  public logout() {
    sessionStorage.clear();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('name');
    localStorage.removeItem('category');
    this.router.navigate(['/login']);
  }
  public loggedIn() {
    return !!localStorage.getItem('token');
  }
  getToken() {
    return localStorage.getItem('token');
  }
  public async listUser(): Promise<Login[]> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <Login[]>await this.http.get(`${URL}/user/`).toPromise();
  }
  public async getUser(login: Login): Promise<Login> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <Login>await this.http.get(`${URL}/user/${login._id}`).toPromise();
  }
  public async addUser(login: Login): Promise<Login> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <Login>await this.http.post(`${URL}/user/`, login).toPromise();
  }
  public async updUser(login: Login): Promise<Login> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <Login>await this.http.put(`${URL}/user/${login._id}`, login).toPromise();
  }
  public async delUser(login: Login): Promise<Login> {
    let API_URI = localStorage.getItem('API_URL');
    let URL=`${API_URI}/ecmc_lidar`;
    return <Login>await this.http.delete(`${URL}/user/${login._id}`).toPromise();
  }
}