import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Ng4GeoautocompleteModule } from 'ng4-geoautocomplete';
import { Select2Module } from 'ng2-select2';
import { UploadComponentComponent } from './upload/upload.component';
import { NgxGalleryModule } from 'ngx-gallery';

@NgModule({
    declarations: [ UploadComponentComponent ],
    exports: [ UploadComponentComponent ],
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        Select2Module,
        NgxGalleryModule,
        Ng4GeoautocompleteModule.forRoot()
    ]
})
export class ComponentsModule { }
