import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FileUploadDeactivateGuardService } from 'src/app/shared/can-deactivate-guard/file-upload-guard/file-upload-deactivate-guard.service';

import { FileUploadComponent } from './file-upload/file-upload.component';
const routes: Routes = [{ path: '', component: FileUploadComponent ,canDeactivate:[FileUploadDeactivateGuardService] }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FileUploadRoutingModule {}