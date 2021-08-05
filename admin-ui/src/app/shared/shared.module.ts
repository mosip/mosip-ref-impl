import { ErrorComponent } from './error/error.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogComponent } from './dialog/dialog.component';
import { TableComponent } from './table/table.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { MaterialModule } from './material.module';
import { MatPaginatorIntl } from '@angular/material';
import { I18nModule } from '../i18n.module';
import { HamburgerComponent } from '../shared/hamburger-menu/hamburger-menu.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { StatusPipe } from './pipes/status.pipe';
import { DateFormatPipe } from './pipes/date-format.pipe';
import { MapStatusPipe } from './pipes/map-status.pipe';
import { CreateDateFormatPipe } from './pipes/create-date-format.pipe';

@NgModule({
  imports: [CommonModule, MaterialModule, I18nModule , ReactiveFormsModule, FormsModule],
  declarations: [
    DialogComponent,
    TableComponent,
    ToolbarComponent,
    NotFoundComponent,
    HamburgerComponent,
    ErrorComponent,
    StatusPipe,
    DateFormatPipe,
    MapStatusPipe,
    CreateDateFormatPipe
  ],
  exports: [
    I18nModule,
    DialogComponent,
    TableComponent,
    ToolbarComponent,
    NotFoundComponent,
    MaterialModule,
    HamburgerComponent,
    ErrorComponent,
    StatusPipe,
    DateFormatPipe,
    MapStatusPipe,
    CreateDateFormatPipe
  ],
  entryComponents: [DialogComponent],
  providers: [
    {
      provide: MatPaginatorIntl,
      useClass: ToolbarComponent
    }
  ]
})
export class SharedModule {}
