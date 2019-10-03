import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Wallet} from '../models/wallet.model';
import {Symbol} from '../models/symbol.model';
import {BsModalService} from 'ngx-bootstrap/modal';
import {BsModalRef} from 'ngx-bootstrap/modal/bs-modal-ref.service';
import {WalletService} from '../apis/wallet.service';
import {TransactionService} from '../apis/transaction.service';
import {AlertService} from '../services/alert.service';
import * as $ from 'jquery';
import { UtilService } from '../services/util.service';

@Component({
  selector: 'app-send-modal',
  templateUrl: './send-modal.component.html',
  styleUrls: ['./send-modal.component.css']
})
export class SendModalComponent implements OnInit {

  @Input()
  selectedWalletData: Wallet;
  @Input()
  selectedSymbolData: Symbol;
  modalRef: BsModalRef;
  model: any;
  errors: any;
  transactionLimit = 20;
  @ViewChild('template') template;
  sending = false;

  constructor(public walletService: WalletService,
              public utilService: UtilService,
              public transactionService: TransactionService,
              private alertService: AlertService,
              private modalService: BsModalService) {
  }

  resetModel() {
    this.model = {address: '', amount: ''};
    this.errors = {address: '', amount: ''};
  }

  ngOnInit() {
    this.resetModel();
  }

  openModal() {
    this.modalService.config.ignoreBackdropClick = true;
    this.modalRef = this.modalService.show(this.template, Object.assign({}, { class: 'modal-lg' }));
    this.modalService.onShow.subscribe(c => {
      this.resetModel();
    });
  }

  all() {
    this.model.amount = '';
    const decimal = 1000000000;
    const amount = Math.round((this.selectedWalletData.balance - this.selectedSymbolData.fee) * decimal) / decimal;
    if (amount > 0) {
      this.model.amount = amount.toString();
    } else {
      this.alertService.push('error', 'Not enough balance');
    }
  }

  send() {
    if (this.model.address && this.model.amount > 0) {
      let address = this.model.address;
      if (this.selectedSymbolData.extra.fieldName) {
        if (this.model.extra) {
          address = `${this.model.address}:${this.model.extra}`;
        }
      }

      this.sending = true;
      this.walletService
        .withdraw(
          this.selectedSymbolData.symbol,
          address,
          this.model.amount)
        .subscribe((r: any) => {
          this.sending = false;
          if (r.success) {
            this.modalRef.hide();
            this.walletService.wallet().subscribe();
            this.transactionService.list(this.selectedSymbolData.symbol, 1, this.transactionLimit).subscribe();
            this.alertService.push('success', 'Sent successfully');
          } else {
            const errorMsg = r.error && r.error[0] ? r.error[0].message : r.errors[0].message;
            this.alertService.push('error', errorMsg);
          }
        }, error1 => {
          this.sending = false;
          this.alertService.push('error', error1.message);
        });
    } else {
      this.errors = {
        address: !this.model.address,
        amount: this.model.amount <= 0
      };
      if (this.errors.address) {
        this.alertService.push('error', 'Missing wallet address');
        $('#wallet-address').focus();
      } else {
        this.alertService.push('error', 'Amount is not enough or below zero ! ');
        $('#coin-amount').focus();
      }

    }
  }

  remaining() {
    if (this.model.amount < 0) {
      return this.selectedWalletData.balance;
    } else {
      const r = this.selectedWalletData.balance - (this.model.amount || 0) - this.selectedSymbolData.fee;
      return r;
    }
  }

  remainingUSD() {
    return this.remaining() * this.selectedSymbolData.conversionRate['USD']['price'];
  }

  getUSD() {
    return parseFloat(this.model.amount) * this.selectedSymbolData.conversionRate['USD']['price'];
  }
}
