import { Component, OnInit, Renderer2, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { UtilService } from '../services/util.service';
import { Wallet } from '../models/wallet.model';
import { ExchangeModalComponent } from '../exchange-modal/exchange-modal.component';
import { ExchangeService } from '../apis/exchange.service';
import { Router, ActivatedRoute } from '@angular/router';
import { WalletService } from '../apis/wallet.service';
import swal2 from 'sweetalert2';

@Component({
  selector: 'app-exchange',
  templateUrl: './exchange.component.html',
  styleUrls: ['./exchange.component.scss']
})
export class ExchangeComponent implements OnInit, OnDestroy {
  @ViewChild('exchangeModal') exchangeModal: ExchangeModalComponent;
  bodyEl: any = undefined;
  rates: any = {};
  quote: any = undefined;
  wallets: any = undefined;
  isSubmitted = false;
  receiveAmount = '0';
  exchangeAmount = '0';
  exchangeWallet: Wallet = {
    title: '',
    image: '',
    color: '',
    symbol: '',
    balance: null,
    balanceFormatted: '',
    balanceCurrency: null,
    balanceCurrencyFormatted: '',
    isActive: null,
    isDefault: false,
    symbolData: undefined
  };
  receiveWallet: Wallet = {
    title: '',
    image: '',
    color: '',
    symbol: '',
    balance: null,
    balanceFormatted: '',
    balanceCurrency: null,
    balanceCurrencyFormatted: '',
    isActive: null,
    isDefault: false,
    symbolData: undefined
  };

  constructor(
    private router: Router,
    private elRef: ElementRef,
    private renderer: Renderer2,
    private route: ActivatedRoute,
    public utilService: UtilService,
    private walletService: WalletService,
    private exchangeService: ExchangeService
  ) {
    this.bodyEl = this.elRef.nativeElement.ownerDocument.body;
    this.loadBackground();
  }

  ngOnInit() {
    const resolveData = this.route.snapshot.data.defaults;
    this.exchangeService.currentRate.subscribe(r => this.rates = r);
    this.walletService.walletChange$.subscribe(r => this.wallets = r.filter(wallet => wallet.symbolData.type !== 'currency'));
    this.wallets = resolveData['wallets'];
    this.rates = resolveData['rates'];
    if (!this.rates || !this.wallets) {
      swal('Error', 'No data available', 'error');
      this.router.navigate(['wallet']);
    } else {
      this.wallets = this.wallets.filter(wallet => wallet.symbolData.type !== 'currency');
    }
    this.selectDefaultWallets();
    this.changeColor();
  }

  loadBackground() {
    this.renderer.setStyle(this.bodyEl, 'background-image', `url('/assets/images/gs-background.png')`);
  }

  selectDefaultWallets() {
    const availableWallets = this.wallets.filter(wallet => this.checkTicker(wallet));
    if (localStorage.getItem('selectedSymbol') && this.rates[localStorage.getItem('selectedSymbol')]) {
      this.exchangeWallet = availableWallets.filter(w => w.symbol === localStorage.getItem('selectedSymbol'))[0];
      this.receiveWallet = availableWallets.filter(w => w.symbol !== localStorage.getItem('selectedSymbol'))[0];
      if (!this.exchangeWallet || !this.receiveWallet) {
        this.exchangeWallet = availableWallets[0];
        this.receiveWallet = availableWallets[1];
      }
    } else {
      this.exchangeWallet = availableWallets[0];
      this.receiveWallet = availableWallets[1];
    }
  }

  getExchangeRate() {
    let rate;
    if (this.rates && this.rates[this.exchangeWallet.symbol] && this.rates[this.receiveWallet.symbol]) {
      rate = (this.rates[this.exchangeWallet.symbol].price / this.rates[this.receiveWallet.symbol].price).toFixed(5);
    }
    return rate;
  }

  onExchangeWallet(wallet: Wallet) {
    if (wallet.symbol !== this.receiveWallet.symbol) {
      this.exchangeWallet = wallet;
      this.changeColor();
    }
  }

  onReceiveWallet(wallet: Wallet) {
    if (wallet.symbol !== this.exchangeWallet.symbol) {
      this.receiveWallet = wallet;
      this.changeColor();
    }
  }

  isExchangeable() {
    let result = false;
    if (this.exchangeWallet.balance && parseFloat(this.exchangeAmount)) {
      result = true;
    }
    return result;
  }

  onexchangeAmount() {
    if (parseFloat(this.exchangeAmount) === 0) {
      this.exchangeAmount = '';
    }
  }

  getReceiveValue() {
    let value = 0.00;
    const exchangeRate = this.getExchangeRate();
    if (exchangeRate && parseFloat(this.exchangeAmount)) {
      const rate = parseFloat(exchangeRate);
      const amount = parseFloat(this.exchangeAmount);
      value = parseFloat((amount * rate).toFixed(4));
    }
    return value;
  }

  onExchange() {
    if (!this.isSubmitted && this.exchangeWallet.balance && this.rates &&
      this.rates[this.exchangeWallet.symbol] && this.rates[this.receiveWallet.symbol]) {
      this.isSubmitted = true;
      const obj = {
        from_exchange_id: this.rates[this.exchangeWallet.symbol].exchange_id,
        to_exchange_id: this.rates[this.receiveWallet.symbol].exchange_id,
        from_quantity: parseFloat(this.exchangeAmount)
      };
      this.exchangeService.quote(obj)
        .subscribe(
          (data: any) => {
            if (data.success) {
              this.quote = data.data;
              this.quote['to_quantity'] = this.getReceiveValue();
              this.exchangeModal.openModal();
            } else {
              swal('Error', data.error[0].message, 'error');
            }
            this.isSubmitted = false;
          },
          (error: any) => {
          }
        );
    }
  }

  changeColor() {
    if (this.exchangeWallet.color && this.receiveWallet.color) {
      this.renderer.setStyle(this.bodyEl, 'background-image',
      `url('/assets/images/gs-background.png'), linear-gradient(to right,
      ${this.exchangeWallet.color} 10%, ${this.receiveWallet.color} 90%)`);
    }
  }

  checkTicker(wallet: Wallet) {
    let available = false;
    if (wallet && this.rates && this.rates[wallet.symbol] && wallet.symbolData.type !== 'currency') {
      available = true;
    }
    return available;
  }

  onExchangeDone(msg) {
    this.exchangeAmount = '0.00';
    this.walletService.wallet().subscribe(
      (data: any) => {
        this.wallets = data.filter(wallet => wallet.symbolData.type !== 'currency');
        this.exchangeWallet = this.wallets.filter(wallet => wallet.symbol === this.exchangeWallet.symbol)[0];
        this.receiveWallet = this.wallets.filter(wallet => wallet.symbol === this.receiveWallet.symbol)[0];
        this.displayAlert(msg);
      },
      (error: any) => {

      }
    );
  }
  displayAlert(type) {
    if (type === 'success') {
      swal2({
        html: `<div class="row">
                    <div class="col-4 text-right">
                      <i class="far fa-check-circle fa-3x exchange-success"></i>
                    </div>
                    <div style="color: black" class="col-8 pl-0 pt-3 text-left font-weight-bold text-large">
                      Exchange done
                    </div>
                  </div>
                  <hr class="w-75">`,
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-primary btn-sm pl-5 pr-5',
        heightAuto: false
      });
    } else if (type === 'error') {
      swal2({
        html: `<div class="row">
                    <div class="col-4 text-right">
                      <i class="far fa-times-circle fa-3x exchange-error"></i>
                    </div>
                    <div style="color: black" class="col-8 p-0 pt-3 text-left text-black font-weight-bold text-large">
                      Exchange failed
                    </div>
                  </div>
                  <hr class="w-75">`,
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-primary btn-sm pl-5 pr-5',
        heightAuto: false
      });
    }
  }

  ngOnDestroy() {
    this.renderer.removeStyle(this.bodyEl, 'background-image');
    this.renderer.removeStyle(this.bodyEl, 'background-color');
    this.renderer.removeAttribute(this.bodyEl, 'background');
  }
}
