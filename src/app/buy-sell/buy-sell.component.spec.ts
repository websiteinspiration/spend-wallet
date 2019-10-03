import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';

import { BuySellComponent } from './buy-sell.component';
import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { WalletService } from '../apis/wallet.service';
import { SymbolService } from '../apis/symbol.service';
import { BankService } from '../apis/bank.service';
import { ExchangeService } from '../apis/exchange.service';
import { of } from 'rxjs';
import { SlickModule } from 'ngx-slick';

describe('BuySellComponent', () => {
  let component: BuySellComponent;
  let fixture: ComponentFixture<BuySellComponent>;
  let mockBankService;
  let mockWalletService;
  let mockSymbolService;

  beforeEach(async(() => {
    mockBankService = jasmine.createSpyObj(['flow']);
    mockWalletService = jasmine.createSpyObj(['wallets']);
    mockSymbolService = jasmine.createSpyObj(['getMarketData']);
    TestBed.configureTestingModule({
      declarations: [
        BuySellComponent,
        MockUpperMenuComponent,
        MockExchangeModalComponent,
      ],
      imports: [
        HttpClientModule,
        SlickModule
      ],
      providers: [
        {provide: ActivatedRoute, useValue: {}},
        {provide: WalletService, useValue: mockWalletService},
        {provide: SymbolService, useValue: mockSymbolService},
        {provide: BankService, useValue: mockBankService},
        {provide: ExchangeService, useValue: {}},
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuySellComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load flow', fakeAsync(() => {
    mockBankService.flow.and.returnValue(of([]));
    component.loadFlow();
    tick(1000);
    expect(component.flow.length).toBe(0);
  }));

  it('should sort symbol', () => {
    const symbols = [
      {type: 'b'},
      {type: 'c'},
      {type: 'a'},
    ];
    expect(component.symbolSort(symbols)[0].type).toBe('c');
  });

  it('should select symbol', fakeAsync(() => {
    mockWalletService.wallets = [
      {symbol: 'BTC', color: 'red'}
    ];
    const symbol = {
      type: 'blockchain',
      symbol: 'BTC'
    };
    component.symbols = [
      {symbol: 'BTC', status: true},
      {symbol: 'USD', status: false},
    ];
    // component.selectSymbol(symbol, null);
    // expect(component.selectedSymbol).toBe('BTC');
    // expect(component.selectedSymbolData.status).toBeTruthy();
    // expect(component.selectedWalletData.color).toBe('red');
  }));

  it('should load market data', fakeAsync(() => {
    mockSymbolService.getMarketData.and.returnValue(of(null));
    component.loadMarketData();
    tick(1000);
    expect(component.selectedSymbolMarketData).toBeNull();
  }));

  it('should change options', () => {
    const option = {id: 'BTC'};
    component.onOptions(option);
    expect(component.selectedOption).toBe('BTC');
  });

  it('should get exchange rate', () => {
    component.receivceSymbolData = {symbol: 'BTC'};
    component.selectedSymbolData = {symbol: 'USD'};
    component.rates = {
      BTC: {price: 10},
      USD: {price: 1},
    };
    expect(component.getExchangeRate()).toBe('0.10000');
  });

  it('should change symbol to USD', () => {
    component.receivceSymbolData = {symbol: 'BTC'};
    component.selectedSymbolData = {symbol: 'LTS'};
    component.rates = {
      BTC: {price: 10},
      LTS: {price: 1},
    };
    component.symbolAmount = '100';
    expect(component.symbolToUsd()).toBe('10');
  });

  it('should change USD to symbol', () => {
    component.receivceSymbolData = {symbol: 'BTC'};
    component.selectedSymbolData = {symbol: 'LTS'};
    component.rates = {
      BTC: {price: 10},
      LTS: {price: 1},
    };
    component.usdAmount = '100';
    expect(component.usdToSymbol()).toBe('1000');
  });

  it('should click symbol amount', () => {
    component.receivceSymbolData = {symbol: 'BTC'};
    component.selectedSymbolData = {symbol: 'LTS'};
    component.rates = {
      BTC: {price: 10},
      LTS: {price: 1},
    };
    component.symbolAmount = '100';
    const event = {target: {value: '100'}};
    component.onSymbolAmount(event);
    expect(component.symbolAmount).toBe('100');
    expect(component.usdAmount).toBe('10');
  });

  it('should click USD amount', () => {
    component.receivceSymbolData = {symbol: 'BTC'};
    component.selectedSymbolData = {symbol: 'LTS'};
    component.rates = {
      BTC: {price: 10},
      LTS: {price: 1},
    };
    component.symbolAmount = '100';
    const event = {target: {value: '100'}};
    component.onUsdAmount(event);
    expect(component.usdAmount).toBe('100');
    expect(component.symbolAmount).toBe('1000');
  });

  it('should click payment option', () => {
    component.onPaymentOption('1');
    expect(component.paymentOption).toBe('1');
  });

  it('should click buysell', () => {
    // component.onPaymentOption('1');
    // expect(component.paymentOption).toBe('1');
  });

  it('should get account id', () => {
    component.flow = {account: {id: 1}};
    expect(component.getAccountId()).toBe(1);
  });

  it('should get service id', () => {
    component.flow = {services: [
      {name: 'A', id: 1},
      {name: 'A', id: 2},
      {name: 'B', id: 3},
    ]};
    component.paymentOption = 'A';
    expect(component.getServiceId()).toBe(1);
  });

  it('should click exchange done', () => {
    component.onExchangeDone('success');
  });

  @Component({selector: 'app-upper-menu', template: ''})
  class MockUpperMenuComponent {
    @Input() public toggle: any;
  }

  @Component({selector: 'app-exchange-modal', template: ''})
  class MockExchangeModalComponent {
    @Input() public exchangeAmount: any;
    @Input() public quote: any;
  }
});
