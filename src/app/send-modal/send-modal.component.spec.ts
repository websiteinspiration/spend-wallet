import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SendModalComponent } from './send-modal.component';
import { FormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { WalletService } from '../apis/wallet.service';
import { HttpClientModule } from '@angular/common/http';
import { TransactionService } from '../apis/transaction.service';
import { BsModalService } from 'ngx-bootstrap';

xdescribe('SendModalComponent', () => {
  let component: SendModalComponent;
  let fixture: ComponentFixture<SendModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SendModalComponent,
      ],
      imports: [
        FormsModule,
        NgxMaskModule,
        HttpClientModule
      ],
      providers: [
        {provide: WalletService, useValue: {}},
        {provide: TransactionService, useValue: {}},
        {provide: BsModalService, useValue: {}},
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
