import { Injectable } from "@angular/core";
import { CanDeactivate } from "@angular/router/src/utils/preactivation";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { FileUploadComponent } from "src/app/feature/file-upload/file-upload/file-upload.component";
import { AuthService } from "src/app/auth/auth.service";

@Injectable({
  providedIn: "root",
})
export class FileUploadDeactivateGuardService implements CanDeactivate {
  component: Object;
  route: ActivatedRouteSnapshot;

  constructor(private authService: AuthService) {}

  canDeactivate(component: FileUploadComponent) {
    if (!this.authService.isAuthenticated()) {
      return true;
    } else {
      let deActivate = component.canExit();
      let msg = component.errorlabels;
      this.authService.isAuthenticated();
      console.log(msg);
       console.log(msg.fileUploadDeactivateMsg);
      if (!deActivate) {
        const messageObj = {
          case: "MESSAGE",
          title: "",
          message: msg.fileUploadDeactivateMsg,
        };
        component.openDialog(messageObj, "250px");
      }
      return deActivate;
    }
  }
}
