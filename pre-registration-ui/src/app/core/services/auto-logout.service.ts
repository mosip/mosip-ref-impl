import { Injectable } from '@angular/core';
import { UserIdleService, UserIdleConfig } from 'angular-user-idle';
import { AuthService } from 'src/app/auth/auth.service';
import { MatDialog } from '@angular/material';
import { DialougComponent } from 'src/app/shared/dialoug/dialoug.component';
import { BehaviorSubject } from 'rxjs';
import { ConfigService } from 'src/app/core/services/config.service';
import * as appConstants from 'src/app/app.constants';
import { DataStorageService } from './data-storage.service';

/**
 * @description This class is responsible for auto logging out user when he is inactive for a
 *  specified period of time.
 * @author Deepak Choudhary
 * @export
 * @class AutoLogoutService
 */

@Injectable({
  providedIn: 'root'
})
export class AutoLogoutService {
  private messageAutoLogout = new BehaviorSubject({});
  currentMessageAutoLogout = this.messageAutoLogout.asObservable();
  isActive = false;

  timer = new UserIdleConfig();
  languagelabels: any;
  langCode = localStorage.getItem('langCode');

  idle: number;
  timeout: number;
  ping: number;
  dialogref;
  dialogreflogout;

  constructor(
    private userIdle: UserIdleService,
    private authService: AuthService,
    private dialog: MatDialog,
    private configservice: ConfigService,
    private dataStorageService: DataStorageService
  ) {}

  /**
   * @description This method gets value of idle,timeout and ping parameter from config file.
   *
   * @returns void
   * @memberof AutoLogoutService
   */
  getValues(langCode) {
    (this.idle = Number(
      this.configservice.getConfigByKey(appConstants.CONFIG_KEYS.mosip_preregistration_auto_logout_idle)
    )),
      (this.timeout = Number(
        this.configservice.getConfigByKey(appConstants.CONFIG_KEYS.mosip_preregistration_auto_logout_timeout)
      )),
      (this.ping = Number(
        this.configservice.getConfigByKey(appConstants.CONFIG_KEYS.mosip_preregistration_auto_logout_ping)
      ));

      this.dataStorageService
      .getI18NLanguageFiles(langCode)
      .subscribe((response) => {
        this.languagelabels = response['autologout'];
      });
    
  }

  setisActive(value: boolean) {
    this.isActive = value;
  }
  getisActive() {
    return this.isActive;
  }

  changeMessage(message: object) {
    this.messageAutoLogout.next(message);
  }
  /**
   * @description This method sets value of idle,timeout and ping parameter from config file.
   *
   * @returns void
   * @memberof AutoLogoutService
   */
  setValues() {
    this.timer.idle = this.idle;
    this.timer.ping = this.ping;
    this.timer.timeout = this.timeout;
    this.userIdle.setConfigValues(this.timer);
  }

  /**
   * @description This method is fired when dashboard gets loaded and starts the timer to watch for
   * user idle. onTimerStart() is fired when user idle has been detected for specified time.
   * After that onTimeout() is fired.
   *
   * @returns void
   * @memberof AutoLogoutService
   */

  public keepWatching() {
    this.userIdle.startWatching();
    this.changeMessage({ timerFired: true });

    this.userIdle.onTimerStart().subscribe(
      res => {
        if (res == 1) {
          this.setisActive(false);
          this.openPopUp();
        } else {
          if (this.isActive) {
            if (this.dialogref) this.dialogref.close();
          }
        }
      },
      () => {},
      () => {}
    );

    this.userIdle.onTimeout().subscribe(() => {
      if (!this.isActive) {
        this.onLogOut();
      } else {
        this.userIdle.resetTimer();
      }
    });
  }

  public continueWatching() {
    this.userIdle.startWatching();
  }
  /**
   * @description This methoed is used to logged out the user.
   *
   * @returns void
   * @memberof AutoLogoutService
   */
  onLogOut() {
    this.dialogref.close();
    this.dialog.closeAll();
    this.userIdle.stopWatching();
    this.popUpPostLogOut();
    this.authService.onLogout();
  }

  /**
   * @description This methoed opens a pop up when user idle has been detected for given time.id
   * @memberof AutoLogoutService
   */

  openPopUp() {
    const data = {
      case: 'POPUP',
      content: this.languagelabels.preview   
    };
    this.dialogref = this.dialog.open(DialougComponent, {
      width: '550px',
      data: data
    });
  }
  popUpPostLogOut() {
    const data = {
      case: 'POSTLOGOUT',
      contentLogout: this.languagelabels.post
    };
    this.dialogreflogout = this.dialog.open(DialougComponent, {
      width: '550px',
      data: data
    });
  }
}
