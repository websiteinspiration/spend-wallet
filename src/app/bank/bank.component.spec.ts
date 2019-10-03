import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { BankComponent } from './bank.component';
import { Component, Input } from '@angular/core';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { BankService } from '../apis/bank.service';
import { UserService } from '../apis/user.service';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';

describe('bankComponent', () => {
  let component: BankComponent;
  let fixture: ComponentFixture<BankComponent>;
  let mockBankService;

  beforeEach(async(() => {
    mockBankService = jasmine.createSpyObj(['plaidConfig', 'flow', 'account', 'deleteAccount']);
    TestBed.configureTestingModule({
      declarations: [
        BankComponent,
        MockUpperMenuComponent,
        MockBankFormModalComponent,
      ],
      imports: [
        PerfectScrollbarModule,
        HttpClientModule
      ],
      providers: [
        {provide: BankService, useValue: mockBankService},
        {provide: UserService, useValue: {}},
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BankComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load background', () => {
    // component.loadBackground();
  });

  it('should get plaid config', fakeAsync(() => {
    mockBankService.plaidConfig.and.returnValue(of([]));
    component.getPlaidConfig();
    tick(1000);
    expect(component.plaidConfig.length).toBe(0);
  }));

  it('should add account', fakeAsync(() => {
    mockBankService.flow.and.returnValue(of({format: {fields: []}}));
    component.isSubmitted = false;
    component.onAddAcccount();
    tick(1000);
    expect(component.isSubmitted).toBeFalsy();
    expect(component.flow.format.fields.length).toBe(0);
    expect(component.fields.length).toBe(0);
  }));

  it('should load accounts', fakeAsync(() => {
    mockBankService.account.and.returnValue(of([]));
    component.loadAccounts();
    tick(1000);
    expect(component.accounts.length).toBe(0);
  }));

  it('should click account remove', fakeAsync(() => {
    mockBankService.deleteAccount.and.returnValue(of({success: true}));
    mockBankService.account.and.returnValue(of([]));
    component.onAccountRemove({id: 1});
    tick(1000);
    expect(component.accounts.length).toBe(0);
  }));

  it('should click modal close', fakeAsync(() => {
    mockBankService.account.and.returnValue(of([]));
    component.onModalClose(true);
    expect(component.accounts.length).toBe(0);
    component.accounts = undefined;
    component.onModalClose(false);
    expect(component.accounts).toBeUndefined();
  }));

  it('should add account button', fakeAsync(() => {
    component.accounts = [];
    expect(component.addAccBtn()).toBeFalsy();
    component.accounts = [{}];
    expect(component.addAccBtn()).toBeTruthy();
  }));

  @Component({selector: 'app-upper-menu', template: ''})
  class MockUpperMenuComponent {
    @Input() public toggle: any;
  }

  @Component({selector: 'app-bank-form-modal', template: ''})
  class MockBankFormModalComponent {
    @Input() public flow: any;

    openModal() {
      alert('Success');
    }
  }
});
