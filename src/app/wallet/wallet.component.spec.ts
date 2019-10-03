import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { WalletComponent } from './wallet.component';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TooltipModule, BsModalService } from 'ngx-bootstrap';
import { InViewportModule } from 'ng-in-viewport';
import { ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { WalletService } from '../apis/wallet.service';
import { TransactionService } from '../apis/transaction.service';
import { SymbolService } from '../apis/symbol.service';
import { of } from 'rxjs';

describe('WalletComponent', () => {
  let component: WalletComponent;
  let fixture: ComponentFixture<WalletComponent>;
  let mockWalletService;
  let mockTransactionService;

  beforeEach(async(() => {
    mockWalletService = jasmine.createSpyObj(['toggleDefault']);
    mockTransactionService = jasmine.createSpyObj(['list']);
    TestBed.configureTestingModule({
      declarations: [
        WalletComponent,
        MockUpperMenuComponent,
        MockChartComponent,
        MockSendModalComponent,
        MockReceiveModalComponent,
        MockCurrencyModalComponent
      ],
      imports: [
        FormsModule,
        TooltipModule,
        InViewportModule,
        HttpClientModule
      ],
      providers: [
        {provide: ActivatedRoute, useValue: {}},
        {provide: WalletService, useValue: mockWalletService},
        {provide: TransactionService, useValue: mockTransactionService},
        {provide: SymbolService, useValue: {}},
        {provide: BsModalService, useValue: {}},
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should change toggle', () => {
    expect(component.toggle).toBe(false);
    component.toggleChange();
    expect(component.toggle).toBe(true);
    expect(component.menu).toBe(true);
  });

  it('should search', () => {
    component.symbols = [
      {title: 'Test', symbol: 'Test 1'},
      {title: 'Test', symbol: 'Test 2'},
      {title: 'Title', symbol: 'Test 3'},
    ];
    component.searchValue = 'test';
    component.searching();
    expect(component.symbolsDisplayed.length).toBe(3);
    component.searchValue = 'title';
    component.searching();
    expect(component.symbolsDisplayed.length).toBe(1);
    component.searchValue = 'test 1';
    component.searching();
    expect(component.symbolsDisplayed.length).toBe(1);
  });

  it('should show menu', () => {
    component.showMenu();
    expect(component.menu).toBe(true);
    expect(component.symbolsDisplayed).toBe(component.symbols);
    expect(component.searchValue).toBeNull();
  });

  it('should load background', () => {
    component.loadBackground();
    expect(component.bodyEl.background).toBe('/assets/images/gs-background.png');
  });

  it('should change color', () => {
    component.changeColor('rgb(240, 200, 200)');
    expect(component.bodyEl.style.backgroundColor).toBe('rgb(240, 200, 200)');
  });

  it('should get value', () => {
    component.symbols = [
      {title: 'Test', symbol: 'Test 1'},
      {title: 'Test', symbol: 'Test 2'},
      {title: 'Title', symbol: 'Test 3'},
    ];
    component.searchValue = 'Test';
    expect(component.getValue().symbol).toBe('Test 1');
    component.searchValue = 'test';
    expect(component.getValue()).toBeUndefined();
    component.searchValue = 'Title';
    expect(component.getValue().symbol).toBe('Test 3');
  });

  it('should show searchbar', () => {
    component.SearchBar = false;
    component.showSearchBar();
    expect(component.SearchBar).toBeTruthy();
  });

  it('should select button color', () => {
    component.selectedSymbolData = {color: '#aaa'};
    component.selectBtnColors();
    expect(component.sendBtnColor).toBe('#aaa');
    expect(component.recBtnColor).toBe('#aaa');
  });

  it('should collapse', () => {
    component.selectedTransactionId = '1';
    component.collapse({id: '2'});
    expect(component.close).toBeFalsy();
    expect(component.selectedTransactionId).toBe('2');
    component.collapse({id: '2'});
    expect(component.selectedTransactionId).toBeNull();
  });

  it('should load transactions', fakeAsync(() => {
    mockTransactionService.list.and.returnValue(of({
      totalPages: 2,
      total: 10,
      transactions: []
    }));
    component.page = 1;
    component.transactionArray = [];
    component.loadTransaction();
    tick(1000);
    expect(component.pages).toBe(2);
    expect(component.page).toBe(2);
    expect(component.totalTxn).toBe(10);
    expect(component.transactionArray.length).toBe(0);
  }));

  it('should toggle default', fakeAsync(() => {
    component.selectedWalletData = {isDefault: true};
    mockWalletService.toggleDefault.and.returnValue(of({isDefault: false}));
    component.toggleDefault();
    tick(1000);
    expect(component.selectedWalletData.isDefault).toBeFalsy();
  }));

  it('should hover on send button', () => {
    component.sendBtnColor = '#aaa';
    component.sendBtnBkcolor = '#ccc';
    component.sendBtnHover();
    expect(component.sendBtnBkcolor).toBe('#aaa');
    expect(component.sendBtnColor).toBe('#ccc');
  });

  it('should hover on receive button', () => {
    component.recBtnColor = '#aaa';
    component.recBtnBkcolor = '#ccc';
    component.recBtnHover();
    expect(component.recBtnBkcolor).toBe('#aaa');
    expect(component.recBtnColor).toBe('#ccc');
  });

  it('should click panel', () => {
    component.onPanelClick();
    expect(component.toggle).toBeFalsy();
    expect(component.close).toBeTruthy();
    expect(component.menu).toBeTruthy();
  });

  it('should click transaction', () => {
    component.close = false;
    component.onTransaction(false);
    expect(component.selectedTransactionId).toBeNull();
    expect(component.close).toBeTruthy();
    component.onTransaction(true);
    expect(component.close).toBeFalsy();
  });

  it('should get status icon', () => {
    expect(component.getStatusIcon('completed')).toBe('<i class="fa fa-check text-success"></i>');
    expect(component.getStatusIcon('pending')).toBe('<i class="fa fa-clock icon-pending"></i>');
    expect(component.getStatusIcon('failed')).toBe('<i class="fa fa-exclamation text-danger"></i>');
    expect(component.getStatusIcon('')).toBe('');
  });

  it('should get tooltip color', () => {
    expect(component.getToolTipColor('completed')).toBe('tooltip-completed');
    expect(component.getToolTipColor('pending')).toBe('tooltip-pending');
    expect(component.getToolTipColor('failed')).toBe('tooltip-failed');
    expect(component.getToolTipColor('')).toBe('');
  });

  @Component({selector: 'app-upper-menu', template: ''})
  class MockUpperMenuComponent {
    @Input() public toggle: any;
  }

  @Component({selector: 'app-chart', template: ''})
  class MockChartComponent {
    @Input() public option: any;
    @Input() public symbol: any;
    @Input() public data: any;
  }

  @Component({selector: 'app-send-modal', template: ''})
  class MockSendModalComponent {
    @Input() public selectedSymbolData: any;
    @Input() public selectedWalletData: any;
  }

  @Component({selector: 'app-receive-modal', template: ''})
  class MockReceiveModalComponent {
    @Input() public selectedSymbolData: any;
    @Input() public selectedWalletData: any;
  }

  @Component({selector: 'app-currency-modal', template: ''})
  class MockCurrencyModalComponent {
    @Input() public type: any;
    @Input() public symbol: any;
    @Input() public wallet: any;
  }
});
