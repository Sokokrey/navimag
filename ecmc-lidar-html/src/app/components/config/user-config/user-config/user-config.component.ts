import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Login } from 'src/app/models/login';
import { LoginService } from 'src/app/services/login.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { faEdit, faTrash, faBan, faSave } from '@fortawesome/free-solid-svg-icons';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-config',
  templateUrl: './user-config.component.html',
  styleUrls: ['./user-config.component.scss']
})
export class UserConfigComponent implements OnInit {
  @Input() current_login:Login;
  login: Login = { user: null, name: null, category: 1, password: null };
  loginList: Login[];
  updateLogin: Boolean = false;

  categoryList=[
    {value:1,text:'Administrador',tooltip:'Administrador de opciones y usuarios'},
    {value:2,text:'Operario',tooltip:'Registros y reportes de carga'},
    {value:3,text:'Embarcador',tooltip:'Embarcador'}
  ];

  //Font Awesome
  faSave = faSave;
  faBan = faBan;
  faTrash = faTrash;
  faEdit = faEdit;

  //Datatables
  ds_loginList: MatTableDataSource<Login>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private loginService: LoginService,
    private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.getLoginList();
  }
  async getLoginList() {
    let loginList = await this.loginService.listUser();
  
    //Datatables
    this.ds_loginList = new MatTableDataSource(loginList);
    this.ds_loginList.paginator = this.paginator;
    this.ds_loginList.sort = this.sort;
  }
  async getLoginDetail(login: Login) {
    this.login = login;
    this.login.password = '';
    this.updateLogin=true;
  }
  async addLogin() {
    await this.loginService.addUser(this.login);
    this.resetLogin();
    this.snackBar.open('Guardado correctamente', 'Close', { duration: 2000 });
  }
  async updLogin() {
    await this.loginService.updUser(this.login);
    this.resetLogin();
    this.snackBar.open('Actualizado correctamente', 'Close', { duration: 2000 });
  }
  async delLogin(login:Login) {
    if(!confirm('¿Seguro que desea continuar?')) return null
    await this.loginService.delUser(login);
    this.resetLogin();
    this.snackBar.open('Eliminado correctamente', 'Close', { duration: 2000 });
  }
  async resetLogin() {
    this.updateLogin=false;
    this.login = { user: null, name: null, category: 1, password: null };
    this.getLoginList();
  }

  getCategoryText(category){
    switch(category){
      case 1:
        return 'Administrador'     
      case 2:
        return 'Operador'
      case 3:
        return 'Embarcador'
    }
  }
}