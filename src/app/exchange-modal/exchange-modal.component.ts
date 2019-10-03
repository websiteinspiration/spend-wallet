import { Component, OnInit, ViewChild, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Wallet } from '../models/wallet.model';
import { UtilService } from '../services/util.service';
import { ExchangeService } from '../apis/exchange.service';
import swal from 'sweetalert2';
import { WalletService } from '../apis/wallet.service';
import { Symbol } from '../models/symbol.model';

@Component({
  selector: 'app-exchange-modal',
  templateUrl: './exchange-modal.component.html',
  styleUrls: ['./exchange-modal.component.scss']
})
export class ExchangeModalComponent implements OnInit, OnChanges {
  modalRef: BsModalRef;
  isSubmitted = false;
  exchangeSymbol: Symbol;
  receiveSymbol: Symbol;
  @ViewChild('template') template;
  @Input() exchangeAmount: number;
  @Input() quote: any;
  @Output() submitted: EventEmitter<any> = new EventEmitter();

  constructor(
    public utilService: UtilService,
    private walletService: WalletService,
    private modalService: BsModalService,
    private exchangeService: ExchangeService,
  ) {

  }

  ngOnInit() {
  }

  openModal() {
    this.modalRef = this.modalService.show(this.template);
    this.modalService.onShow.subscribe(c => {
    });
  }

  onConfirm() {
    if (!this.isSubmitted) {
      this.isSubmitted = true;
      this.exchangeService.quoteConfirm(this.quote.id)
        .subscribe(
          (data: any) => {
            this.modalRef.hide();
            if (data.success) {
              this.submitted.emit('success');
            } else {
              this.submitted.emit('error');
            }
            this.isSubmitted = false;
          },
          (error: any) => {
            this.submitted.emit('error');
          }
        );
    }
  }

  ngOnChanges() {
    if (this.quote) {
      this.exchangeSymbol = this.walletService.wallets.filter(
        wallet => wallet.symbol === this.quote.from_exchange.asset.symbol)[0].symbolData;
      this.receiveSymbol = this.walletService.wallets.filter(wallet => wallet.symbol === this.quote.to_exchange.asset.symbol)[0].symbolData;
    }
  }
}
