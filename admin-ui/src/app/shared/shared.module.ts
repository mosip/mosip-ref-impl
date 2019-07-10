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
import { StatusPipe } from '../core/pipes/status.pipe';

@NgModule({
  imports: [CommonModule, MaterialModule, I18nModule],
  declarations: [
    DialogComponent,
    TableComponent,
    ToolbarComponent,
    NotFoundComponent,
    HamburgerComponent,
    ErrorComponent,
    StatusPipe
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
