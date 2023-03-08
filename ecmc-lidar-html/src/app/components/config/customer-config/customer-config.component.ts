import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Login } from 'src/app/models/login';
import { Customer } from 'src/app/models/customer';
import { CustomerService } from 'src/app/services/customer.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { faEdit, faTrash, faBan, faSave } from '@fortawesome/free-solid-svg-icons';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-customer-config',
  templateUrl: './customer-config.component.html',
  styleUrls: ['./customer-config.component.scss']
})
export class CustomerConfigComponent implements OnInit {

  @Input() current_login:Login;
  @Input() customer : Customer = { name: '', RUT: ''} ;
  updateCustomer: Boolean = false;

  //Font Awesome
  faSave = faSave;
  faBan = faBan;
  faTrash = faTrash;
  faEdit = faEdit;
  
  customerList : Customer[];
  nameFilter = new FormControl();
  RUTFilter = new FormControl();
  filteredValues = { name: '', RUT: '' }
  //Datatables
  ds_customerList: MatTableDataSource<Customer>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private customerService: CustomerService, private snackBar: MatSnackBar) { 
    this.ds_customerList = new MatTableDataSource(this.customerList);
  }

  ngOnInit() {
    this.getCustomerList();
  }
  async getCustomerList() {
    this.customerList = (await this.customerService.listCustomer()).sort(this.sortByProperty("name"));
    
    //Datatables
    this.ds_customerList = new MatTableDataSource(this.customerList);
    this.ds_customerList.paginator = this.paginator;
    this.ds_customerList.sort = this.sort;

    this.nameFilter.valueChanges.subscribe((nameFilterValue) => {
      this.filteredValues['name'] = nameFilterValue;
      this.ds_customerList.filter = JSON.stringify(this.filteredValues);
    });

    this.RUTFilter.valueChanges.subscribe((RUTFilterValue) => {
      this.filteredValues['RUT'] = RUTFilterValue;
      this.ds_customerList.filter = JSON.stringify(this.filteredValues);
    });

    this.ds_customerList.filterPredicate = this.customFilterPredicate();
    
  }

  customFilterPredicate() {
    const myFilterPredicate = function (data: Customer, filter: string): boolean {
      let searchString = JSON.parse(filter);
      
      let nameFound = data.name.toString().trim().toLowerCase().indexOf(searchString.name.toLowerCase()) !== -1
      let RUTFound = data.RUT.toString().trim().indexOf(searchString.RUT) !== -1
      
      if (searchString.topFilter) {
        return nameFound || RUTFound
      } else {
        return nameFound && RUTFound
      }
    }
    return myFilterPredicate;
  }

  async getCustomerDetail(customer: Customer) {
    this.customer = customer;
    this.updateCustomer=true;
  }
  async addCustomer() {
    await this.customerService.addCustomer(this.customer);
    this.resetCustomer();
    this.snackBar.open('Guardado correctamente', 'Close', { duration: 2000 });
  }
  async updCustomer() {
    await this.customerService.updCustomer(this.customer);
    this.resetCustomer();
    this.snackBar.open('Actualizado correctamente', 'Close', { duration: 2000 });
  }
  async delCustomer(customer: Customer) {
    if(!confirm('¿Seguro que desea continuar?')) return null
    await this.customerService.delCustomer(customer);
    this.resetCustomer();
    this.snackBar.open('Eliminado correctamente', 'Close', { duration: 2000 });
  }
  async resetCustomer() {
    this.updateCustomer = false;
    this.customer = { name: '', RUT: ''};
    this.getCustomerList();
  }
  sortByProperty(property){  
    return function(a,b){  
       if(a[property] > b[property])  
          return 1;  
       else if(a[property] < b[property])  
          return -1;  
       return 0;  
    }  
  }
}