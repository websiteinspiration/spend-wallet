import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';

import { CurrencyModalComponent } from './currency-modal.component';
import { Directive, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule, NgForm } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { BankService } from '../apis/bank.service';
import { BsModalService } from 'ngx-bootstrap';
import { of } from 'rxjs';

class MockBsModalService {
  show() { return null; }
}

describe('CurrencyModalComponent', () => {
  let component: CurrencyModalComponent;
  let fixture: ComponentFixture<CurrencyModalComponent>;
  let mockAccountService;
  let mockBsModalService;

  beforeEach(async(() => {
    mockAccountService = jasmine.createSpyObj(['flow', 'account', 'withDraw', 'deposit']);
    mockBsModalService = new MockBsModalService();
    TestBed.configureTestingModule({
      declarations: [
        CurrencyModalComponent,
      ],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        NgxMaskModule,
        HttpClientModule,
      ],
      providers: [
        {provide: Router, useValue: {}},
        {provide: BankService, useValue: mockAccountService},
        {provide: BsModalService, useValue: mockBsModalService},
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrencyModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load flow', fakeAsync(() => {
    mockAccountService.flow.and.returnValue(of([]));
    component.loadFlow();
    tick(1000);
    expect(component.flow.length).toBe(0);
  }));

  it('should load accounts', fakeAsync(() => {
    mockAccountService.account.and.returnValue(of([]));
    component.loadAccounts();
    tick(1000);
    expect(component.accounts.length).toBe(0);
  }));

  it('should open modal', fakeAsync(() => {
    mockAccountService.account.and.returnValue(of([]));
    mockAccountService.flow.and.returnValue(of([]));
    component.isOpen = false;
    component.openModal();
    tick(1000);
    expect(component.accounts.length).toBe(0);
    expect(component.modalRef).toBeNull();
  }));

  it('should close modal', fakeAsync(() => {
    component.modalRef = {
      hide: () => {}
    };
    component.closeModal();
    expect(component.step).toBe(1);
    expect(component.isOpen).toBeFalsy();
    expect(component.data.receiver).toBeUndefined();
  }));

  it('should click option', fakeAsync(() => {
    component.onOption('1');
    expect(component.step).toBe(2);
    expect(component.option).toBe('1');
  }));

  it('should click receiver', fakeAsync(() => {
    const form = {
      valid: true
    };
    component.onReceiver(form);
    expect(component.step).toBe(2);
  }));

  it('should click amount', fakeAsync(() => {
    const form = {
      valid: true
    };
    component.onAmount(form);
    expect(component.step).toBe(2);
  }));

  it('should select bank', fakeAsync(() => {
    component.onBankSelect();
    expect(component.step).toBe(2);
  }));

  it('should confirm', fakeAsync(() => {
    component.type = '';
    component.onConfirm();
    expect(component.isSubmitted).toBeTruthy();
  }));

  it('should withdraw amount', fakeAsync(() => {
    mockAccountService.deposit.and.returnValue(of({
      success: true,
      data: {
      }
    }));
    component.flow = {
      flow: 'default'
    };
    component.response = {
      status: false,
      message: ''
    };
    component.selectedAccount = {
      id: 1,
      services: [
        {name: 'A', id: '1'}
      ]
    };
    component.data = {
      amount: '10'
    };
    component.symbol = {
      id: '1'
    };
    component.option = 'A';
    component.depositAmount();
    tick();
    expect(component.response.status).toBeTruthy();
    expect(component.step).toBe(2);
    expect(component.isSubmitted).toBeFalsy();
    expect(component.instructions).toBeUndefined();
  }));

  it('should deposit amount', fakeAsync(() => {
    mockAccountService.withDraw.and.returnValue(of({
      success: true
    }));
    component.response = {
      status: false,
      message: ''
    };
    component.selectedAccount = {
      id: 1,
      services: [
        {name: 'A', id: '1'}
      ]
    };
    component.symbol = {
      id: '1'
    };
    component.option = 'A';
    component.withdrawAmount();
    tick();
    expect(component.response.status).toBeTruthy();
    expect(component.step).toBe(2);
    expect(component.isSubmitted).toBeFalsy();
  }));

  it('should complete', fakeAsync(() => {
    component.modalRef = {
      hide: () => {}
    };
    component.onComplete();
    expect(component.step).toBe(1);
    expect(component.isOpen).toBeFalsy();
    expect(component.data.receiver).toBeUndefined();
  }));

  it('should click account', fakeAsync(() => {
    component.onAccount({
      field: {
        bankName: 'A'
      }
    });
    expect(component.selectedAccount.field.bankName).toBe('A');
    expect(component.data.receiver).toBe('A');
  }));

  it('should check service', fakeAsync(() => {
    component.flow = {};
    expect(component.isService('A')).toBeFalsy();
    component.flow = {
      services: [
        {name: 'A'}
      ]
    };
    expect(component.isService('A')).toBeTruthy();
  }));

  it('should check selected bank', fakeAsync(() => {
    expect(component.isSelectedBank({
      id: '1'
    })).toBeUndefined();
    component.selectedAccount = {id: '1'};
    expect(component.isSelectedBank({
      id: '1'
    })).toBeDefined();
  }));

  it('should get available balance', fakeAsync(() => {
    component.data = {};
    component.wallet = {
      balance: 100
    };
    expect(component.getAvailableBalance()).toBe(100);
    component.data = {amount: 100};
    component.type = 'withdraw';
    expect(component.getAvailableBalance()).toBe(0);
    component.type = 'deposit';
    expect(component.getAvailableBalance()).toBe(200);
    component.wallet = {};
    expect(component.getAvailableBalance()).toBeNaN();
    component.wallet = null;
    expect(component.getAvailableBalance()).toBeUndefined();
  }));

  it('should check amount valid', fakeAsync(() => {
    component.data = {
      amount: '100'
    };
    component.wallet = {
      balance: 100
    };
    component.type = 'deposit';
    expect(component.isAmountValid()).toBeTruthy();
  }));
});
