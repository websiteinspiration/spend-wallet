import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UtilService } from '../services/util.service';

@Component({
  selector: 'app-register-alert',
  templateUrl: './register-alert.component.html',
  styleUrls: ['./register-alert.component.scss']
})
export class RegisterAlertComponent implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private utilService: UtilService
  ) {
    this.verifyRedirect()
      .then(res => {
        if (this.getMobileOperatingSystem() !== 'Android' && this.getMobileOperatingSystem() !== 'iOS') {
          if (res === 'register') {
            // redirect URL is correct
            this.router.navigate(['signup'], { queryParams: {step: 'verify'}});
          } else {
            // redirect URL is incorrent redirecting to login
            this.router.navigate(['signup']);
          }
        } else if (this.getMobileOperatingSystem() === 'Android') {
          window.open('https://play.google.com/store/apps/details?id=com.spend.app', '_self');
        } else if (this.getMobileOperatingSystem() === 'iOS') {
          window.open('https://itunes.apple.com/app/id1357740381', '_self');
        }
      });
   }

  ngOnInit() {
  }

  verifyRedirect() {
    return new Promise ( (resolve) => {
      this.route.queryParams.subscribe(
        (params: any) => {
          const alertType = params['alertType'];
          if (alertType) {
            this.utilService.getAlerts().subscribe(
              (data: any) => {
                const { message, type } = data[alertType];
                if (message) {
                  // TODO: Use this style.
                  swal({
                    title: type,
                    icon: type,
                    text: message,
                    buttons: {
                      confirm: {
                        text: 'PROCEED',
                        className: 'btn btn-primary'
                      }
                    },
                    closeOnClickOutside: false
                  })
                    .then(() => {
                        if (type === 'success') {
                          resolve('register');
                        } else {
                          resolve('login');
                        }
                    });
                } else {
                  resolve('login');
                }
              },
              (error: any) => {
              }
            );
          } else {
            resolve('login');
          }
        }
      );
    });
  }

  getMobileOperatingSystem() {
    const userAgent = navigator.userAgent || navigator.vendor || window['opera'];
      if (/windows phone/i.test(userAgent)) {
          return 'Windows';
      }
      if (/android/i.test(userAgent)) {
          return 'Android';
      }
      if (/iPad|iPhone|iPod/.test(userAgent) && !window['MSStream']) {
          return 'iOS';
      }
      return 'unknown';
  }
}
