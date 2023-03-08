import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface DialogData {
  files : any
}

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})

export class GalleryComponent implements OnInit {

  expandImg : HTMLImageElement;
  imgExpanded : boolean = false;
  files : any = []

  constructor(public dialogRef: MatDialogRef<GalleryComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  ngOnInit(): void {
    this.expandImg = document.getElementById("expandedImg") as HTMLImageElement;
    this.expandImg.src = this.data.files[0].image;
    this.expandImg.parentElement.style.display = "block";
  }

  expandImage(file) {
    // Get the expanded image
    this.expandImg = document.getElementById("expandedImg") as HTMLImageElement;
    this.expandImg.src = file.image;
    this.expandImg.parentElement.style.display = "block";
  }

}
