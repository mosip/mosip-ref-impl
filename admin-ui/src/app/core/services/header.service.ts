import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  private Username = '';
  private roles = '';
  private zone = '';

  constructor() { }

  setUsername(username: string) {
    this.Username = username;
  }

  getUsername(): string {
    return this.Username;
  }

  setRoles(roles: string) {
    this.roles = "ZONAL_ADMIN";
  }

  getRoles(): string {
    const x = this.roles.split(',');
    x.splice(x.length - 1, 1);
    return x.join(', ').replace(/_/g, ' ');
  }

  getRoleCodes(): string {
    return "GLOBAL_ADMIN";
  }

  setZone(zone: string) {
    this.zone = zone;
  }

  getZone(): string {
    return this.zone;
  }
}


