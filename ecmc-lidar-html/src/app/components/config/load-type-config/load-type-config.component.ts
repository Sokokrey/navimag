import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Login } from 'src/app/models/login';
import { LoadType } from 'src/app/models/load_type';
import { LoadTypeService } from 'src/app/services/load-type.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { faEdit, faTrash, faBan, faSave } from '@fortawesome/free-solid-svg-icons';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoadCategory } from 'src/app/models/load_category';

@Component({
  selector: 'app-load-type-config',
  templateUrl: './load-type-config.component.html',
  styleUrls: ['./load-type-config.component.scss']
})

export class LoadTypeConfigComponent implements OnInit {

  @Input() current_login:Login;
  @Input() load_type : LoadType = { name : '' , category: '', loads: [] };
  @Input() load_category : LoadCategory = { name: '' };
  @Input() load = { name: '' };
  updateLoadType: Boolean = false;
  updateLoadCategory: Boolean = false;
  updateLoad: Boolean = false;

  //Font Awesome
  faSave = faSave;
  faBan = faBan;
  faTrash = faTrash;
  faEdit = faEdit;

  loadTypeList : LoadType[];
  loadList = [];
  loadCategoryList : LoadCategory[];

  //Datatables
  ds_loadTypeList: MatTableDataSource<LoadType>;
  ds_loadCategoryList: MatTableDataSource<LoadCategory>;
  ds_loadList: MatTableDataSource<LoadType>;
  
  @ViewChild(MatSort) load_typeSort: MatSort;
  @ViewChild(MatSort) load_categorySort: MatSort;
  @ViewChild(MatSort) loadSort: MatSort;

  constructor(private loadTypeService: LoadTypeService,
    private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.getLoadTypeList();
    this.getLoadCategoryList();
  }
  async getLoadTypeList() {
    this.loadTypeList = await this.loadTypeService.list();
  
    //Datatables
    this.ds_loadTypeList = new MatTableDataSource(this.loadTypeList);
    this.ds_loadTypeList.sort = this.load_typeSort;
  }
  async getLoadCategoryList() {
    this.loadCategoryList = await this.loadTypeService.getLoadCategorys();
  
    this.ds_loadCategoryList = new MatTableDataSource(this.loadCategoryList);
    this.ds_loadCategoryList.sort = this.load_categorySort;
  }
  
  /////////////////// LOAD TYPE //////////////////////
  async addLoadType() {
    await this.loadTypeService.add(this.load_type);
    this.resetLoadType();
    this.snackBar.open('Guardado correctamente', 'Close', { duration: 2000 });
  }
  
  async getLoadTypeDetail(load_type: LoadType) {
    this.updateLoadType=true;
    this.load_type = load_type;
    this.loadList = load_type.loads
    this.ds_loadList = new MatTableDataSource(this.loadList.sort(this.sortByProperty("name")));
    this.updateLoad = true;
  }

  async updLoadType() {
    await this.loadTypeService.upd(this.load_type);
    this.resetLoadType();
    this.snackBar.open('Actualizado correctamente', 'Close', { duration: 2000 });
  }

  async delLoadType(load_type: LoadType) {
    if(!confirm('¿Seguro que desea continuar?')) return null
    await this.loadTypeService.del(load_type);
    this.resetLoadType();
    this.snackBar.open('Eliminado correctamente', 'Close', { duration: 2000 });
  }

  async resetLoadType() {
    this.updateLoadType = false;
    this.load_type = {};
    this.getLoadTypeList();
  }

  /////////////////// LOAD //////////////////////
  
  async addLoad() {
    await this.loadTypeService.addLoad(this.load_type._id, this.load);

    this.loadTypeList = await this.loadTypeService.list();
    this.loadList = this.loadTypeList.filter((load_type) => load_type._id == this.load_type._id)[0].loads
    this.ds_loadList = new MatTableDataSource(this.loadList.sort(this.sortByProperty("name")));
    this.resetLoad();
    this.snackBar.open('Guardado correctamente', 'Close', { duration: 2000 });
  }
  
  async delLoad(load: any) {
    if(!confirm('¿Seguro que desea continuar?')) return null
    await this.loadTypeService.delLoad(this.load_type, load);
    
    this.loadTypeList = await this.loadTypeService.list();
    this.loadList = this.loadTypeList.filter((load_type) => load_type._id == this.load_type._id)[0].loads
    this.ds_loadList = new MatTableDataSource(this.loadList.sort(this.sortByProperty("name")));
    
    this.resetLoad();
    this.snackBar.open('Eliminado correctamente', 'Close', { duration: 2000 });
  }
  async resetLoad() {
    this.updateLoad = false;
    this.load = { name : '' };
  }
  
  /////////////////// LOAD CATEGORY //////////////////////

  async getLoadCategoryDetail(load_category: LoadCategory) {
    this.updateLoadCategory = true;
    this.load_category = load_category;
  }

  async addLoadCategory() {
    await this.loadTypeService.addLoadCategory(this.load_category);
    this.resetLoadCategory();
    this.snackBar.open('Guardado correctamente', 'Close', { duration: 2000 });
  }
  async updLoadCategory() {
    await this.loadTypeService.updLoadCategory(this.load_category);
    this.resetLoadCategory();
    this.snackBar.open('Actualizado correctamente', 'Close', { duration: 2000 });
  }
  async delLoadCategory(load_category: LoadType) {
    if(!confirm('¿Seguro que desea continuar?')) return null
    await this.loadTypeService.delLoadCategory(load_category);
    this.resetLoadCategory();
    this.snackBar.open('Eliminado correctamente', 'Close', { duration: 2000 });
  }
  async resetLoadCategory() {
    this.updateLoadCategory = false;
    this.load_category = {};
    this.getLoadCategoryList();
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