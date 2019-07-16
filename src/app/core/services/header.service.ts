import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  private Username = '';
  private roles = '';

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
    return x.join(', ').replace('_', ' ');
  }
}
