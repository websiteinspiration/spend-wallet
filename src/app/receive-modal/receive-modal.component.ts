import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Wallet} from '../models/wallet.model';
import {BsModalRef} from 'ngx-bootstrap/modal/bs-modal-ref.service';
import {BsModalService} from 'ngx-bootstrap/modal';
import {WalletService} from '../apis/wallet.service';
import {Symbol} from '../models/symbol.model';
import {Address} from '../models/address.model';
import {AlertService} from '../services/alert.service';
import { UtilService } from '../services/util.service';

@Component({
  selector: 'app-receive-modal',
  templateUrl: './receive-modal.component.html',
  styleUrls: ['./receive-modal.component.css']
})
export class ReceiveModalComponent implements OnInit {


  @Input()
  selectedWalletData: Wallet;
  @Input()
  selectedSymbolData: Symbol;
  @ViewChild('template')
  template;
  display = false;
  mywindow: any = undefined;
  modalRef: BsModalRef;
  address: Address = {
    address: '',
    extra: [],
    symbol: ''
  };

  constructor(
    private modalService: BsModalService,
    private alertService: AlertService,
    public utilService: UtilService,
    public walletService: WalletService) {
  }

  ngOnInit() {
  }

  printElem(divId) {
    const content = document.getElementById(divId).innerHTML;
    this.mywindow = window.open('', '_blank', 'height=600,width=800');
    this.mywindow.document.write('<html><head><title>Print</title>');
    this.mywindow.document.write('</head><body >');
    this.mywindow.document.write(content);
    this.mywindow.document.write('</body></html>');
    this.mywindow.document.close();
    setTimeout(() => {
      this.mywindow.focus();
      this.mywindow.print();
      this.mywindow.close();
    }, 1000);
  }

  print() {
    this.printElem('receive-modal-body');
  }

  openModal() {
      const that = this;
      this.modalService.config.ignoreBackdropClick = true;
      this.display = true;
      this.walletService.address(this.selectedWalletData.symbol)
        .subscribe(r => {
          that.address = r;
          that.modalRef = this.modalService.show(that.template, Object.assign({}, { class: 'modal-lg' }));
          that.modalService.onShow.subscribe(c => {
            that.walletService.address(that.selectedWalletData.symbol);
          });
        }, error1 => {
          this.alertService.push('error', error1);
        });
  }

  closeModal() {
    this.modalRef.hide();
    this.display = false;
  }

  getMailBody() {
    if (this.address.extra && this.address.extra.fieldValue) {
      return 'mailto:?body=' + 'Address: ' + this.address.address + ', Name: ' + this.address.extra.fieldName + ', Value: ' + this.address.extra.fieldValue + ', Message: ' + this.address.extra.fieldMessage + '&subject=' + this.address.symbol + ' wallet address';
    } else {
      return 'mailto:?body=' + 'Address: ' + this.address.address + '&subject=' + this.address.symbol + ' wallet address';
    }
  }

  copy() {
    const el = document.createElement('textarea');
    el.value = this.address.address;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
}
