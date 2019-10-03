import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { UserService } from '../apis/user.service';
import { User } from '../models/user.model';
import { AlertService } from '../services/alert.service';
import { ChangePhoneModalComponent } from '../change-phone-modal/change-phone-modal.component';
import { AuthService } from '../services/auth.service';
import { Personal } from '../models/personal.model';
import { GoogleAuthModalComponent } from '../google-auth-modal/google-auth-modal.component';
import { UtilService } from '../services/util.service';
import { Router } from '@angular/router';

declare let intlTelInputUtils: any;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  @ViewChild('changePhoneModal') changePhoneModal: ChangePhoneModalComponent;
  @ViewChild('googleAuthModal') googleAuthModal: GoogleAuthModalComponent;


  model: any = {
    user: Personal
  };
  ng2TelInputOptions = {
    nationalMode: true,
    utilsScript: '../../build/js/utils.js'
  };
  user: User = {
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    zipcode: '',
    country: '',
    city: '',
    state: '',
    address: '',
    birthdate: '',
    address2: '',
    phoneVerified: false,
    tierLevel: 0,
    mfa: false,
    softwareMfa: false,
    trackingAddresses: [],
    availableMfa: [],
    last_login_at: '',
    last_login_ip: '',
    avatar: '/assets/images/user-icon.jpg'
  };
  emailReadonly = '';
  phonePlaceHolder = '';
  states: any[];
  countries: any[];
  intlTelInputHolder: any;

  constructor(
    private router: Router,
    private alertService: AlertService,
    private authService: AuthService,
    private utilService: UtilService,
    public userService: UserService) {

  }

  telInputObject($event) {
    this.intlTelInputHolder = $event;
  }

  prepareUser() {
    this.user = this.userService.currentUser;
    if (this.user) {
      if (this.user.avatar) {
        this.user.avatar = this.user.avatar + '?t=' + new Date().getTime();
      }
      this.model = { user: new Personal(this.user) };
      this.hideEmail();
      this.phonePlaceHolder = this.user.phone.replace(/[+,\d](?=\d{3})/g, 'x');
      this.intlTelInputHolder.intlTelInput('setNumber', this.user.phone);
      this.intlTelInputHolder.intlTelInput('setNumber', this.phonePlaceHolder);
    }

  }

  ngOnInit() {
    this.utilService.showLoading.next(true);
    this.userService.me().subscribe(r => {
      this.prepareUser();

      this.authService.getCountries().subscribe(
        (data: any) => {
          this.utilService.showLoading.next(false);
          if (data.success) {
            this.countries = data.data;
            this.onCountrySelect();

          }
        }, (err) => {
          this.utilService.showLoading.next(false);
        }
      );
    });

  }


  onCountrySelect() {
    this.states = [];
    this.authService.getStates(this.model.user.country).subscribe(
      (data: any) => {
        if (data.success) {
          this.states = data.data;
        }
      }
    );
  }

  showEmail() {
    this.emailReadonly = this.user.email;
  }

  hideEmail() {
    this.emailReadonly = this.user.email
      .replace(/(\w)(\w+)(@.*)(\..*)/ig, '$1***@***$4');
  }

  changeEmail(nForm) {

    if (!this.model.email) {
      this.alertService.error('Missing email address!');
      return;
    } else if (!nForm.valid) {
      this.alertService.error('Invalid email address!');
      return;
    }
    this.userService.updateEmail(this.model.email)
      .subscribe((r: any) => {
        if (r.success) {
          this.alertService.success('Email Address updated successful.');
          this.prepareUser();
        } else {
          this.alertService.error(r.error[0].message);
        }
      }, error => {
        this.alertService.error(error.statusText);
      });
    {

    }
  }


  changePassword(nForm) {

    if (!this.model.oldPassword) {
      this.alertService.error('Missing old password!');
      return;
    } else if (!this.model.newPassword || this.model.newPassword.length < 6) {
      this.alertService.error('Missing new password or less the 6 chars!');
      return;
    } else if (!this.model.confirmPassword || this.model.newPassword.length < 6) {
      this.alertService.error('Missing confirm new password or less the 6 chars!');
      return;
    } else if (this.model.confirmPassword !== this.model.newPassword) {
      this.alertService.error('New password and confirm new password does not match!');
      return;
    }

    this.userService.updatePassword(this.model.oldPassword, this.model.newPassword)
      .subscribe(r => {
        if (r.success) {
          this.prepareUser();
          this.alertService.success('Password updated successful.');
        } else {
          this.alertService.error(r.error[0].message);
        }
      }, error => {
        this.alertService.error((error.error && error.error.message) ?
          error.error.message
          : error.statusText);
      });

  }

  changePhone(resend = false) {
    this.changePhoneModal.openModal(resend)
      .subscribe(r => {
        this.userService.me()
          .subscribe(r2 => {
            this.prepareUser();
          });
      });
  }

  googleAuth() {
    this.googleAuthModal.openModal()
      .subscribe(r => {
        this.userService.me()
          .subscribe(r2 => {
            this.prepareUser();
          });
      });
  }

  phone2FA() {
    if (this.user.phoneVerified) {
      this.userService.update({ mfa: !this.user.mfa })
        .subscribe(
          (data: any) => {
            this.prepareUser();
            if (data.success) {
              if (data.data.mfa) {
                swal('Success', 'SMS Authentication activated', 'success');
              } else {
                swal('Success', 'SMS Authentication disabled', 'success');
              }
            } else {
              swal('Error', data['error'][0]['message'] || data['errors'][0]['message'], 'error');
            }
          },
          (error: any) => {
          }
        );
    }
  }

  changePersonalInformation(nForm) {
    if (this.model.user.year + 18 > new Date().getFullYear()) {
      this.alertService.error('Invalid birthday!');
      return;
    }
    if (nForm.valid) {
      this.userService.update(this.model.user.getChanges())
        .subscribe((r: any) => {
          if (r.success) {
            this.alertService.success('Your personal information updated successful.');
            this.prepareUser();
          } else {
            this.alertService.error(r['error'][0]['message']);
          }
        });
    } else {
      this.alertService.error('Invalid form value!');
    }
  }

  onAvatarUpload(files) {
    const allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif)$/i;
    const imgFile = files[0];
    if (!allowedExtensions.exec(imgFile.name)) {
      this.alertService.error('Invalid File type');
    } else {
      this.utilService.getBase64(imgFile).then(img => {
        this.userService.update({ avatar: img }).subscribe(
          (response: any) => {
            if (response.success) {
              this.user.avatar = response.data.avatar + '?t=' + new Date().getTime();
              this.updateLocalUser(this.user);
              this.alertService.success('Avatar Updated');
            } else {
              this.alertService.error('Invalid File type');
            }
          },
          (error: any) => {
            this.alertService.error('Invalid File type');
          }
        );
      });
    }
  }

  onVerification() {
    this.router.navigate(['verification']);
  }

  updateLocalUser(user) {
    this.userService.updateLocal(user);
  }

}
