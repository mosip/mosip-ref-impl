import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DynamicuiComponent } from './dynamicui/dynamicui.component';

const routes: Routes = [
	{
	    path: '',
	    component: DynamicuiComponent
  	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DynamicuiRoutingModule { }