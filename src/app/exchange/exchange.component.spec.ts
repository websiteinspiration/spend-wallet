import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { ExchangeComponent } from './exchange.component';
import { Component, Input } from '@angular/core';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { NgxMaskModule, config } from 'ngx-mask';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { WalletService } from '../apis/wallet.service';
import { ExchangeService } from '../apis/exchange.service';
import { of } from 'rxjs';

describe('ExchangeComponent', () => {
  let component: ExchangeComponent;
  let fixture: ComponentFixture<ExchangeComponent>;
  let mockWalletService;
  let mockExchangeService;

  beforeEach(async(() => {
    mockWalletService = jasmine.createSpyObj(['wallet']);
    mockExchangeService = jasmine.createSpyObj(['quote']);
    TestBed.configureTestingModule({
      declarations: [
        ExchangeComponent,
        MockUpperMenuComponent,
        MockExchangeModalComponent,
      ],
      imports: [
        PerfectScrollbarModule,
        NgxMaskModule,
        FormsModule,
        HttpClientModule
      ],
      providers: [
        {provide: Router, useValue: {}},
        {provide: ActivatedRoute, useValue: {}},
        {provide: WalletService, useValue: mockWalletService},
        {provide: ExchangeService, useValue: mockExchangeService},
        {provide: config, useValue: {}},
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load background', () => {
    component.loadBackground();
    expect(component.bodyEl.style.backgroundImage).toBe('url("/assets/images/gs-background.png")');
  });

  it('should select default wallets', () => {
    component.wallets = [
      {
        symbol: 'BTC',
        symbolData: {
          type: 'blockchain'
        }
      },
      {
        symbol: 'ETC',
        symbolData: {
          type: 'blockchain'
        }
      },
    ];
    component.rates = {
      'BTC': {},
      'ETC': {},
    };
    component.selectDefaultWallets();
    expect(component.exchangeWallet.symbol).toBe('BTC');
    expect(component.receiveWallet.symbol).toBe('ETC');
  });

  it('should get exchange rate', () => {
    component.exchangeWallet = {
      symbol: 'BTC'
    };
    component.receiveWallet = {
      symbol: 'ETC'
    };
    component.rates = {
      'BTC': {price: 10},
      'ETC': {price: 2},
    };
    expect(component.getExchangeRate()).toBe('5.00000');
  });

  it('should click exchange wallet', () => {
    component.receiveWallet = {
      symbol: 'ETC'
    };
    component.onExchangeWallet({symbol: 'ETC'});
    expect(component.exchangeWallet.symbol).toBe('');
    component.onExchangeWallet({symbol: 'BTC'});
    expect(component.exchangeWallet.symbol).toBe('BTC');
  });

  it('should click receive wallet', () => {
    component.exchangeWallet = {
      symbol: 'ETC'
    };
    component.onReceiveWallet({symbol: 'ETC'});
    expect(component.receiveWallet.symbol).toBe('');
    component.onReceiveWallet({symbol: 'BTC'});
    expect(component.receiveWallet.symbol).toBe('BTC');
  });

  it('should check exchangeable', () => {
    component.exchangeWallet = {
      balance: 10
    };
    component.exchangeAmount = '10';
    expect(component.isExchangeable()).toBeTruthy();
  });

  it('should click exchange amount', () => {
    component.exchangeAmount = '10';
    component.onexchangeAmount();
    expect(component.exchangeAmount).toBe('10');
    component.exchangeAmount = '0';
    component.onexchangeAmount();
    expect(component.exchangeAmount).toBe('');
  });

  it('should get receive value', fakeAsync(() => {
    component.exchangeWallet = {
      symbol: 'BTC'
    };
    component.receiveWallet = {
      symbol: 'ETC'
    };
    component.rates = {
      'BTC': {price: 10},
      'ETC': {price: 2},
    };
    component.exchangeAmount = '10';
    component.getReceiveValue();
    expect(component.getReceiveValue()).toBe(50);
  }));

  it('should click exchange', fakeAsync(() => {
    mockExchangeService.quote.and.returnValue(of({
      success: true,
      data: {}
    }));
    component.isSubmitted = false;
    component.exchangeWallet.balance = 10;
    component.exchangeWallet.symbol = 'BTC';
    component.receiveWallet.symbol = 'ETC';
    component.rates = {
      BTC: {exchange_id: 1},
      ETC: {exchange_id: 2}
    };
    component.onExchange();
    tick();
    expect(component.quote).toBeDefined();
    expect(component.isSubmitted).toBeFalsy();
  }));

  it('should change color', () => {
    component.changeColor();
  });

  it('should check ticker', () => {
    component.rates = {
      'BTC': {}
    };
    expect(component.checkTicker({symbol: 'BTC', symbolData: {type: 'blockchain'}})).toBeTruthy();
  });

  it('should click exchange done', fakeAsync(() => {
    mockWalletService.wallet.and.returnValue(of([
      {symbolData: {type: 'blockchain'}, symbol: 'BTC'},
      {symbolData: {type: 'blockchain'}, symbol: 'ETC'},
      {symbolData: {type: 'currency'}, symbol: 'USD'},
    ]));
    component.exchangeWallet.symbol = 'BTC';
    component.receiveWallet.symbol = 'ETC';
    component.onExchangeDone('success');
    tick();
    expect(component.wallets.length).toBe(2);
    expect(component.exchangeWallet.symbol).toBe('BTC');
    expect(component.receiveWallet.symbol).toBe('ETC');
  }));

  it('should display alert', () => {
    component.displayAlert('error');
    component.displayAlert('success');
  });

  @Component({selector: 'app-upper-menu', template: ''})
  class MockUpperMenuComponent {
    @Input() public toggle: any;
  }

  @Component({selector: 'app-exchange-modal', template: ''})
  class MockExchangeModalComponent {
    @Input() public exchangeAmount: any;
    @Input() public quote: any;
    openModal() {
      return;
    }
  }
});
