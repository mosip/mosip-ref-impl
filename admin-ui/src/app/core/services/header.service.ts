import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  private Username = '';
  private roles = '';
  private zone = '';
  private displayUserName = '';
  private userPreferredLanguage = '';
  
  constructor() { }

  setUsername(username: string) {
    this.Username = username;
  }

  getUsername(): string {
    return this.Username;
  }

  setRoles(roles: string) {
    this.roles = roles;
  }

  getRoles(): string {
    const x = this.roles.split(',');
    x.splice(x.length - 1, 1);
    return x.join(', ').replace(/_/g, ' ');
  }

  getRoleCodes(): string {
    return this.roles;
  }

  setZone(zone: string) {
    this.zone = zone;
  }

  getZone(): string {
    return this.zone;
  }

  setDisplayUserName(displayUserName: string) {
    this.displayUserName = displayUserName;
  }

  getDisplayUserName(): string {
    return this.displayUserName;
  }

  setUserPreferredLanguage(userPreferredLanguage: string) {
    this.userPreferredLanguage = userPreferredLanguage;
  }

  getUserPreferredLanguage(): string {
    if(this.userPreferredLanguage){
      return this.userPreferredLanguage;
    }else{
      return "eng";
    }    
  }

}


