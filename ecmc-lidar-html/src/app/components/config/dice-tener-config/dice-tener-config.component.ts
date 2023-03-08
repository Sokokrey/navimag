import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Login } from 'src/app/models/login';
import { faEdit, faTrash, faBan, faSave } from '@fortawesome/free-solid-svg-icons';

import { DiceTenerService } from 'src/app/services/dice-tener.service';

@Component({
  selector: 'app-dice-tener-config',
  templateUrl: './dice-tener-config.component.html',
  styleUrls: ['./dice-tener-config.component.scss']
})

export class DiceTenerConfigComponent implements OnInit {

  @Input() current_login:Login;
  @Input() dice_tener = { name : '' }

  updateDiceTener: Boolean = false;
  diceTenerList = [];
  ds_diceTener: MatTableDataSource<any>;

  @ViewChild(MatSort) dice_TenerSort: MatSort;
  @ViewChild('dice_tenerPaginator', { read: MatPaginator }) dice_tenerPaginator: MatPaginator;
  
  faEdit = faEdit
  faTrash = faTrash
  faBan = faBan
  faSave = faSave
  constructor(private diceTenerService: DiceTenerService,
              private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.getDiceTenerList()
  }
  
  async getDiceTenerList() {
    this.diceTenerList = await this.diceTenerService.list();
    
    this.ds_diceTener = new MatTableDataSource(this.diceTenerList);
    this.ds_diceTener.paginator = this.dice_tenerPaginator;
    this.ds_diceTener.sort = this.dice_TenerSort;
  }

  async getDiceTenerDetail(dice_tener) {
    this.updateDiceTener = true;
    this.dice_tener = dice_tener;
  }

  async addDiceTener() {
    await this.diceTenerService.addDiceTener(this.dice_tener);
    this.resetDiceTener();
    this.snackBar.open('Guardado correctamente', 'Close', { duration: 2000 });
  }

  async updDiceTener() {
    await this.diceTenerService.updDiceTener(this.dice_tener);
    this.resetDiceTener();
    this.snackBar.open('Actualizado correctamente', 'Close', { duration: 2000 });
  }

  async delDiceTener(dice_tener) {
    await this.diceTenerService.delDiceTener(dice_tener);
    this.resetDiceTener();
    this.snackBar.open('Eliminado correctamente', 'Close', { duration: 2000 });
  }
  
  async resetDiceTener() {
    this.updateDiceTener = false;
    this.dice_tener = { name : '' };
    this.getDiceTenerList();
  }

}
