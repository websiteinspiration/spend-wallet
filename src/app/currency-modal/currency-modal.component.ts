import { Component, OnInit, ViewChild, Input, Renderer2 } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BankService } from '../apis/bank.service';
import { Wallet } from '../models/wallet.model';
import { Symbol } from '../models/symbol.model';
import { UtilService } from '../services/util.service';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-currency-modal',
  templateUrl: './currency-modal.component.html',
  styleUrls: ['./currency-modal.component.scss']
})
export class CurrencyModalComponent implements OnInit {
  @ViewChild('receiveForm') receiveForm: NgForm;
  @ViewChild('amountForm') amountForm: NgForm;
  @ViewChild('modal') modal;
  @Input() wallet: Wallet;
  @Input() symbol: Symbol;
  @Input() type: string;
  data: any = {
    receiver: undefined,
    amount: undefined
  };
  response = {
    status: false,
    message: undefined
  };
  isOpen = false;
  step = 1;
  flow: any;
  amount: string;
  accounts: any[];
  option: string;
  isSubmitted = false;
  selectedAccount: any;
  modalRef: BsModalRef;
  instructions: string;
  constructor(
    private route: Router,
    private renderer: Renderer2,
    public utilService: UtilService,
    private alertService: AlertService,
    private accountService: BankService,
    private modalService: BsModalService
  ) { }

  ngOnInit(): void {
  }

  loadFlow(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.accountService.flow()
        .subscribe(
          (data: any) => {
            this.flow = data;
            resolve(data);
          },
          (error: any) => {
            reject(error);
          }
        );
    });
  }

  loadAccounts(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.accountService.account()
        .subscribe(
          (data: any) => {
            this.accounts = data;
            resolve(data);
          },
          (error: any) => {
            reject(error);
          }
        );
    });
  }

  openModal(): void {
    if (!this.isOpen) {
      this.isOpen = true;
      this.loadFlow();
      this.loadAccounts()
        .then(() => {
          this.modalRef = this.modalService.show(this.modal, Object.assign({}, { class: 'modal-lg' }));
        })
        .catch(() => {
          this.alertService.info('Please add an Account');
          this.route.navigate(['banking']);
        });
    }
  }

  closeModal(): void {
    this.step = 1;
    this.isOpen = false;
    this.data.receiver = undefined;
    this.data.amount = undefined;
    this.response.status = false;
    this.response.message = undefined;
    this.accounts = undefined;
    this.option = undefined;
    this.isSubmitted = false;
    this.selectedAccount = undefined;
    this.modalRef.hide();
  }

  onOption(id): void {
    this.option = id;
    this.step += 1;
  }

  onReceiver(receiveForm): void {
    if (receiveForm.valid) {
      this.step += 1;
    }
  }

  onAmount(amountForm): void {
    if (amountForm.valid) {
      this.step += 1;
    }
  }

  onBankSelect(): void {
    this.step += 1;
  }

  onConfirm(): void {
    this.isSubmitted = true;
    if (this.type === 'withdraw') {
      this.withdrawAmount();
    } else if (this.type === 'deposit') {
      this.depositAmount();
    }
  }

  withdrawAmount(): void {
    let data;
    if (this.option === 'other') {
      data = {
        asset_id: this.symbol['id'],
        amount: parseFloat(this.data.amount),
        receiver: this.data.receiver
      };
    } else {
      data = {
        asset_id: this.symbol['id'],
        account_id: this.selectedAccount.id,
        service_id: this.selectedAccount.services.filter(s => s.name === this.option)[0].id,
        amount: parseFloat(this.data.amount)
      };
    }
    this.accountService.withDraw(data)
      .subscribe(
        (response: any) => {
          this.step += 1;
          this.isSubmitted = false;
          if (response.success) {
            this.response.status = true;
          } else {
            this.response.status = false;
            this.response.message = response.error[0].message;
          }
        },
        (error: any) => {
          this.step += 1;
          this.isSubmitted = false;
        }
      );
  }

  depositAmount(): void {
    const data = {
      asset_id: this.symbol['id'],
      account_id: this.selectedAccount.id,
      amount: parseFloat(this.data.amount)
    };
    this.accountService.deposit(data)
      .subscribe(
        (response: any) => {
          this.step += 1;
          this.isSubmitted = false;
          if (response.success) {
            this.response.status = true;
            if (this.flow.flow === 'default') {
              this.instructions = response.data.instructions;
            }
          } else {
            this.response.status = false;
            this.response.message = response.error[0].message;
          }

        },
        (error: any) => {
          this.step += 1;
          this.isSubmitted = false;
        }
      );

  }

  onComplete(): void {
    this.closeModal();
  }

  onAccount(account): void {
    this.selectedAccount = account;
    this.data.receiver = account.field.bankName;
  }

  isService(name): boolean {
    let isAllowed = false;
    if (this.flow && this.flow.services) {
      isAllowed = this.flow.services.filter(s => s.name === name)[0] ? true : false;
    }
    return isAllowed;
  }

  isSelectedBank(account): any {
    let name;
    if (account && this.selectedAccount) {
      if (account.id === this.selectedAccount.id) {
        name = {
          'border border-primary': true
        };
      }
    }
    return name;
  }

  getAvailableBalance(): number {
    if (!this.data.amount) {
      return this.wallet.balance;
    }
    if (this.wallet) {
      if (this.type === 'withdraw') {
        return (this.wallet.balance - parseFloat(this.data.amount));
      } else {
        return (this.wallet.balance + parseFloat(this.data.amount));
      }
    }
    return undefined;
  }

  onBtnHover(type, element): void {
    if (type === 'over') {
      this.renderer.setStyle(element, 'fill', this.symbol.color);
    } else {
      this.renderer.setStyle(element, 'fill', '#bfbfbf');
    }
  }

  isAmountValid(): boolean {
    let result = false;
    if (parseFloat(this.data.amount) > 0 && this.getAvailableBalance() > 0) {
      result = true;
    }
    return result;
  }

}
