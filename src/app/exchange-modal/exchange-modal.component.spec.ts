import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeModalComponent } from './exchange-modal.component';
import { HttpClientModule } from '@angular/common/http';
import { WalletService } from '../apis/wallet.service';
import { BsModalService } from 'ngx-bootstrap';
import { ExchangeService } from '../apis/exchange.service';

describe('ExchangeModalComponent', () => {
  let component: ExchangeModalComponent;
  let fixture: ComponentFixture<ExchangeModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ExchangeModalComponent,
      ],
      imports: [
        HttpClientModule
      ],
      providers: [
        {provide: WalletService, useValue: {}},
        {provide: BsModalService, useValue: {}},
        {provide: ExchangeService, useValue: {}},
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
