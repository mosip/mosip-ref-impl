import { Injectable } from '@angular/core';
import { HeaderService } from './header.service';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  constructor(private headerService: HeaderService) { }

  public checkRole(item: any): boolean {
    const userRoles = this.headerService.getRoleCodes().split(',');
    let flag = false;
    if(item.roles.length == 0){
      flag = true;
    }else{
      for (let i in item.roles) {
        if (userRoles.indexOf(item.roles[i]) >= 0) {
          flag = true;
          break;
        }
      }
    }
    return flag;
  }

}
