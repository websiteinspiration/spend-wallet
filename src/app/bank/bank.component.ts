import { Component, OnInit, Renderer2, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { BankService } from '../apis/bank.service';
import { UserService } from '../apis/user.service';
import { AlertService } from '../services/alert.service';
import { UtilService } from '../services/util.service';
import { User } from '../models/user.model';
import { BankFormModalComponent } from '../bank-form-modal/bank-form-modal.component';

declare const Plaid;

@Component({
  selector: 'app-bank',
  templateUrl: './bank.component.html',
  styleUrls: ['./bank.component.scss']
})

export class BankComponent implements OnInit, OnDestroy {
  @ViewChild('bankFormModal') bankFormModal: BankFormModalComponent;

  link: any;
  user: User;
  flow: any;
  fields: any;
  plaidConfig: any;
  bodyEl: ElementRef;
  accounts: any = undefined;
  isSubmitted = false;

  constructor(
    private elRef: ElementRef,
    private renderer: Renderer2,
    private bankService: BankService,
    private userService: UserService,
    private utilService: UtilService,
    private alertService: AlertService) {
  }

  ngOnInit() {
    this.bodyEl = this.elRef.nativeElement.ownerDocument.body;
    this.user = this.userService.currentUser;
    this.loadBackground();
    this.loadAccounts();
    this.intializePlaid();
  }

  intializePlaid() {
    this.getPlaidConfig().then(() => {
      // TODO: Ensure script is loaded
      const { callbackPath, selectedAccount, ...config } = this.plaidConfig;
      const that = this;
      this.link = Plaid.create({
        ...config,
        onLoad: () => { },
        onSuccess: (public_token, metadata) => {
          const plaidData = {
            publicToken: public_token,
            data: metadata,
            username: that.user.username
          };
          that.utilService.postRequest(this.plaidConfig.callbackPath, plaidData)
            .subscribe(
              (data: any) => {
                that.loadAccounts();
              },
              (error: any) => {
                that.loadAccounts();
                this.alertService.error(error.message);
              }
            );
        },
        onExit: (err, metadata) => {
          if (err != null) {
          }
        }
      });
    });
  }

  loadBackground() {
    this.renderer.setAttribute(this.bodyEl, 'background', '/assets/images/card-setting-background.png');
  }

  getPlaidConfig() {
    return new Promise((resolve, reject) => {
      this.bankService.plaidConfig()
        .subscribe(
          (data: any) => {
            this.plaidConfig = data;
            resolve();
          },
          (error: any) => {
            reject();
            this.alertService.error(error.message);
          }
        );
    });
  }

  onAddAcccount() {
    if (!this.isSubmitted) {
      this.isSubmitted = true;
      this.bankService.flow()
        .subscribe(
          (data: any) => {
            this.isSubmitted = false;
            this.flow = data;
            if (data.flow === 'plaid') {
              this.link.open();
            } else {
              this.fields = data.format.fields;
              this.bankFormModal.openModal();
            }
          },
          (error: any) => {
            this.isSubmitted = false;
            swal('Error', error.message, 'error');
            this.alertService.error(error.message);
          }
        );
    }
  }

  loadAccounts() {
    this.utilService.showLoading.next(true);
    this.bankService.account()
      .subscribe(
        (data: any) => {
          this.utilService.showLoading.next(false);
          this.accounts = data;
        },
        (error: any) => {
          this.utilService.showLoading.next(false);
          this.accounts = undefined;
          this.alertService.error(error.message);
        }
      );
  }

  onAccountRemove(account) {
    this.bankService.deleteAccount(account.id)
      .subscribe(
        (data: any) => {
          if (data.success) {
            this.alertService.success('Account removed');
          } else {
            this.alertService.error('Error in removal');
          }
          this.loadAccounts();
        },
        (error: any) => {
          swal('Error', error.message, 'error');
          this.alertService.error(error.message);
        }
      );
  }

  onModalClose(result) {
    if (result) {
      this.loadAccounts();
    }
  }

  addAccBtn() {
    if (this.accounts && this.accounts.length >= 1) {
      return true;
    } else {
      return false;
    }
  }

  ngOnDestroy() {
    this.renderer.removeStyle(this.bodyEl, 'background-color');
    this.renderer.removeAttribute(this.bodyEl, 'background');
  }
}
