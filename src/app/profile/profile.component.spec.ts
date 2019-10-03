import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';

import { ProfileComponent } from './profile.component';
import { Component, Input, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Ng2TelInputModule } from 'ng2-tel-input';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { UserService } from '../apis/user.service';
import { of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UtilService } from '../services/util.service';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let mockUserService;
  let mockAuthService;
  let mockUtilService;
  let mockRouter;

  beforeEach(async(() => {
    mockUserService = jasmine.createSpyObj(['updateEmail', 'updatePassword', 'me', 'update', 'updateLocal']);
    mockAuthService = jasmine.createSpyObj(['getStates']);
    mockUtilService = jasmine.createSpyObj(['getBase64']);
    mockRouter = jasmine.createSpyObj(['navigate']);
    TestBed.configureTestingModule({
      declarations: [
        ProfileComponent,
        MockUpperMenuComponent,
        MockChangePhoneModalComponent,
        MockGoogleAuthModalComponent,
      ],
      imports: [
        FormsModule,
        Ng2TelInputModule,
        HttpClientModule
      ],
      providers: [
        {provide: Router, useValue: mockRouter},
        {provide: UserService, useValue: mockUserService},
        {provide: AuthService, useValue: mockAuthService},
        {provide: UtilService, useValue: mockUtilService}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get tel input object', () => {
    expect(component.intlTelInputHolder).toBeUndefined();
    component.telInputObject({});
    expect(component.intlTelInputHolder).toBeDefined();
  });

  it('should prepare user', () => {
    component.prepareUser();
    expect(component.user).toBeUndefined();
  });

  it('should select country', fakeAsync(() => {
    component.model.user.country = 'US';
    mockAuthService.getStates.and.returnValue(of({
      success: true,
      data: []
    }));
    component.onCountrySelect();
    tick();
    expect(component.states.length).toBe(0);
  }));

  it('should show email', () => {
    component.user.email = 'test@test.com';
    component.showEmail();
    expect(component.emailReadonly).toBe('test@test.com');
  });

  it('should hide email', () => {
    component.user.email = 'test@test.com';
    component.hideEmail();
    expect(component.emailReadonly).toBe('t***@***.com');
  });

  it('should change email', fakeAsync(() => {
    mockUserService.updateEmail.and.returnValue(of({success: true}));
    component.model.email = 'test@test.com';
    component.changeEmail({valid: true});
    tick();
    expect(component.user).toBeUndefined();
  }));

  it('should change password', fakeAsync(() => {
    mockUserService.updatePassword.and.returnValue(of({success: true}));
    component.model.oldPassword = 'test';
    component.model.newPassword = 'newtest';
    component.model.confirmPassword = 'newtest';
    component.changePassword({valid: true});
    tick();
    expect(component.user).toBeUndefined();
  }));

  it('should change phone', fakeAsync(() => {
    mockUserService.me.and.returnValue(of({success: true}));
    component.changePhone();
    tick();
    expect(component.user).toBeUndefined();
  }));

  it('should authenticate by google', fakeAsync(() => {
    mockUserService.me.and.returnValue(of({success: true}));
    component.googleAuth();
    tick();
    expect(component.user).toBeUndefined();
  }));

  it('should check phone2FA', fakeAsync(() => {
    mockUserService.update.and.returnValue(of({
      success: true,
      data: {
        mfa: true
      }
    }));
    component.user.phoneVerified = true;
    component.phone2FA();
    tick();
    expect(component.user).toBeUndefined();
  }));

  it('should change personal information', fakeAsync(() => {
    mockUserService.update.and.returnValue(of({
      success: true,
    }));
    component.model.user.getChanges = () => {};
    component.changePersonalInformation({valid: true});
    tick();
    expect(component.user).toBeUndefined();
  }));

  it('should upload avatar', fakeAsync(() => {
    mockUserService.update.and.returnValue(of({
      success: true,
      data: {
        avatar: 'test.png'
      }
    }));
    mockUserService.updateLocal.and.returnValue();
    mockUtilService.getBase64.and.returnValue(Promise.resolve(true));
    component.onAvatarUpload([{name: '1.jpg'}]);
    tick();
    expect(component.user.avatar.indexOf('?')).toBeGreaterThan(0);
  }));

  it('should click verification', fakeAsync(() => {
    mockRouter.navigate.and.returnValue(Promise.resolve(true));
    component.onVerification();
    tick();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['verification']);
  }));

  it('should update local user', fakeAsync(() => {
    mockUserService.updateLocal.and.returnValue();
    component.updateLocalUser({});
    tick();
    expect(mockUserService.updateLocal).toHaveBeenCalled();
  }));

  @Component({selector: 'app-upper-menu', template: ''})
  class MockUpperMenuComponent {
    @Input() public toggle: any;
  }

  @Component({selector: 'app-change-phone-modal', template: ''})
  class MockChangePhoneModalComponent {
    @Input() public oldPhone: any;
    openModal() {
      return of('success');
    }
  }

  @Component({selector: 'app-google-auth-modal', template: ''})
  class MockGoogleAuthModalComponent {
    openModal() {
      return of('success');
    }
  }
});
