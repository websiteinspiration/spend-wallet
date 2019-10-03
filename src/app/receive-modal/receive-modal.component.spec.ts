import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiveModalComponent } from './receive-modal.component';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { ClipboardModule } from 'ngx-clipboard';
import { BsModalService } from 'ngx-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { WalletService } from '../apis/wallet.service';

describe('ReceiveModalComponent', () => {
  let component: ReceiveModalComponent;
  let fixture: ComponentFixture<ReceiveModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ReceiveModalComponent,
      ],
      imports: [
        NgxQRCodeModule,
        ClipboardModule,
        HttpClientModule
      ],
      providers: [
        {provide: BsModalService, useValue: {}},
        {provide: WalletService, useValue: {}},
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiveModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
