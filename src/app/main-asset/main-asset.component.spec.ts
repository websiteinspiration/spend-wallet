import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainAssetComponent } from './main-asset.component';
import { Component, Input, Directive } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TooltipModule, BsModalService } from 'ngx-bootstrap';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { WalletService } from '../apis/wallet.service';
import { SymbolService } from '../apis/symbol.service';
import { TransactionService } from '../apis/transaction.service';

describe('MainAssetComponent', () => {
  let component: MainAssetComponent;
  let fixture: ComponentFixture<MainAssetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        MainAssetComponent,
        MockUpperMenuComponent,
        RouterLinkMockDirective,
        MockChartComponent,
        MockSendModalComponent,
        MockReceiveModalComponent,
        MockCurrencyModalComponent
      ],
      imports: [
        FormsModule,
        TooltipModule,
        PerfectScrollbarModule,
        HttpClientModule
      ],
      providers: [
        {provide: ActivatedRoute, useValue: {}},
        {provide: WalletService, useValue: {}},
        {provide: SymbolService, useValue: {}},
        {provide: BsModalService, useValue: {}},
        {provide: TransactionService, useValue: {}},
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainAssetComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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

  @Directive({selector: '[routerLink]'})
  class RouterLinkMockDirective {
    @Input() public routerLink: any;
  }
});
