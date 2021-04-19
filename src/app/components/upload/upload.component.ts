import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NgxGalleryOptions, NgxGalleryAnimation } from 'ngx-gallery';

@Component({
  selector: 'app-upload-component',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponentComponent implements OnInit {
  @Output() valueChange = new EventEmitter();
  galleryOptions: NgxGalleryOptions[];
  public imagePath;
  urls = new Array<any>();
  public message: string;

  constructor() { }

  ngOnInit() {
    this.galleryOptions = [
      {
        image: false,
        thumbnailsRemainingCount: true,
        width: '100%',
        height: '100px',
        thumbnailsColumns: 4,
        previewCloseOnClick : true,
        previewCloseOnEsc: true,
        imageAnimation: NgxGalleryAnimation.Slide
      },
    ];
  }

  preview(files) {
    this.urls = [];

    if (files) {
      for (const file of files) {
        const mimeType = file.type;
        if (mimeType.match(/image\/*/) == null) {
          this.message = 'Only images are supported.';
          return;
        }
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.urls.push({
            small: e.target.result,
            medium: e.target.result,
            big: e.target.result,
          });
        };
        reader.readAsDataURL(file);
      }
      this.valueChange.emit(files);
    }
  }
}
