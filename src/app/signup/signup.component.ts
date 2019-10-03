import { Component, OnInit, ViewChild } from '@angular/core';
import { Signup } from '../models/signup.model';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import flags from './flags.js';
import { UtilService } from '../services/util.service';
import { Login } from '../models/login.model';
import { NgForm } from '@angular/forms';
import * as $ from 'jquery';
import { DomSanitizer } from '@angular/platform-browser';
import { UserService as APIUserService } from '../apis/user.service';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  @ViewChild('signupForm') signupForm: NgForm;
  @ViewChild('signinForm') signinForm: NgForm;
  @ViewChild('forgotPasswordForm') forgotPasswordForm: NgForm;
  @ViewChild('cnForgotPasswordForm') cnForgotPasswordForm: NgForm;
  @ViewChild('pdfViewer1') pdfViewer1;
  @ViewChild('pdfViewer2') pdfViewer2;

  swal: any = null;
  countries: Array<any> = [];
  step: number = null;
  text: string = null;
  images: any = null;
  termsURL: any = null;
  policyURL: any = null;
  timerId: any = null;
  phoneNumber: string = null;
  selectedCountry: any = null;
  verificationNumber = '';
  code: Array<number> = [];
  sendCode = false;
  createCodeBtn = false;
  private interval: number;

  session: any = false;
  medium: any = 'sms';
  destination: any = false;
  isSubmitted = false;
  twoFactorAuth = false;
  codeSignin: Array<number> = [];
  sendCodeSignin = false;
  verificationNumberSignin = '+XXXXXXXX37';
  screenStep = 2;
  displayPP = false;

  sPasswordSignin = false;
  sPasswordSignup = false;
  sCnPasswordSignup = false;
  forgotPasswordUsername: string = null;
  signin: Login = {
    username: null,
    password: null
  };
  public signup: Signup = {
    username: null,
    email: null,
    password: null,
    confirmPassword: null,
    country: null,
    terms: false
  };
  cnForgotPassword: any = {
    username: undefined,
    code: undefined,
    password: undefined
  };
  email = '';
  completeItems = [];
  focusItems = [];

  constructor(
    private _userService: APIUserService,
    private authService: AuthService,
    private userService: UserService,
    private utilService: UtilService,
    private router: Router,
    private sanitizer: DomSanitizer,
    public route: ActivatedRoute,
  ) {
    this.interval = 10000; // 10 seconds
    if (localStorage.getItem('country')) {
      this.selectedCountry = JSON.parse(localStorage.getItem('country'));
    }
    this.loadCountries();
    this.loadTerms();
    this.verifyRedirect();
  }

  ngOnInit() {
  }

  setFocus(index) {
    this.focusItems[index] = true;
    this.completeItems[index] = true;
  }

  removeFocus(index, val) {
    this.focusItems[index] = false;
    if (!val) {
      this.completeItems[index] = false;
    }
  }

  verifyRedirect() {
    return new Promise((resolve) => {
      this.route.queryParams.subscribe(
        (params: any) => {
          this.screenStep = 2;
          const step = params['step'];
          if (step === 'verify') {
            this.step = 4;
          } else {
            this.step = 1;
          }
          resolve();
        }
      );
    });
  }

  loadCountries() {
    this.authService.getCountriesLocal()
      .subscribe(
        (data: any) => {
          this.countries = data;
          this.countries = this.countries.map(country => {
            const image_name = 'flag_' + country.code;
            const image = flags[image_name];
            return {
              ...country,
              image
            };
          });
        },
        (error: any) => {
        }
      );
  }

  loadTerms() {
    this.utilService.getApiVersions().subscribe(
      (data: any) => {
        if (data.success) {
          for (let i = 0; i < data.data.links.length; i++) {
            switch (data.data.links[i].type) {
              case 'TERMS_OF_USE':
                this.termsURL = this.sanitizer.bypassSecurityTrustResourceUrl(`${data.data.links[i].url}`);
              break;
              case 'PRIVACY_POLICY':
                this.policyURL = this.sanitizer.bypassSecurityTrustResourceUrl(`${data.data.links[i].url}`);
              break;
            }
          }
        } else {
        }
      },
      (error: any) => {
      }
    );
  }

  submit(signupForm) {
    const isValid = signupForm.valid;
    const signup = signupForm.value;
    if (isValid) {
      this.email = signup.email;
      const data = {
        email: signup.email,
        username: signup.username,
        password: signup.password,
        country: this.selectedCountry.code,
        overrideValidation: true,
        confirmationMethod: 'email'
      };
      this.isSubmitted = true;
      this.authService.Signup(data).subscribe(
        (res: any) => {
          this.isSubmitted = false;
          if (res.success) {
            swal('Success', 'Your signup was successful', 'success')
              .then(() => {
                this.acceptTerms();
              });
          } else {
            swal('Error', res.error[0].message, 'error');
          }
        },
        (error: any) => {
          this.isSubmitted = false;
          swal('Error', (error.error && error.error[0].message) || error.statusText, 'error');
        }
      );
    } else {
      $('input.ng-invalid')[0].focus();
    }
  }

  acceptTerms() {
    this.loginUser();
    this.timerId = setInterval(() => this.checkVerification(), this.interval);
  }

  loginUser() {
    const data = {
      username: this.signup.username,
      password: this.signup.password
    };
    this.isSubmitted = true;
    this.authService.login(data)
      .subscribe(
        (res: any) => {
          this.isSubmitted = false;
          if (res.success) {
            this.email = res.data.user.email;
            localStorage.setItem('accessToken', res.data.accessToken);
            this._userService.updateLocal(res.data.user);
            this.step = 3;
          } else {
            this.isSubmitted = false;
            swal('Error', 'Two factor authentication was not done.', 'error');
          }
        },
        (error: any) => {
          this.isSubmitted = false;
          swal('Error', error.error.error[0].message || error.statusText, 'error');
        }
      );
  }

  checkVerification() {
    this.isSubmitted = true;
    this.userService.getUser()
      .subscribe(
        (data: any) => {
          this.isSubmitted = false;
          if (data.success) {
            if (data.data.emailVerified) {
              this.step = 4;
              clearInterval(this.timerId);
            }
          } else {
          }
        },
        (error: any) => {
          this.isSubmitted = false;
        }
      );
  }

  createCode() {
    if (this.selectedCountry && this.phoneNumber) {
      const userNumber = this.selectedCountry.dial_code + this.phoneNumber;
      if (this.selectedCountry.dial_code === '+1') {
        this.verificationNumber = '(XXX) XXX-XX' + this.phoneNumber.slice(-2);
      } else {
        this.verificationNumber = '+ XXX XXX XXX XX' + this.phoneNumber.slice(-2);
      }
      this.isSubmitted = true;
      this.userService.updateUser({ phone: userNumber })
        .subscribe(
          (data: any) => {
            this.isSubmitted = false;
            if (data.success) {
              swal('Success', 'Verification Code Sent', 'success')
                .then(() => {
                  this.step += 1;
                });
            } else {
              swal('Error', data.error[0].message, 'error');
            }
          },
          (error: any) => {
            this.isSubmitted = false;
            swal('Error', error.error.error[0].message, 'error');
          }
        );
    } else {
      swal('Error', 'Complete fields', 'error');
    }
  }

  onPhoneChange(event) {
    if (event.target.value) {
      this.createCodeBtn = true;
    } else {
      this.createCodeBtn = false;
    }
  }

  submitCode() {
    if (this.twoFactorAuth) {
      this.onCodeSubmit();
    } else {
      let mobileCode = '';
      this.code.forEach(el => {
        mobileCode += el.toString();
      });
      const data = {
        username: this.signup.username,
        code: mobileCode
      };
      this.isSubmitted = true;
      this.authService.signupCodeVerification(data)
        .subscribe(
          (res: any) => {
            this.isSubmitted = false;
            if (res.success) {
              localStorage.setItem('fullVerified', 'yes');
              swal('Success', 'Code Verified', 'success')
                .then(() => {
                  this.step += 1;
                });
            } else {
              swal('Error', res.error[0].message, 'error');
            }
          },
          (error: any) => {
            this.isSubmitted = false;
          }
        );
    }
  }

  useAnotherPhone() {
    this.step = 4;
  }

  resendCode() {
    this.isSubmitted = true;
    this.authService.resendCode({ username: this.signup.username || this.signin.username })
      .subscribe(
        (data: any) => {
          this.isSubmitted = false;
          if (data.success) {
            swal('Success', 'Confirmation Code Send', 'success');
          } else {
            swal('Error', data.error[0].message, 'error');
          }
        },
        (error: any) => {
          this.isSubmitted = false;
        }
      );
  }

  onCountryChange(event) {
    this.selectedCountry = event;
    localStorage.setItem('country', JSON.stringify(this.selectedCountry));
  }

  onProceed() {
    this.router.navigate(['portfolio']);
  }

  onCodeChange(event) {
    if (event.target) {
      const index = parseInt(event.target.name, 10);
      if (event.target.value) {
        this.code[index] = parseInt(event.target.value, 10);
      } else {
        this.code[index] = -1;
      }
      if (this.code.length === 6) {
        this.sendCode = !this.code.includes(-1);
      }
    }
    if (event.target.value) {
      const element = event.srcElement.nextElementSibling;
      if (element === null) {
        return;
      }
      element.focus();
      element.setSelectionRange(0, 0);
    }
  }
  // Signin methods

  toggleShowPassword(event) {
    const id = event.target.id;
    switch (id) {
      case 'showPasswordSignin':
        this.sPasswordSignin = !this.sPasswordSignin;
        break;
      case 'showPasswordSignup':
        this.sPasswordSignup = !this.sPasswordSignup;
        break;
      case 'showCnPasswordSignup':
        this.sCnPasswordSignup = !this.sCnPasswordSignup;
    }
  }

  onSubmit(signinForm) {
    const isValid = signinForm.valid;
    const signinInfo = signinForm.value;
    if (isValid) {
      this.isSubmitted = true;
      this.authService.login(signinInfo)
        .subscribe(
          (data: any) => {
            this.isSubmitted = false;
            if (data.success) {
              localStorage.setItem('accessToken', data.data.accessToken);
              if (data.data.user) {
                localStorage.setItem('user', JSON.stringify(data.data.user));
                this._userService.updateLocal(data.data.user);
                this.signin = data.data.user;
                this.signup = data.data.user;
              }
              if (data.data.twoFactorAuth) {
                localStorage.setItem('session', data.data.session);
                localStorage.setItem('fullVerified', 'yes');
                this.session = data.data.session;
                if (data.data.twoFactorData.type === 'sms') {
                  this.medium = data.data.twoFactorData.CODE_DELIVERY_DELIVERY_MEDIUM.toLowerCase();
                  this.destination = data.data.twoFactorData.CODE_DELIVERY_DESTINATION;
                  this.verificationNumber = '+ XXX XXX XXX XX' + this.destination.slice(-2);
                  this.signin.username = data.data.twoFactorData.USER_ID_FOR_SRP;
                  swal('Success', 'Verification Code Send ', 'success')
                    .then(res => {
                      this.twoFactorAuth = true;
                      this.step = 5;
                    });
                } else if (data.data.twoFactorData.type === 'softwareToken') {
                    // Handle google auth 2FA
                    this.medium = data.data.twoFactorData.type;
                    this.signin.username = data.data.twoFactorData.USER_ID_FOR_SRP;
                    this.twoFactorAuth = true;
                    this.step = 5;
                }
              } else {
                if (!data.data.user.emailVerified) {
                  this.step = 3;
                } else {
                  if (!data.data.user.phoneVerified) {
                    this.step = 4;
                  } else {
                    localStorage.setItem('fullVerified', 'yes');
                    this.router.navigate(['portfolio']);
                  }
                }
              }
            } else {
              swal('Error', data.error[0].message, 'error');
            }
          },
          (error: any) => {
            this.isSubmitted = false;
          }
        );
    } else {
      $('input.ng-invalid')[0].focus();
    }
  }

  onCodeSubmit() {
    let mobileCode = '';
    if (!this.isSubmitted) {
      this.isSubmitted = true;
      this.code.forEach(el => {
        mobileCode += el.toString();
      });
      this.isSubmitted = true;
      this.authService.loginCode(this.signin.username, this.session, mobileCode, this.medium)
        .subscribe(
          (data: any) => {
            this.isSubmitted = false;
            if (data.success) {
              localStorage.setItem('accessToken', data.data.accessToken);
              localStorage.setItem('user', JSON.stringify(data.data.user));
              localStorage.setItem('fullVerified', 'yes');
              this._userService.updateLocal(data.data.user);
              swal('Success', 'Welcome to Spend', 'success')
                .then(res => {
                  this.router.navigate(['portfolio']);
                });
            } else {
              swal('Error', data.error[0].message, 'error');
            }
          },
          (error: any) => {
            this.isSubmitted = false;
          }
        );
    }
  }

  resendCodeSignin() {
    this.isSubmitted = true;
    this.authService.resendCode({ username: this.signin.username })
      .subscribe(
        (data: any) => {
          this.isSubmitted = false;
          if (data.success) {
            swal('Success', 'Confirmation Code Send', 'success');
          } else {
            swal('Error', data.error[0].message, 'error');
          }
        },
        (error: any) => {
          this.isSubmitted = false;
        }
      );
  }

  onPageToggle(event) {
    const id = event.target.id;
    if (id === 'signupLbl') {
      this.screenStep = 1;
      // this.step = 5
    } else if (id === 'signinLbl') {
      this.screenStep = 2;
    }
  }

  toggleDisplayPP() {
    this.displayPP = true;
  }

  onPdfError(event) {
  }

  onProgress(progressData: any) {
  }

  onSignupPage() {
    this.screenStep = 1;
    this.step = 1;
  }

  onLoginPage() {
    this.step = 1;
    this.screenStep = 2;
  }

  onForgotPasswordPage() {
    this.screenStep = 3;
  }

  onShowLegal(displayPP) {
    this.step = 2;
    this.displayPP = displayPP;
    this.loadTerms();
  }

  toggleLegalTab(displayPP) {
    this.displayPP = displayPP;

  }

  onForgotPassword(forgotPasswordForm) {
    const form = forgotPasswordForm.value;
    this.cnForgotPassword.username = form.forgotPasswordUsername;
    if (forgotPasswordForm.valid) {
      this.isSubmitted = true;
      this.authService.password(form.forgotPasswordUsername)
        .subscribe(
          (data: any) => {
            this.isSubmitted = false;
            if (data.success) {
              this.screenStep = 4;
              this.cnForgotPassword.username = data.forgotPasswordUsername;
            } else {
              swal('Error', data.error[0].message, 'error');
            }
          },
          (error: any) => {
          }
        );
    }
  }

  onCnForgotPassword(cnForgotPasswordForm) {
    if (cnForgotPasswordForm.valid) {
      this.isSubmitted = true;
      this.authService.passwordUpdated(this.forgotPasswordUsername, this.cnForgotPassword.code, this.cnForgotPassword.password)
        .subscribe(
          (data: any) => {
            this.isSubmitted = false;
            if (data.success) {
              swal('Success', 'Password updated', 'success')
              .then(() => {
                this.screenStep = 2;
              });
            } else {
              swal('Error', data.error[0].message, 'error');
            }
          },
          (error: any) => {
          }
        );
    }
  }
}
