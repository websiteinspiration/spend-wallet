import { async, ComponentFixture, TestBed, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { SignupComponent } from './signup.component';
import { of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { UtilService } from '../services/util.service';
import { FormsModule } from '@angular/forms';
import { APP_BASE_HREF } from '@angular/common';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { AlertModule, BsDropdownModule, CollapseModule, ModalModule, TooltipModule } from 'ngx-bootstrap';

import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRouteStub } from '../../testing/activated-route-stub';

import { APIsModule } from '../apis/apis.module';
import { Ng2TelInputModule } from 'ng2-tel-input';
import { InViewportModule } from 'ng-in-viewport';
import { NgSelectModule } from '@ng-select/ng-select';
import { ProgressbarModule } from 'ngx-bootstrap';
import { NgxMaskModule } from 'ngx-mask';
import { SweetAlert2Module } from '@toverux/ngx-sweetalert2';
import { ClipboardModule } from 'ngx-clipboard';
import { NgxQRCodeModule } from 'ngx-qrcode2';


import { SendModalComponent } from '../send-modal/send-modal.component';
import { ReceiveModalComponent } from '../receive-modal/receive-modal.component';

import { UpperMenuComponent } from '../upper-menu/upper-menu.component';
import { ProfileComponent } from '../profile/profile.component';
import { ChangePhoneModalComponent } from '../change-phone-modal/change-phone-modal.component';
import { GoogleAuthModalComponent } from '../google-auth-modal/google-auth-modal.component';
import { TextMaskModule } from 'angular2-text-mask';
import { RegisterAlertComponent } from '../register-alert/register-alert.component';
import { CardComponent } from '../card/card.component';
import { ChartComponent } from '../chart/chart.component';
import { PortfolioComponent } from '../portfolio/portfolio.component';
import { CardSettingsComponent } from '../card-settings/card-settings.component';
import { ExchangeComponent } from '../exchange/exchange.component';
import { ExchangeModalComponent } from '../exchange-modal/exchange-modal.component';
import { BankComponent } from '../bank/bank.component';

import { VerificationComponent } from '../verification/verification.component';
import { DocsComponent } from '../docs/docs.component';
import { WalletChartComponent } from '../wallet-chart/wallet-chart.component';
import { BankFormModalComponent } from '../bank-form-modal/bank-form-modal.component';
import { BuySellComponent } from '../buy-sell/buy-sell.component';

import { routes } from '../app-routing.module';

import { expectSwalText } from '../../testing/helpers';
import { MainAssetComponent } from '../main-asset/main-asset.component';
import { Component, Input } from '@angular/core';
import { OrderCardComponent } from '../order-card/order-card.component';
import { SlickModule } from 'ngx-slick';
import { WalletComponent } from '../wallet/wallet.component';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let activatedRoute: ActivatedRouteStub;
  let mockAuthService;
  let mockUserService;
  let mockUtilService;

  beforeEach(async(() => {
    activatedRoute = new ActivatedRouteStub();
    mockAuthService = jasmine.createSpyObj([
      'Signup', 'login', 'getCountriesLocal', 'signupCodeVerification', 'loginCode',
      'isAuthenticated', 'resendCode', 'password', 'passwordUpdated']);
    mockUserService = jasmine.createSpyObj(['getUser', 'updateUser']);
    mockUtilService = jasmine.createSpyObj(['getApiVersions']);

    TestBed.configureTestingModule({
      declarations: [
        WalletComponent,
        SendModalComponent,
        ReceiveModalComponent,
        UpperMenuComponent,
        ProfileComponent,
        ChangePhoneModalComponent,
        GoogleAuthModalComponent,
        SignupComponent,
        RegisterAlertComponent,
        CardComponent,
        ChartComponent,
        PortfolioComponent,
        CardSettingsComponent,
        ExchangeComponent,
        ExchangeModalComponent,
        VerificationComponent,
        DocsComponent,
        WalletChartComponent,
        BankComponent,
        BankFormModalComponent,
        BuySellComponent,
        MainAssetComponent,
        MockCurrencyModalComponent,
        OrderCardComponent
      ],
      imports: [
        FormsModule,
        RouterTestingModule.withRoutes(routes),
        APIsModule,
        Ng2TelInputModule,
        InViewportModule,
        ClipboardModule,
        NgxQRCodeModule,
        AlertModule.forRoot(),
        PerfectScrollbarModule,
        ModalModule.forRoot(),
        CollapseModule.forRoot(),
        BsDropdownModule.forRoot(),
        NgxMaskModule.forRoot(),
        TextMaskModule,
        TooltipModule.forRoot(),
        NgSelectModule,
        ProgressbarModule.forRoot(),
        NgxMaskModule.forRoot(),
        SweetAlert2Module.forRoot(),
        SlickModule
      ],
      providers: [
        {provide: AuthService, useValue: mockAuthService},
        {provide: UserService, useValue: mockUserService},
        {provide: UtilService, useValue: mockUtilService},
        {provide: APP_BASE_HREF, useValue: '/'},
        {provide: ActivatedRoute, useValue: activatedRoute},
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    activatedRoute.setUrls(['signup']);
    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', fakeAsync(() => {
    expect(component).toBeTruthy();
  }));

  it('SignupComponent: submit', fakeAsync(() => {
    mockAuthService.Signup.and.returnValue(of({success: true}));
    mockAuthService.login.and.returnValue(of({
      success: true,
      data: {
        accessToken: 'FAKE_TOKEN',
        user: {
          email: 'test@gmail.com',
        }
      }
    }));
    const signupForm = {
      valid: true,
      value: {
        email: 'test@gmail.com',
        username: 'teser',
        password: 'abc123456',
        country: 'US'
      }
    };
    component.submit(signupForm);

    tick();
    expectSwalText('Your signup was successful');

    expect(component.step).toBe(3);
    tick();

    expect(localStorage.getItem('accessToken')).toBe('FAKE_TOKEN');
    discardPeriodicTasks();
  }));

  it('SignupComponent: verifyRedirect', fakeAsync(() => {
    mockAuthService.getCountriesLocal.and.returnValue(of([]));
    mockUtilService.getApiVersions.and.returnValue(of({
      success: true,
      data: {
        links: [
          {
            type: 'TERMS_OF_USE',
            url: 'terms'
          },
          {
            type: 'PRIVACY_POLICY',
            url: 'privacy'
          },
        ]
      }
    }));
    activatedRoute.setUrls(['signup']);
    component.verifyRedirect();
    tick();
    expect(component.screenStep).toBe(1);

    activatedRoute.setUrls(['signin']);
    component.verifyRedirect();
    tick();
    expect(component.screenStep).toBe(2);

    activatedRoute.setQueryParams({ step: 'verify' });
    tick();
    expect(component.step).toBe(4);

    activatedRoute.setQueryParams({ step: 'something' });
    tick();
    expect(component.step).toBe(1);
  }));

  it('SignupComponent: loadCountries', fakeAsync(() => {
    mockAuthService.getCountriesLocal.and.returnValue(of([
      {code: 'US'},
      {code: 'CA'},
      {code: 'CN'},
    ]));
    component.loadCountries();
    tick();

    expect(component.countries.length).toBe(3);
    expect(component.countries[0].image).toBe('/_karma_webpack_/us.svg');
  }));

  it('SignupComponent: loadTerms', fakeAsync(() => {
    mockUtilService.getApiVersions.and.returnValue(of({
      success: true,
      data: {
        links: [
          {
            type: 'TERMS_OF_USE',
            url: 'terms'
          },
          {
            type: 'PRIVACY_POLICY',
            url: 'privacy'
          },
        ]
      }
    }));
    component.loadTerms();
    tick();

    expect(component.termsURL).toBeDefined();
    expect(component.policyURL).toBeDefined();
    expect(component.termsURL.changingThisBreaksApplicationSecurity).
      toBe('terms');
    expect(component.policyURL.changingThisBreaksApplicationSecurity).
      toBe('privacy');
  }));

  it('SignupComponent: acceptTerms', fakeAsync(() => {
    mockAuthService.login.and.returnValue(of({
      success: true,
      data: {
        accessToken: 'FAKE_TOKEN',
        user: {
          email: 'test@gmail.com'
        }
      }
    }));
    component.acceptTerms();
    tick();

    expect(component.step).toBe(3);
    expect(component.email).toBe('test@gmail.com');
    expect(localStorage.getItem('accessToken')).toBe('FAKE_TOKEN');
    expect(component.timerId).toBeGreaterThan(0);

    discardPeriodicTasks();
  }));

  it('SignupComponent: checkVerification', fakeAsync(() => {
    mockUserService.getUser.and.returnValue(of({
      success: true,
      data: {
        emailVerified: true
      }
    }));
    component.checkVerification();
    tick();
    expect(component.step).toBe(4);
    expect(component.isSubmitted).toBe(false);
  }));

  it('SignupComponent: createCode', fakeAsync(() => {
    mockUserService.updateUser.and.returnValue(of({
      success: true,
    }));
    component.step = 4;
    component.selectedCountry = { dial_code: '+1' };
    component.phoneNumber = '2617613391';
    component.createCode();
    tick();
    expect(component.verificationNumber).toBe('(XXX) XXX-XX91');

    component.selectedCountry = { dial_code: '+2' };
    component.phoneNumber = '2617613391';
    component.createCode();
    tick();
    expect(component.verificationNumber).toBe('+ XXX XXX XXX XX91');
    expect(component.isSubmitted).toBe(false);

    expectSwalText('Verification Code Sent');

    expect(component.step).toBe(5);

    discardPeriodicTasks();
  }));

  it('SignupComponent: onPhoneChange', fakeAsync(() => {
    component.onPhoneChange({ target: {value: 'somthing'} });
    expect(component.createCodeBtn).toBeTruthy();

    component.onPhoneChange({ target: {value: undefined} });
    expect(component.createCodeBtn).toBeFalsy();
  }));

  it('SignupComponent: submitCode', fakeAsync(() => {
    mockAuthService.loginCode.and.returnValue(of({
      success: true,
      data: {
        accessToken: 'token',
        user: {
          email: 'test@test.com'
        }
      }
    }));
    mockAuthService.signupCodeVerification.and.returnValue(of({
      success: true
    }));
    mockAuthService.isAuthenticated.and.returnValue(true);
    component.twoFactorAuth = false;
    component.step = 5;
    component.signup = {
      username: 'user1',
      email: null,
      password: null,
      confirmPassword: null,
      country: null,
      terms: false
    };
    component.code = [1, 2, 3, 4, 5, 6];
    component.submitCode();

    // Success Testing
    expectSwalText('Code Verified');

    expect(component.step).toBe(6);

    // Fail Testing
    component.step = 5;
    component.signup.username = 'user2';

    component.submitCode();
    expectSwalText('Code Verified');


    component.twoFactorAuth = true;
    component.step = 5;
    component.signin = {
      username: 'user1',
      password: null,
    };
    component.code = [1, 2, 3, 4, 5, 6];
    component.submitCode();

    // Success Testing
    expectSwalText('Welcome to Spend');

    discardPeriodicTasks();

  }));

  it('SignupComponent: resendCode', fakeAsync(() => {
    mockAuthService.resendCode.and.returnValue(of({
      success: true
    }));
    component.signin = {
      username: 'user1',
      password: null,
    };

    component.resendCode();
    expectSwalText('Confirmation Code Send');

    mockAuthService.resendCode.and.returnValue(of({
      success: false,
      error: [
        {message: 'Code Sent failed'}
      ]
    }));
    component.resendCode();
    expectSwalText('Code Sent failed');

    discardPeriodicTasks();
  }));

  it('SignupComponent: resendCodeSignin', fakeAsync(() => {
    mockAuthService.resendCode.and.returnValue(of({
      success: true
    }));
    component.signin = {
      username: 'user1',
      password: null,
    };

    component.resendCodeSignin();
    expectSwalText('Confirmation Code Send');

    mockAuthService.resendCode.and.returnValue(of({
      success: false,
      error: [
        {message: 'Code Sent failed'}
      ]
    }));
    component.resendCodeSignin();
    expectSwalText('Code Sent failed');

    discardPeriodicTasks();
  }));

  it('SignupComponent: onCodeSubmit', fakeAsync(() => {
    mockAuthService.loginCode.and.returnValue(of({
      success: true,
      data: {
        accessToken: 'token',
        user: {
          email: 'test@test.com'
        }
      }
    }));
    component.signin = {
      username: 'user1',
      password: null,
    };

    component.onCodeSubmit();
    expectSwalText('Welcome to Spend');
    expect(localStorage.getItem('fullVerified')).toBe('yes');

    mockAuthService.loginCode.and.returnValue(of({
      success: false,
      error: [
        {message: 'Verification failed'}
      ]
    }));
    component.onCodeSubmit();
    expectSwalText('Verification failed');

    discardPeriodicTasks();
  }));

  it('SignupComponent: onForgotPassword', fakeAsync(() => {
    mockAuthService.password.and.returnValue(of({
      success: true,
      forgotPasswordUsername: 'user'
    }));
    const forgotPasswordForm = {
      valid: true,
      value: {forgotPasswordUsername: 'user1'}
    };

    component.onForgotPassword(forgotPasswordForm);
    tick();

    expect(component.screenStep).toBe(4);
    expect(component.cnForgotPassword.username).toBe('user');

    discardPeriodicTasks();
  }));

  it('SignupComponent: onCnForgotPassword', fakeAsync(() => {
    mockAuthService.passwordUpdated.and.returnValue(of({
      success: true,
    }));
    const cnForgotPasswordForm = { valid: true };

    component.forgotPasswordUsername = 'user1';
    component.cnForgotPassword = {
      code: '123456',
      password: 'password'
    };
    component.onCnForgotPassword(cnForgotPasswordForm);
    expectSwalText('Password updated');
    expect(component.screenStep).toBe(2);

    discardPeriodicTasks();
  }));

  @Component({selector: 'app-currency-modal', template: ''})
  class MockCurrencyModalComponent {
    @Input() public type: any;
    @Input() public symbol: any;
    @Input() public wallet: any;
  }
});
