import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(private router: Router) { }

  centerView(centerId: string, url: string) {
    url = url.replace('$id', centerId);
    this.router.navigateByUrl(url);
  }
}
