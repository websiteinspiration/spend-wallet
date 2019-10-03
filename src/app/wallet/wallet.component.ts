import { Component, OnInit, Renderer2, TemplateRef, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { WalletService } from '../apis/wallet.service';
import { SymbolService } from '../apis/symbol.service';
import { ActivatedRoute } from '@angular/router';
import { TransactionService } from '../apis/transaction.service';
import { Wallet } from '../models/wallet.model';
import { Symbol } from '../models/symbol.model';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import * as _ from 'lodash';
import { Transaction } from '../models/transaction.model';
import { SlideInOutAnimation } from '../helper/animations';
import { SendModalComponent } from '../send-modal/send-modal.component';
import { AlertService } from '../services/alert.service';
import { ReceiveModalComponent } from '../receive-modal/receive-modal.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import * as $ from 'jquery';
import { UtilService } from '../services/util.service';
import { InViewportMetadata } from 'ng-in-viewport';
import { CurrencyModalComponent } from '../currency-modal/currency-modal.component';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss'],
  animations: [SlideInOutAnimation]
})
export class WalletComponent implements OnInit, OnDestroy {
  @ViewChild('sendModal') sendModal: SendModalComponent;
  @ViewChild('receiveModal') receiveModal: ReceiveModalComponent;
  @ViewChild('currencyModal') currencyModal: CurrencyModalComponent;
  toggle = false;
  close = true;
  icons = Transaction.icons;
  SearchBar = false;
  searchValue = '';
  menu = false;
  symbolsDisplayed = [];
  modalRef: BsModalRef;
  activeTimeFilter: any = '24h';
  selectedWallet: string;
  selectedTransactionId: string;
  wallets: Wallet[] = [];
  symbols: Symbol[] = [];
  txUrls: any;
  totalTxn = -1;
  pages = 0;
  page = 0;
  firstLoad = false;
  transactionLimit = 20;
  loading = false;
  noMoreTransactions = false;
  transactionArray = [];
  sendBtnColor: string = null;
  recBtnColor: string = null;
  sendBtnBkcolor = 'white';
  recBtnBkcolor = 'white';
  graphOpacity = 1;
  graphLoading = false;
  graphMsg: string = undefined;
  selectedSymbolMarketData: any = null;
  bodyEl: any = undefined;
  currencyModalType: string;
  selectedWalletData: Wallet = {
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
    symbolData: {}
  };

  selectedSymbolData: Symbol = {
    title: '',
    symbol: '',
    card: '',
    image: '',
    status: null,
    receive: null,
    send: null,
    cardSpendable: null,
    conversionRate: '',
    order: null,
    color: '',
    fee: null,
    feeFormatted: '',
    marketData: {},
    extra: {},
    type: ''
  };

  temp: Symbol = {
    title: 'Not Available',
    symbol: '',
    card: '',
    image: '',
    status: false,
    receive: false,
    send: false,
    cardSpendable: false,
    conversionRate: null,
    order: null,
    color: '',
    fee: null,
    feeFormatted: '',
    marketData: null,
    extra: {},
    type: ''
  };

  public readonly transactions: BehaviorSubject<any[]> = new BehaviorSubject([]);
  constructor(private renderer: Renderer2,
    private route: ActivatedRoute,
    public utilService: UtilService,
    public walletService: WalletService,
    public transactionService: TransactionService,
    public symbolService: SymbolService,
    private alertService: AlertService,
    private modalService: BsModalService,
    private _sanitizer: DomSanitizer,
    private elRef: ElementRef) {
    this.txUrls = environment.txUrl;
    this.bodyEl = this.elRef.nativeElement.ownerDocument.body;
    this.loadBackground();
  }

  ngOnInit() {
    const that = this;
    that.wallets = this.walletService.wallets;
    that.symbols = this.symbolService.symbols;
    that.txUrls = this.txUrls;
    this.symbolsDisplayed = this.symbols;
    this.selectSymbol(this.route.snapshot.data.defaults.symbol, null);
    this.walletService.walletChange$
      .subscribe(wallets => {
        this.selectedWalletData = wallets
          .find(s => s['symbol'] === that.selectedWallet);
        this.selectedSymbolData = that.symbolService.symbols
          .find(s => s['symbol'] === that.selectedWallet);
        that.wallets = wallets;
      });
  }

  toggleChange() {
    this.toggle = !this.toggle;
    this.menu = true;
  }

  searching() {
    let found = false;
    this.symbolsDisplayed = [];
    for (const j in this.symbols) {
      if (this.symbols[j]['title'].toLowerCase().includes(this.searchValue.toLowerCase())
        || this.symbols[j]['symbol'].toLowerCase().includes(this.searchValue.toLowerCase())) {
        this.symbolsDisplayed.push(this.symbols[j]);
        found = true;
      }
    }
    if (!found) {
      this.symbolsDisplayed.push(this.temp);
    }
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template,
      Object.assign({}, { class: 'send-modal' }));
  }

  showMenu(p = null) {
    if (p == null) {
      this.menu = !this.menu;
    } else {
      this.menu = !p;
    }
    this.symbolsDisplayed = this.symbols;
    this.searchValue = null;
  }

  loadBackground() {
    this.renderer.removeStyle(this.bodyEl, 'background-size');
    this.renderer.removeStyle(this.bodyEl, 'background-repeat');
    this.renderer.setAttribute(this.bodyEl, 'background', '/assets/images/gs-background.png');
  }

  changeColor(color) {
    this.renderer.setStyle(this.bodyEl, 'background-color', color);
  }

  getValue() {
    return _.find(this.symbols,
      x => x['title'] === this.searchValue || x['symbol'] === this.searchValue);
  }

  showSearchBar() {
    this.SearchBar = !this.SearchBar;
  }

  selectSymbol(s, event) {
    this.menu = true;
    if (event) {
      $('.sidenav ul li').removeClass('selected');
      if ($(event.target)[0].tagName === 'LI') {
        $(event.target).addClass('selected');
      } else {
        $(event.target).parents('li').addClass('selected');
      }
    } else {
      setTimeout(function () {
        $('.sidenav ul li[data-symbol=\'' + s.symbol + '\']').addClass('selected');
        $('ul.scrolling').animate({
          scrollTop: ($('.sidenav ul li[data-symbol=\'' + s.symbol + '\']').offset().top - 125)
        }, 500);
      }, 1000);
    }
    if (s) {
      this.transactions.next(this.transactionService.transactions);
      this.selectedWallet = s.symbol;
      this.selectedSymbolData = s;
      localStorage.setItem('selectedSymbol', s.symbol);
      this.selectedWalletData = this.walletService.wallets
        .find(s1 => s1['symbol'] === s.symbol);
      this.selectBtnColors();
      this.onTimeFilter(this.activeTimeFilter);
      this.page = 0;
      this.pages = 0;
      this.totalTxn = -1;
      this.loading = false;
      this.firstLoad = false;
      this.noMoreTransactions = false;
      this.loadTransaction().then(() => { this.firstLoad = true; });
      this.symbolsDisplayed = this.symbols;
      this.searchValue = null;
      this.changeColor(this.selectedSymbolData.color);
    }
  }

  getMarketData(option) {
    return new Promise((resolve, reject) => {
      let period = null;
      let periodFactor = null;
      let interval = null;
      switch (option) {
        case '24h':
          period = 'minutes';
          periodFactor = 1440;
          interval = 4;
          break;
        case '7d':
          period = 'minutes';
          periodFactor = 10080;
          interval = 30;
          break;
        case '1m':
          period = 'minutes';
          periodFactor = 43200;
          interval = 120;
          break;
        case '3m':
          period = 'minutes';
          periodFactor = 129600;
          interval = 360;
          break;
        case '1y':
          period = 'days';
          periodFactor = 365;
          interval = 1;
          break;
        case 'all':
          period = 'minutes';
          periodFactor = 3679200;
          interval = 10080;
          break;
      }
      this.symbolService.getMarketData(this.selectedSymbolData.symbol, period, periodFactor, interval)
        .subscribe(
          (data: any) => {
            this.selectedSymbolMarketData = data;
            resolve(this.selectedSymbolMarketData);
          },
          (error: any) => {
            resolve();
          }
        );
    });
  }

  onIntersection(event): void {
    const { [InViewportMetadata]: { entry }, target, visible } = event;
    const height = entry.rootBounds.height - entry.boundingClientRect.y;
    const atBotttom = (height >= 0 && height <= 50) ? true : false;
    if (event && event.visible && this.pages && !this.loading && this.totalTxn > 0 && atBotttom) {
      if (this.page > this.pages && this.firstLoad) {
        this.noMoreTransactions = true;
        return;
      } else {
        this.loading = true;
        this.loadTransaction()
          .then(() => {
            this.loading = false;
          })
          .catch(() => {
            this.loading = false;
          });
      }
    }
  }

  loadTransaction() {
    return new Promise((resolve, reject) => {
      this.transactionService.list(this.selectedWallet, this.page, this.transactionLimit)
        .subscribe(r => {
          this.pages = r['totalPages'];
          this.page += 1;
          this.totalTxn = r['total'];
          this.transactions.next(this.transactionArray.concat(r['transactions']));
          resolve();
        },
          (error: any) => {
            reject();
          }
        );
    });
  }

  selectBtnColors() {
    this.sendBtnColor = this.selectedSymbolData.color;
    this.recBtnColor = this.selectedSymbolData.color;
  }

  collapse(trans) {
    this.close = false;
    this.selectedTransactionId = this.selectedTransactionId === trans.id ? null : trans.id;
  }

  sendPopup() {
    if (this.selectedSymbolData['type'] === 'blockchain') {
      this.sendModal.openModal();
    } else if (this.selectedSymbolData['type'] === 'currency') {
      this.currencyModalType = 'withdraw';
      this.currencyModal.openModal();
    }
  }

  receivePopup() {
    if (this.selectedSymbolData['type'] === 'blockchain') {
      this.receiveModal.openModal();
    } else if (this.selectedSymbolData['type'] === 'currency') {
      this.currencyModalType = 'deposit';
      this.currencyModal.openModal();
    }
  }

  toggleDefault() {
    this.walletService.toggleDefault(this.selectedWalletData.symbol, !this.selectedWalletData.isDefault)
      .subscribe((r: any) => {
        if (r.success) {
          this.selectedWalletData.isDefault = r.data.isDefault;
          this.alertService.push('success', `${this.selectedWalletData.title} wallet is ${r.data.isDefault ? 'active' : 'inactive'} `);
        } else {
          this.alertService.push('error', r.error && r.error[0] ? r.error[0].message : 'Failed');
        }
      });
  }

  sendBtnHover() {
    const temp = this.sendBtnColor;
    this.sendBtnColor = this.sendBtnBkcolor;
    this.sendBtnBkcolor = temp;
  }

  recBtnHover() {
    const temp = this.recBtnColor;
    this.recBtnColor = this.recBtnBkcolor;
    this.recBtnBkcolor = temp;
  }

  onTimeFilter(option) {
    this.graphMsg = undefined;
    this.graphLoading = true;
    this.graphOpacity = 0.2;
    this.activeTimeFilter = option;
    this.getMarketData(option).then((symbolData) => {
      if (symbolData['price'].length <= 1 && symbolData['type'] === 'blockchain') {
        this.graphMsg = 'Not Available';
        this.alertService.push('error', 'No data Available');
        if (option !== 0) {
          this.onTimeFilter(0);
        }
      } else {
        this.graphLoading = false;
        this.graphOpacity = 1;
      }
    });
  }

  onPanelClick() {
    this.toggle = false;
    this.close = true;
    this.menu = true;
  }

  onTransaction(trans = false) {
    if (!trans) {
      this.selectedTransactionId = null;
      this.close = !this.close;
    } else {
      this.close = false;
    }
  }

  getToolTipColor(status) {
    let colorClass = '';
    switch (status) {
      case 'completed':
        colorClass = 'tooltip-completed';
        break;
      case 'pending':
        colorClass = 'tooltip-pending';
        break;
      case 'failed':
        colorClass = 'tooltip-failed';
        break;
    }
    return colorClass;
  }

  getStatusIcon(status) {
    let html = '';
    switch (status) {
      case 'completed':
        html = `<i class="fa fa-check text-success"></i>`;
        break;
      case 'pending':
        html = `<i class="fa fa-clock icon-pending"></i>`;
        break;
      case 'failed':
        html = `<i class="fa fa-exclamation text-danger"></i>`;
        break;
    }
    return html;
  }

  ngOnDestroy() {
    this.renderer.removeAttribute(this.bodyEl, 'background');
    this.renderer.removeStyle(this.bodyEl, 'background-color');
    this.renderer.removeStyle(this.bodyEl, 'background-size');
    this.renderer.removeStyle(this.bodyEl, 'background-repeat');
  }

  getIcon(transaction) {
    let icon = '';
    switch (transaction.type) {
      case 'Receive':
        icon = `<svg id="Layer_1" width="40" height="40" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110.4 106.37"><defs><style>.cls-1{fill:${this.selectedSymbolData.color};}</style></defs><title>icons_B</title><path class="cls-1" d="M56.5,103.67a50.26,50.26,0,1,1,50.26-50.26A50.32,50.32,0,0,1,56.5,103.67Zm0-98.52a48.26,48.26,0,1,0,48.26,48.26A48.32,48.32,0,0,0,56.5,5.15Z"/><g id="coins"><path class="cls-1" d="M56.6,72.92a67.42,67.42,0,0,1-8.14.49,64.77,64.77,0,0,1-11.45-1V65.86a71.08,71.08,0,0,0,11.45.92c.9,0,3,0,5.57-.22A19.67,19.67,0,0,1,53.61,64c-1.7.13-3.43.2-5.15.2a63.81,63.81,0,0,1-11.45-1V56.64a71.08,71.08,0,0,0,11.45.92c.9,0,3,0,5.51-.22a22,22,0,0,1,.75-2.67c-2,.19-4.16.29-6.26.29A64.77,64.77,0,0,1,37,54V47.83c1.42.06,2.57.08,3.23.08s2.36,0,4.37-.14c1.25.07,2.54.11,3.85.11a61.32,61.32,0,0,0,11.06-1,21.67,21.67,0,0,1,9.53-5.74c-1.42-1.56-4.06-2.62-7.12-3.32V36.72c5.45-1.24,8.22-3.27,8.22-6V24.41c0-4.89-8.74-6.59-16.08-7.16a69.93,69.93,0,0,0-11.21,0c-7.34.57-16.09,2.27-16.09,7.16v3.8c-4.57,1.05-8.23,2.88-8.23,6v6.28c0,3.21,3.78,5,8.23,6.06v22c0,7,18.07,7.39,21.69,7.39a74.34,74.34,0,0,0,9.83-.68A22.2,22.2,0,0,1,56.6,72.92ZM65.78,42.2a21.07,21.07,0,0,1-6.12,2,4.56,4.56,0,0,0,2.26-3.56A16.57,16.57,0,0,1,65.78,42.2Zm1.78-11.51c0,2.86-9.88,4.79-19.1,4.79a63.81,63.81,0,0,1-11.45-1V27.37a61.12,61.12,0,0,0,11.45,1c8.62,0,16.22-1.6,19.1-3.77ZM43.07,19.84c2.3-.18,4.2-.22,5.39-.22s3.1,0,5.4.22c6.7.56,10.56,2,11.92,2.87-1.71,1.05-7.31,3.09-17.32,3.09s-15.61-2-17.31-3.09C32.5,21.88,36.37,20.4,43.07,19.84ZM29.36,24.62a15.55,15.55,0,0,0,5,2.15v7.12c-3-.81-5-1.91-5-3.2Zm-3.5,19c-2.86-.81-4.72-1.88-4.72-3.12V34.45a14.73,14.73,0,0,0,4.72,2.06Zm-2.94-11.1A17.1,17.1,0,0,1,26.8,31a4.87,4.87,0,0,0,2.65,3.65A21.51,21.51,0,0,1,22.92,32.54Zm5.53,4.6a60.69,60.69,0,0,0,11.79,1.09c1.83,0,3.6-.08,5.31-.22,1.27.05,2.3.06,2.91.06a72.67,72.67,0,0,0,10.87-.84v3.29c0,2.87-9.87,4.79-19.09,4.79a63.4,63.4,0,0,1-11.79-1.06Zm6,34.69c-3-.82-5-1.92-5-3.21V63.34a18.1,18.1,0,0,0,5,2Zm0-9.23c-3-.81-5-1.91-5-3.2V54.11a17.8,17.8,0,0,0,5,2Zm0-9.22c-3-.82-5-1.92-5-3.21V47.08c1.73.29,3.47.47,5,.6Z"/><path class="cls-1" d="M75,80.05A18.23,18.23,0,1,1,93.2,61.82,18.25,18.25,0,0,1,75,80.05Zm0-33.86A15.63,15.63,0,1,0,90.61,61.82,15.65,15.65,0,0,0,75,46.19Z"/><path class="cls-1" d="M82.64,65.94c0-3.74-3.34-4.87-6.36-5.63V54.42c2.77.43,3.23,2.22,3.23,3.35a1.3,1.3,0,0,0,2.6,0c0-2.66-1.57-5.48-5.83-6V49.12a1.3,1.3,0,1,0-2.6,0V51.8c-4.85.47-5.62,3.55-5.62,5.45,0,3.26,2.88,4.37,5.62,5.09V69.1a4.45,4.45,0,0,1-3.78-4,1.3,1.3,0,1,0-2.59,0c0,2.33,1.77,5.86,6.37,6.6v2.13a1.3,1.3,0,1,0,2.6,0v-2C81,71.54,82.64,68.53,82.64,65.94Zm-12-8.69c0-.77,0-2.47,3-2.84v5.23C71.63,59.05,70.65,58.46,70.65,57.25Zm5.63,12V63c2.55.7,3.76,1.37,3.76,2.94C80,67.1,79.52,69,76.28,69.25Z"/></g></svg>`;
      break;
      case 'Send':
        icon = `<svg id="Layer_1" width="40" height="40" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110.4 106.37"><defs><style>.cls-1{fill:${this.selectedSymbolData.color};}</style></defs><title>icons_B</title><path class="cls-1" d="M54.5,103.67a50.26,50.26,0,1,1,50.26-50.26A50.32,50.32,0,0,1,54.5,103.67Zm0-98.52a48.26,48.26,0,1,0,48.26,48.26A48.32,48.32,0,0,0,54.5,5.15Z"/><path class="cls-1" d="M85.25,31.86l0,0c-1-.57,1.53-.49-68.49,18.79a.73.73,0,0,0-.21,1.32l13.82,9.34c5.16,23.14,4.7,21.64,5.11,21.89,0,0,0,0,0,0a.76.76,0,0,0,.35.09.73.73,0,0,0,.51-.21L47.15,72.63C63.39,83.56,63.3,84,63.81,82.84,86.53,30.19,86,32.46,85.25,31.86ZM38.87,65.26l-6.44-4.35,43.89-23.2L64.83,46.16ZM78.37,35,31.05,60,18.67,51.61ZM38.08,66.5,35.77,78.86,32.12,62.48ZM37,80.41l2.43-13,6.49,4.39Zm25.82,1L40.17,66.14,83,34.61Z"/></svg>`;
      break;
      case 'exchangeReceive':
        icon = `<svg id="Layer_1" width="40" height="40" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110.4 106.37"><defs><style>.cls-1{fill:${this.selectedSymbolData.color};}</style></defs><title>icons_B</title><path class="cls-1" d="M54.59,103.75a50.26,50.26,0,1,1,50.26-50.26A50.31,50.31,0,0,1,54.59,103.75Zm0-98.52a48.26,48.26,0,1,0,48.26,48.26A48.32,48.32,0,0,0,54.59,5.23Z"/><path class="cls-1" d="M68.45,56.4A16.56,16.56,0,1,1,85,39.84,16.58,16.58,0,0,1,68.45,56.4Zm0-31.25A14.69,14.69,0,1,0,83.14,39.84,14.71,14.71,0,0,0,68.45,25.15Z"/><path class="cls-1" d="M69.72,46.82H67.18a4,4,0,0,1-4-4,.94.94,0,1,1,1.87,0A2.08,2.08,0,0,0,67.18,45h2.54a2.09,2.09,0,0,0,0-4.17H67.18a4,4,0,0,1,0-7.91h2.54a4,4,0,0,1,4,4,.94.94,0,1,1-1.87,0,2.08,2.08,0,0,0-2.08-2.08H67.18a2.09,2.09,0,0,0,0,4.17h2.54a4,4,0,0,1,0,7.91Z"/><path class="cls-1" d="M68.45,34.74a.93.93,0,0,1-.93-.94V31a.94.94,0,1,1,1.87,0V33.8A.94.94,0,0,1,68.45,34.74Z"/><path class="cls-1" d="M68.45,49.62a.93.93,0,0,1-.93-.94V45.89a.94.94,0,1,1,1.87,0v2.79A.94.94,0,0,1,68.45,49.62Z"/><path class="cls-1" d="M45.59,42.94a1,1,0,0,1-.5-.14l-17-10.54a.94.94,0,0,1-.44-.8.93.93,0,0,1,.45-.79l17-10.43a.91.91,0,0,1,.94,0,.94.94,0,0,1,.48.82v4.75h7.72a.94.94,0,1,1,0,1.87H45.59a.94.94,0,0,1-.94-.94v-4L30.4,31.47l14.25,8.85V36.2a.94.94,0,0,1,.94-.93h4.33a.94.94,0,1,1,0,1.87h-3.4V42a.94.94,0,0,1-.93.94Z"/><path class="cls-1" d="M40.72,83.13A16.56,16.56,0,1,1,57.28,66.57,16.58,16.58,0,0,1,40.72,83.13Zm0-31.25A14.69,14.69,0,1,0,55.41,66.57,14.71,14.71,0,0,0,40.72,51.88Z"/><path class="cls-1" d="M42.27,75a8.41,8.41,0,1,1,5.66-14.63.93.93,0,0,1-1.26,1.38,6.54,6.54,0,1,0,0,9.67.93.93,0,1,1,1.26,1.38A8.36,8.36,0,0,1,42.27,75Z"/><path class="cls-1" d="M42,65.23H32.27a.94.94,0,0,1,0-1.87H42a.94.94,0,0,1,0,1.87Z"/><path class="cls-1" d="M42,69.77H32.27a.94.94,0,0,1,0-1.87H42a.94.94,0,0,1,0,1.87Z"/><path class="cls-1" d="M63.58,86.88a.92.92,0,0,1-.45-.12.91.91,0,0,1-.48-.81V81.2H54.93a.94.94,0,1,1,0-1.87h8.65a.94.94,0,0,1,.94.93v4l14.26-8.77-14.26-9v4.23a.94.94,0,0,1-.94.94H59.25a.94.94,0,1,1,0-1.87h3.4v-5a.94.94,0,0,1,1.43-.8l17,10.67a.93.93,0,0,1,0,1.59l-17,10.43A1,1,0,0,1,63.58,86.88Z"/></svg>`;
      break;
      case 'exchangeSend':
        icon = `<svg id="Layer_1" width="40" height="40" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110.4 106.37"><defs><style>.cls-1{fill:${this.selectedSymbolData.color};}</style></defs><title>icons_B</title><path class="cls-1" d="M54.59,103.75a50.26,50.26,0,1,1,50.26-50.26A50.31,50.31,0,0,1,54.59,103.75Zm0-98.52a48.26,48.26,0,1,0,48.26,48.26A48.32,48.32,0,0,0,54.59,5.23Z"/><path class="cls-1" d="M68.45,56.4A16.56,16.56,0,1,1,85,39.84,16.58,16.58,0,0,1,68.45,56.4Zm0-31.25A14.69,14.69,0,1,0,83.14,39.84,14.71,14.71,0,0,0,68.45,25.15Z"/><path class="cls-1" d="M69.72,46.82H67.18a4,4,0,0,1-4-4,.94.94,0,1,1,1.87,0A2.08,2.08,0,0,0,67.18,45h2.54a2.09,2.09,0,0,0,0-4.17H67.18a4,4,0,0,1,0-7.91h2.54a4,4,0,0,1,4,4,.94.94,0,1,1-1.87,0,2.08,2.08,0,0,0-2.08-2.08H67.18a2.09,2.09,0,0,0,0,4.17h2.54a4,4,0,0,1,0,7.91Z"/><path class="cls-1" d="M68.45,34.74a.93.93,0,0,1-.93-.94V31a.94.94,0,1,1,1.87,0V33.8A.94.94,0,0,1,68.45,34.74Z"/><path class="cls-1" d="M68.45,49.62a.93.93,0,0,1-.93-.94V45.89a.94.94,0,1,1,1.87,0v2.79A.94.94,0,0,1,68.45,49.62Z"/><path class="cls-1" d="M45.59,42.94a1,1,0,0,1-.5-.14l-17-10.54a.94.94,0,0,1-.44-.8.93.93,0,0,1,.45-.79l17-10.43a.91.91,0,0,1,.94,0,.94.94,0,0,1,.48.82v4.75h7.72a.94.94,0,1,1,0,1.87H45.59a.94.94,0,0,1-.94-.94v-4L30.4,31.47l14.25,8.85V36.2a.94.94,0,0,1,.94-.93h4.33a.94.94,0,1,1,0,1.87h-3.4V42a.94.94,0,0,1-.93.94Z"/><path class="cls-1" d="M40.72,83.13A16.56,16.56,0,1,1,57.28,66.57,16.58,16.58,0,0,1,40.72,83.13Zm0-31.25A14.69,14.69,0,1,0,55.41,66.57,14.71,14.71,0,0,0,40.72,51.88Z"/><path class="cls-1" d="M42.27,75a8.41,8.41,0,1,1,5.66-14.63.93.93,0,0,1-1.26,1.38,6.54,6.54,0,1,0,0,9.67.93.93,0,1,1,1.26,1.38A8.36,8.36,0,0,1,42.27,75Z"/><path class="cls-1" d="M42,65.23H32.27a.94.94,0,0,1,0-1.87H42a.94.94,0,0,1,0,1.87Z"/><path class="cls-1" d="M42,69.77H32.27a.94.94,0,0,1,0-1.87H42a.94.94,0,0,1,0,1.87Z"/><path class="cls-1" d="M63.58,86.88a.92.92,0,0,1-.45-.12.91.91,0,0,1-.48-.81V81.2H54.93a.94.94,0,1,1,0-1.87h8.65a.94.94,0,0,1,.94.93v4l14.26-8.77-14.26-9v4.23a.94.94,0,0,1-.94.94H59.25a.94.94,0,1,1,0-1.87h3.4v-5a.94.94,0,0,1,1.43-.8l17,10.67a.93.93,0,0,1,0,1.59l-17,10.43A1,1,0,0,1,63.58,86.88Z"/></svg>`;
      break;
      case 'Sold':
        icon = `<svg id="Layer_1" width="40" height="40" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110.4 106.37"><defs><style>.cls-1{fill:${this.selectedSymbolData.color};}</style></defs><title>icons_B</title><path class="cls-1" d="M53.5,103.67a50.26,50.26,0,1,1,50.26-50.26A50.32,50.32,0,0,1,53.5,103.67Zm0-98.52a48.26,48.26,0,1,0,48.26,48.26A48.32,48.32,0,0,0,53.5,5.15Z"/><path class="cls-1" d="M56.08,59.54h-2a3.29,3.29,0,0,1-3.29-3.28.88.88,0,1,1,1.76,0,1.52,1.52,0,0,0,1.53,1.52h2a1.53,1.53,0,1,0,0-3.05h-2a3.29,3.29,0,1,1,0-6.57h2a3.3,3.3,0,0,1,3.29,3.29.88.88,0,0,1-1.76,0,1.54,1.54,0,0,0-1.53-1.53h-2a1.53,1.53,0,1,0,0,3h2a3.29,3.29,0,1,1,0,6.57Z"/><path class="cls-1" d="M55.07,49.92A.87.87,0,0,1,54.2,49V46.82a.88.88,0,1,1,1.75,0V49A.87.87,0,0,1,55.07,49.92Z"/><path class="cls-1" d="M55.07,61.77a.88.88,0,0,1-.87-.88V58.66a.88.88,0,1,1,1.75,0v2.23A.88.88,0,0,1,55.07,61.77Z"/><path class="cls-1" d="M60.34,36a.88.88,0,0,1-.88-.88c0-.65.51-1.3,3.71-4.09l.69-.61a.83.83,0,0,0,0-.49c0-.06-.24-.16-.74-.16-2.47,0-3.25-.12-4-.91a4.19,4.19,0,0,0-2.11.52,2.68,2.68,0,0,1-1.93.26,2.66,2.66,0,0,1-1.92-.26A3.64,3.64,0,0,0,51,28.89c-.74.74-1.52.86-4,.86-.52,0-.71.12-.74.16a.76.76,0,0,0,0,.49L47,31c3.19,2.79,3.7,3.44,3.7,4.09a.87.87,0,0,1-.87.88.88.88,0,0,1-.86-.67,30.61,30.61,0,0,0-3.13-3c-.92-.8-1.12-1-1.16-1.26A2.18,2.18,0,0,1,47,28c2.3,0,2.53-.13,2.79-.39,1-1,3.24-.33,4.23.24a1.17,1.17,0,0,0,.82,0,.86.86,0,0,1,.45,0,1.17,1.17,0,0,0,.82,0c1-.57,3.24-1.23,4.23-.24.26.26.49.39,2.79.39a2.45,2.45,0,0,1,2.22,1,2.49,2.49,0,0,1,.13,2.11c0,.29-.25.46-1.16,1.26a30.61,30.61,0,0,0-3.13,3A.89.89,0,0,1,60.34,36Z"/><path class="cls-1" d="M59.57,40.44h-9a3.11,3.11,0,0,1,0-6.22h9a3.11,3.11,0,1,1,0,6.22Zm-9-4.46a1.35,1.35,0,0,0,0,2.7h9a1.35,1.35,0,1,0,0-2.7Z"/><path class="cls-1" d="M67.7,66.28a8.6,8.6,0,0,1-1.36-.13,4.52,4.52,0,0,0-1.58-.06.9.9,0,0,1-1-.75.87.87,0,0,1,.74-1,6.28,6.28,0,0,1,2.13.06,4.89,4.89,0,0,0,1.86,0c.54-.09.91-.27,1-.48a1.62,1.62,0,0,0-.59-1.28c-1-1-1.33-4.2-1.79-9.73-.08-1-.17-2-.26-3-.44-4.75-7.68-9.63-7.75-9.68a.89.89,0,0,1-.25-1.22.88.88,0,0,1,1.22-.24c.33.22,8,5.39,8.53,11,.09,1,.18,2,.26,3,.28,3.36.66,8,1.28,8.63a3.18,3.18,0,0,1,1,3.06,2.62,2.62,0,0,1-2.37,1.67A6.24,6.24,0,0,1,67.7,66.28Z"/><path class="cls-1" d="M41.76,58.43h-.11a.89.89,0,0,1-.77-1c.16-1.39.29-3,.43-4.63.08-1,.16-2,.26-3,.51-5.58,8.2-10.75,8.53-11a.87.87,0,0,1,1.21.24.88.88,0,0,1-.24,1.22c-.07.05-7.31,4.93-7.75,9.68-.09,1-.18,2-.26,3-.14,1.68-.27,3.26-.43,4.68A.88.88,0,0,1,41.76,58.43Z"/><path class="cls-1" d="M57.73,80a2.9,2.9,0,0,1-.83-.1c-2.74-.83-16.55-1.09-21.64-1.11a.89.89,0,0,1-.87-.89.87.87,0,0,1,.88-.87h0c.76,0,18.59.11,22.15,1.19,1.68.5,10.54-2.81,22-8.28a.5.5,0,0,0,.19-.75,4.65,4.65,0,0,0-5.47-1.63L63.48,71.71a5.36,5.36,0,0,1-3.58.1L54.26,70a.88.88,0,0,1,.54-1.68l5.64,1.83a3.59,3.59,0,0,0,2.4-.07l10.71-4.18a6.42,6.42,0,0,1,7.54,2.24,2.26,2.26,0,0,1-.86,3.37C71.88,75.46,61.54,80,57.73,80Z"/><path class="cls-1" d="M61.45,70H45.7a.88.88,0,1,1,0-1.76H61.45a3.81,3.81,0,0,0-3.69-3.79A62,62,0,0,1,51.35,64,24.88,24.88,0,0,1,47,62.84a21.15,21.15,0,0,0-6.89-1.43c-4.11,0-9,5.45-9,5.51a.88.88,0,0,1-1.24.08.87.87,0,0,1-.08-1.24c.22-.25,5.41-6.11,10.32-6.11a22.66,22.66,0,0,1,7.45,1.53,25,25,0,0,0,4.07,1.11,58.24,58.24,0,0,0,6.2.43,5.54,5.54,0,0,1,5.38,5.56A1.74,1.74,0,0,1,61.45,70Z"/><path class="cls-1" d="M29.5,83.72a1,1,0,0,1-.33-.06.92.92,0,0,1-.48-.47L21.62,66.47a.89.89,0,0,1,.47-1.16l6.67-2.82a.87.87,0,0,1,1.15.47L37,79.68a.88.88,0,0,1-.46,1.15l-6.68,2.82A.77.77,0,0,1,29.5,83.72ZM23.58,66.59,30,81.69,35,79.55l-6.39-15.1Z"/><path class="cls-1" d="M79.6,26.34V61.53a.88.88,0,1,1-1.75,0V26.34a.88.88,0,1,1,1.75,0Z"/><path class="cls-1" d="M86.2,37.15a.88.88,0,0,1-1.63.46L78.72,28l-5.84,9.58a.88.88,0,0,1-1.51-.92L78,25.88a.89.89,0,0,1,1.51,0l6.59,10.81A.84.84,0,0,1,86.2,37.15Z"/></svg>`;
      break;
      case 'Bought':
        icon = `<svg id="Layer_1" width="40" height="40" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110.4 106.37"><defs><style>.cls-1{fill:${this.selectedSymbolData.color};}</style></defs><title>icons_B</title><path class="cls-1" d="M86,40.23H25.41a1,1,0,0,1-.56-1.82l30.3-20.69a1,1,0,0,1,1.12,0l30.3,20.69A1,1,0,0,1,87,39.53,1,1,0,0,1,86,40.23Zm-57.38-2H82.79L55.71,19.74Z"/><path class="cls-1" d="M83.69,45h-56a1,1,0,0,1-1-1v-4.8a1,1,0,1,1,2,0V43h54v-3.8a1,1,0,1,1,2,0V44A1,1,0,0,1,83.69,45Z"/><path class="cls-1" d="M31.54,76.16a1,1,0,0,1-1-1V44a1,1,0,1,1,2,0V75.17A1,1,0,0,1,31.54,76.16Z"/><path class="cls-1" d="M79.89,76.16a1,1,0,0,1-1-1V44a1,1,0,1,1,2,0V75.17A1,1,0,0,1,79.89,76.16Z"/><path class="cls-1" d="M39.15,76.16a1,1,0,0,1-1-1V44a1,1,0,1,1,2,0V75.17A1,1,0,0,1,39.15,76.16Z"/><path class="cls-1" d="M72.27,76.16a1,1,0,0,1-1-1V44a1,1,0,1,1,2,0V75.17A1,1,0,0,1,72.27,76.16Z"/><path class="cls-1" d="M83.69,82h-56a1,1,0,0,1-1-1V75.17a1,1,0,0,1,1-1h56a1,1,0,0,1,1,1V81A1,1,0,0,1,83.69,82Zm-55-2h54V76.16h-54Z"/><path class="cls-1" d="M45.61,76.16a1,1,0,0,1-1-1V44a1,1,0,1,1,2,0V75.17A1,1,0,0,1,45.61,76.16Z"/><path class="cls-1" d="M65.81,76.16a1,1,0,0,1-1-1V44a1,1,0,1,1,2,0V75.17A1,1,0,0,1,65.81,76.16Z"/><path class="cls-1" d="M52.77,76.16a1,1,0,0,1-1-1V44a1,1,0,1,1,2,0V75.17A1,1,0,0,1,52.77,76.16Z"/><path class="cls-1" d="M58.65,76.16a1,1,0,0,1-1-1V44a1,1,0,1,1,2,0V75.17A1,1,0,0,1,58.65,76.16Z"/><path class="cls-1" d="M55.5,103.67a50.26,50.26,0,1,1,50.26-50.26A50.32,50.32,0,0,1,55.5,103.67Zm0-98.52a48.26,48.26,0,1,0,48.26,48.26A48.32,48.32,0,0,0,55.5,5.15Z"/></svg>`;
      break;
      case 'disbursementDeposit':
        icon = `<svg id="Layer_1" width="40" height="40" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110.4 106.37"><defs><style>.cls-1{fill:${this.selectedSymbolData.color};}</style></defs><title>icons_B</title><path class="cls-1" d="M86,40.23H25.41a1,1,0,0,1-.56-1.82l30.3-20.69a1,1,0,0,1,1.12,0l30.3,20.69A1,1,0,0,1,87,39.53,1,1,0,0,1,86,40.23Zm-57.38-2H82.79L55.71,19.74Z"/><path class="cls-1" d="M83.69,45h-56a1,1,0,0,1-1-1v-4.8a1,1,0,1,1,2,0V43h54v-3.8a1,1,0,1,1,2,0V44A1,1,0,0,1,83.69,45Z"/><path class="cls-1" d="M31.54,76.16a1,1,0,0,1-1-1V44a1,1,0,1,1,2,0V75.17A1,1,0,0,1,31.54,76.16Z"/><path class="cls-1" d="M79.89,76.16a1,1,0,0,1-1-1V44a1,1,0,1,1,2,0V75.17A1,1,0,0,1,79.89,76.16Z"/><path class="cls-1" d="M39.15,76.16a1,1,0,0,1-1-1V44a1,1,0,1,1,2,0V75.17A1,1,0,0,1,39.15,76.16Z"/><path class="cls-1" d="M72.27,76.16a1,1,0,0,1-1-1V44a1,1,0,1,1,2,0V75.17A1,1,0,0,1,72.27,76.16Z"/><path class="cls-1" d="M83.69,82h-56a1,1,0,0,1-1-1V75.17a1,1,0,0,1,1-1h56a1,1,0,0,1,1,1V81A1,1,0,0,1,83.69,82Zm-55-2h54V76.16h-54Z"/><path class="cls-1" d="M45.61,76.16a1,1,0,0,1-1-1V44a1,1,0,1,1,2,0V75.17A1,1,0,0,1,45.61,76.16Z"/><path class="cls-1" d="M65.81,76.16a1,1,0,0,1-1-1V44a1,1,0,1,1,2,0V75.17A1,1,0,0,1,65.81,76.16Z"/><path class="cls-1" d="M52.77,76.16a1,1,0,0,1-1-1V44a1,1,0,1,1,2,0V75.17A1,1,0,0,1,52.77,76.16Z"/><path class="cls-1" d="M58.65,76.16a1,1,0,0,1-1-1V44a1,1,0,1,1,2,0V75.17A1,1,0,0,1,58.65,76.16Z"/><path class="cls-1" d="M55.5,103.67a50.26,50.26,0,1,1,50.26-50.26A50.32,50.32,0,0,1,55.5,103.67Zm0-98.52a48.26,48.26,0,1,0,48.26,48.26A48.32,48.32,0,0,0,55.5,5.15Z"/></svg>`;
      break;
      case 'disbursementWithdraw':
        icon = `<svg id="Layer_1" width="40" height="40" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110.4 106.37"><defs><style>.cls-1{fill:${this.selectedSymbolData.color};}</style></defs><title>icons_B</title><path class="cls-1" d="M53.5,103.67a50.26,50.26,0,1,1,50.26-50.26A50.32,50.32,0,0,1,53.5,103.67Zm0-98.52a48.26,48.26,0,1,0,48.26,48.26A48.32,48.32,0,0,0,53.5,5.15Z"/><path class="cls-1" d="M56.08,59.54h-2a3.29,3.29,0,0,1-3.29-3.28.88.88,0,1,1,1.76,0,1.52,1.52,0,0,0,1.53,1.52h2a1.53,1.53,0,1,0,0-3.05h-2a3.29,3.29,0,1,1,0-6.57h2a3.3,3.3,0,0,1,3.29,3.29.88.88,0,0,1-1.76,0,1.54,1.54,0,0,0-1.53-1.53h-2a1.53,1.53,0,1,0,0,3h2a3.29,3.29,0,1,1,0,6.57Z"/><path class="cls-1" d="M55.07,49.92A.87.87,0,0,1,54.2,49V46.82a.88.88,0,1,1,1.75,0V49A.87.87,0,0,1,55.07,49.92Z"/><path class="cls-1" d="M55.07,61.77a.88.88,0,0,1-.87-.88V58.66a.88.88,0,1,1,1.75,0v2.23A.88.88,0,0,1,55.07,61.77Z"/><path class="cls-1" d="M60.34,36a.88.88,0,0,1-.88-.88c0-.65.51-1.3,3.71-4.09l.69-.61a.83.83,0,0,0,0-.49c0-.06-.24-.16-.74-.16-2.47,0-3.25-.12-4-.91a4.19,4.19,0,0,0-2.11.52,2.68,2.68,0,0,1-1.93.26,2.66,2.66,0,0,1-1.92-.26A3.64,3.64,0,0,0,51,28.89c-.74.74-1.52.86-4,.86-.52,0-.71.12-.74.16a.76.76,0,0,0,0,.49L47,31c3.19,2.79,3.7,3.44,3.7,4.09a.87.87,0,0,1-.87.88.88.88,0,0,1-.86-.67,30.61,30.61,0,0,0-3.13-3c-.92-.8-1.12-1-1.16-1.26A2.18,2.18,0,0,1,47,28c2.3,0,2.53-.13,2.79-.39,1-1,3.24-.33,4.23.24a1.17,1.17,0,0,0,.82,0,.86.86,0,0,1,.45,0,1.17,1.17,0,0,0,.82,0c1-.57,3.24-1.23,4.23-.24.26.26.49.39,2.79.39a2.45,2.45,0,0,1,2.22,1,2.49,2.49,0,0,1,.13,2.11c0,.29-.25.46-1.16,1.26a30.61,30.61,0,0,0-3.13,3A.89.89,0,0,1,60.34,36Z"/><path class="cls-1" d="M59.57,40.44h-9a3.11,3.11,0,0,1,0-6.22h9a3.11,3.11,0,1,1,0,6.22Zm-9-4.46a1.35,1.35,0,0,0,0,2.7h9a1.35,1.35,0,1,0,0-2.7Z"/><path class="cls-1" d="M67.7,66.28a8.6,8.6,0,0,1-1.36-.13,4.52,4.52,0,0,0-1.58-.06.9.9,0,0,1-1-.75.87.87,0,0,1,.74-1,6.28,6.28,0,0,1,2.13.06,4.89,4.89,0,0,0,1.86,0c.54-.09.91-.27,1-.48a1.62,1.62,0,0,0-.59-1.28c-1-1-1.33-4.2-1.79-9.73-.08-1-.17-2-.26-3-.44-4.75-7.68-9.63-7.75-9.68a.89.89,0,0,1-.25-1.22.88.88,0,0,1,1.22-.24c.33.22,8,5.39,8.53,11,.09,1,.18,2,.26,3,.28,3.36.66,8,1.28,8.63a3.18,3.18,0,0,1,1,3.06,2.62,2.62,0,0,1-2.37,1.67A6.24,6.24,0,0,1,67.7,66.28Z"/><path class="cls-1" d="M41.76,58.43h-.11a.89.89,0,0,1-.77-1c.16-1.39.29-3,.43-4.63.08-1,.16-2,.26-3,.51-5.58,8.2-10.75,8.53-11a.87.87,0,0,1,1.21.24.88.88,0,0,1-.24,1.22c-.07.05-7.31,4.93-7.75,9.68-.09,1-.18,2-.26,3-.14,1.68-.27,3.26-.43,4.68A.88.88,0,0,1,41.76,58.43Z"/><path class="cls-1" d="M57.73,80a2.9,2.9,0,0,1-.83-.1c-2.74-.83-16.55-1.09-21.64-1.11a.89.89,0,0,1-.87-.89.87.87,0,0,1,.88-.87h0c.76,0,18.59.11,22.15,1.19,1.68.5,10.54-2.81,22-8.28a.5.5,0,0,0,.19-.75,4.65,4.65,0,0,0-5.47-1.63L63.48,71.71a5.36,5.36,0,0,1-3.58.1L54.26,70a.88.88,0,0,1,.54-1.68l5.64,1.83a3.59,3.59,0,0,0,2.4-.07l10.71-4.18a6.42,6.42,0,0,1,7.54,2.24,2.26,2.26,0,0,1-.86,3.37C71.88,75.46,61.54,80,57.73,80Z"/><path class="cls-1" d="M61.45,70H45.7a.88.88,0,1,1,0-1.76H61.45a3.81,3.81,0,0,0-3.69-3.79A62,62,0,0,1,51.35,64,24.88,24.88,0,0,1,47,62.84a21.15,21.15,0,0,0-6.89-1.43c-4.11,0-9,5.45-9,5.51a.88.88,0,0,1-1.24.08.87.87,0,0,1-.08-1.24c.22-.25,5.41-6.11,10.32-6.11a22.66,22.66,0,0,1,7.45,1.53,25,25,0,0,0,4.07,1.11,58.24,58.24,0,0,0,6.2.43,5.54,5.54,0,0,1,5.38,5.56A1.74,1.74,0,0,1,61.45,70Z"/><path class="cls-1" d="M29.5,83.72a1,1,0,0,1-.33-.06.92.92,0,0,1-.48-.47L21.62,66.47a.89.89,0,0,1,.47-1.16l6.67-2.82a.87.87,0,0,1,1.15.47L37,79.68a.88.88,0,0,1-.46,1.15l-6.68,2.82A.77.77,0,0,1,29.5,83.72ZM23.58,66.59,30,81.69,35,79.55l-6.39-15.1Z"/><path class="cls-1" d="M79.6,26.34V61.53a.88.88,0,1,1-1.75,0V26.34a.88.88,0,1,1,1.75,0Z"/><path class="cls-1" d="M86.2,37.15a.88.88,0,0,1-1.63.46L78.72,28l-5.84,9.58a.88.88,0,0,1-1.51-.92L78,25.88a.89.89,0,0,1,1.51,0l6.59,10.81A.84.84,0,0,1,86.2,37.15Z"/></svg>`;
      break;
      case 'Purchase':
        icon = `<svg id="Layer_1" width="40" height="40" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110.4 106.37"><defs><style>.cls-1{fill:${this.selectedSymbolData.color};}</style></defs><title>icons_B</title><path class="cls-1" d="M55.59,103.75a50.26,50.26,0,1,1,50.26-50.26A50.31,50.31,0,0,1,55.59,103.75Zm0-98.52a48.26,48.26,0,1,0,48.26,48.26A48.32,48.32,0,0,0,55.59,5.23Z"/><path class="cls-1" d="M70.08,73.52V78.2l-3,2.87-3.5-3.36a1.65,1.65,0,0,0-2.3,0L57.8,81.07l-3.5-3.36a1.65,1.65,0,0,0-2.3,0l-3.51,3.36L45,77.71a1.65,1.65,0,0,0-2.3,0l-3.5,3.36-3.52-3.36a1.66,1.66,0,0,0-2.29,0l-1.86,1.78V24.73H61.79a8.27,8.27,0,0,1,7.78,5.53c.72-.07,1.44-.11,2.17-.11.44,0,.87,0,1.3.07a11.62,11.62,0,0,0-11.25-8.81H29.86a1.66,1.66,0,0,0-1.66,1.66v60.3a1.66,1.66,0,0,0,1,1.53,1.64,1.64,0,0,0,.65.13A1.68,1.68,0,0,0,31,84.57l3.51-3.37L38,84.57a1.67,1.67,0,0,0,2.3,0l3.5-3.37,3.51,3.37a1.65,1.65,0,0,0,2.29,0l3.51-3.37,3.5,3.37a1.65,1.65,0,0,0,2.3,0l3.49-3.36,3.5,3.36a1.65,1.65,0,0,0,2.3,0l4.65-4.47a1.67,1.67,0,0,0,.51-1.2V73.52c-.55,0-1.1.09-1.66.09S70.63,73.56,70.08,73.52Z"/><path class="cls-1" d="M37.14,56.2a1.66,1.66,0,0,0,1.65,1.66H50.86a23,23,0,0,1-.67-3.32H38.79A1.65,1.65,0,0,0,37.14,56.2Z"/><path class="cls-1" d="M38.79,48.55h7a1.66,1.66,0,1,0,0-3.32h-7a1.66,1.66,0,0,0,0,3.32Z"/><path class="cls-1" d="M38.79,67.16h7a1.66,1.66,0,1,0,0-3.32h-7a1.66,1.66,0,0,0,0,3.32Z"/><path class="cls-1" d="M50.8,65.5a1.66,1.66,0,0,0,1.66,1.66H56.3a21.58,21.58,0,0,1-2.69-3.32H52.46A1.66,1.66,0,0,0,50.8,65.5Z"/><path class="cls-1" d="M37.14,37.58a1.65,1.65,0,0,0,1.65,1.66h15.3A21.49,21.49,0,0,1,57,35.93H38.79A1.65,1.65,0,0,0,37.14,37.58Z"/><path class="cls-1" d="M72.86,50.09c-1.84-1-3-1.68-3-2.7a1.68,1.68,0,0,1,1.83-1.83,1.65,1.65,0,0,1-1.66-1.65v-1.4a4.93,4.93,0,0,0-3.49,4.88c0,3.07,2.6,4.48,4.69,5.61,1.84,1,3,1.68,3,2.7a2.5,2.5,0,0,1-2.49,2.49,1.66,1.66,0,0,1,1.66,1.66v1.39a5.81,5.81,0,0,0,4.15-5.54C77.55,52.64,75,51.22,72.86,50.09Z"/><path class="cls-1" d="M71.74,58.19a2.5,2.5,0,0,1-2.5-2.49,1.66,1.66,0,1,0-3.31,0,5.81,5.81,0,0,0,4.15,5.54V59.85A1.66,1.66,0,0,1,71.74,58.19Z"/><path class="cls-1" d="M71.74,45.56a1.75,1.75,0,0,1,1.83,1.83,1.66,1.66,0,0,0,3.32,0,5.08,5.08,0,0,0-3.49-4.87v1.39A1.65,1.65,0,0,1,71.74,45.56Z"/><path class="cls-1" d="M71.74,58.19a1.66,1.66,0,0,0-1.66,1.66v2.49a1.66,1.66,0,0,0,3.32,0V59.85A1.66,1.66,0,0,0,71.74,58.19Z"/><path class="cls-1" d="M71.74,45.56a1.65,1.65,0,0,0,1.66-1.65V41.42a1.66,1.66,0,0,0-3.32,0v2.49A1.65,1.65,0,0,0,71.74,45.56Z"/><path class="cls-1" d="M71.74,33.47A18.41,18.41,0,1,0,90.15,51.88,18.43,18.43,0,0,0,71.74,33.47Zm0,33.5A15.09,15.09,0,1,1,86.83,51.88,15.11,15.11,0,0,1,71.74,67Z"/></svg>`;
      break;
      case 'Refund':
         icon = `<svg id="Layer_1" width="40" height="40" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110.4 106.37"><defs><style>.cls-1{fill:${this.selectedSymbolData.color};}</style></defs><title>icons_B</title><path class="cls-1" d="M55.59,103.75a50.26,50.26,0,1,1,50.26-50.26A50.31,50.31,0,0,1,55.59,103.75Zm0-98.52a48.26,48.26,0,1,0,48.26,48.26A48.32,48.32,0,0,0,55.59,5.23Z"/><path class="cls-1" d="M70.08,73.52V78.2l-3,2.87-3.5-3.36a1.65,1.65,0,0,0-2.3,0L57.8,81.07l-3.5-3.36a1.65,1.65,0,0,0-2.3,0l-3.51,3.36L45,77.71a1.65,1.65,0,0,0-2.3,0l-3.5,3.36-3.52-3.36a1.66,1.66,0,0,0-2.29,0l-1.86,1.78V24.73H61.79a8.27,8.27,0,0,1,7.78,5.53c.72-.07,1.44-.11,2.17-.11.44,0,.87,0,1.3.07a11.62,11.62,0,0,0-11.25-8.81H29.86a1.66,1.66,0,0,0-1.66,1.66v60.3a1.66,1.66,0,0,0,1,1.53,1.64,1.64,0,0,0,.65.13A1.68,1.68,0,0,0,31,84.57l3.51-3.37L38,84.57a1.67,1.67,0,0,0,2.3,0l3.5-3.37,3.51,3.37a1.65,1.65,0,0,0,2.29,0l3.51-3.37,3.5,3.37a1.65,1.65,0,0,0,2.3,0l3.49-3.36,3.5,3.36a1.65,1.65,0,0,0,2.3,0l4.65-4.47a1.67,1.67,0,0,0,.51-1.2V73.52c-.55,0-1.1.09-1.66.09S70.63,73.56,70.08,73.52Z"/><path class="cls-1" d="M37.14,56.2a1.66,1.66,0,0,0,1.65,1.66H50.86a23,23,0,0,1-.67-3.32H38.79A1.65,1.65,0,0,0,37.14,56.2Z"/><path class="cls-1" d="M38.79,48.55h7a1.66,1.66,0,1,0,0-3.32h-7a1.66,1.66,0,0,0,0,3.32Z"/><path class="cls-1" d="M38.79,67.16h7a1.66,1.66,0,1,0,0-3.32h-7a1.66,1.66,0,0,0,0,3.32Z"/><path class="cls-1" d="M50.8,65.5a1.66,1.66,0,0,0,1.66,1.66H56.3a21.58,21.58,0,0,1-2.69-3.32H52.46A1.66,1.66,0,0,0,50.8,65.5Z"/><path class="cls-1" d="M37.14,37.58a1.65,1.65,0,0,0,1.65,1.66h15.3A21.49,21.49,0,0,1,57,35.93H38.79A1.65,1.65,0,0,0,37.14,37.58Z"/><path class="cls-1" d="M72.86,50.09c-1.84-1-3-1.68-3-2.7a1.68,1.68,0,0,1,1.83-1.83,1.65,1.65,0,0,1-1.66-1.65v-1.4a4.93,4.93,0,0,0-3.49,4.88c0,3.07,2.6,4.48,4.69,5.61,1.84,1,3,1.68,3,2.7a2.5,2.5,0,0,1-2.49,2.49,1.66,1.66,0,0,1,1.66,1.66v1.39a5.81,5.81,0,0,0,4.15-5.54C77.55,52.64,75,51.22,72.86,50.09Z"/><path class="cls-1" d="M71.74,58.19a2.5,2.5,0,0,1-2.5-2.49,1.66,1.66,0,1,0-3.31,0,5.81,5.81,0,0,0,4.15,5.54V59.85A1.66,1.66,0,0,1,71.74,58.19Z"/><path class="cls-1" d="M71.74,45.56a1.75,1.75,0,0,1,1.83,1.83,1.66,1.66,0,0,0,3.32,0,5.08,5.08,0,0,0-3.49-4.87v1.39A1.65,1.65,0,0,1,71.74,45.56Z"/><path class="cls-1" d="M71.74,58.19a1.66,1.66,0,0,0-1.66,1.66v2.49a1.66,1.66,0,0,0,3.32,0V59.85A1.66,1.66,0,0,0,71.74,58.19Z"/><path class="cls-1" d="M71.74,45.56a1.65,1.65,0,0,0,1.66-1.65V41.42a1.66,1.66,0,0,0-3.32,0v2.49A1.65,1.65,0,0,0,71.74,45.56Z"/><path class="cls-1" d="M71.74,33.47A18.41,18.41,0,1,0,90.15,51.88,18.43,18.43,0,0,0,71.74,33.47Zm0,33.5A15.09,15.09,0,1,1,86.83,51.88,15.11,15.11,0,0,1,71.74,67Z"/></svg>`;
      break;
      case 'Reward':
      case 'reward':
        icon = `<svg id="Layer_1" width="40" height="40" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110.4 106.37"><defs><style>.cls-1{fill:${this.selectedSymbolData.color};}</style></defs><title>Reward icon</title><path class="cls-1" d="M54.85,103.57a50.26,50.26,0,1,1,50.26-50.26A50.32,50.32,0,0,1,54.85,103.57Zm0-98.52a48.26,48.26,0,1,0,48.26,48.26A48.32,48.32,0,0,0,54.85,5.05Z"/><g id="Icon"><g id="Badge"><path class="cls-1" d="M80.72,78.78,73.36,57.69a4.68,4.68,0,0,0,2.13-1.77,6.09,6.09,0,0,0,.36-3.81,7.17,7.17,0,0,1,0-2.49,6.89,6.89,0,0,1,1.21-2A6.24,6.24,0,0,0,78.68,44a6.27,6.27,0,0,0-1.63-3.57,6.89,6.89,0,0,1-1.21-2,7.17,7.17,0,0,1,0-2.49,6.09,6.09,0,0,0-.36-3.81,6.14,6.14,0,0,0-3.15-2.23,7.14,7.14,0,0,1-2.13-1.21A6.94,6.94,0,0,1,69,26.52a6.24,6.24,0,0,0-2.24-3.16A6.22,6.22,0,0,0,63,23a7.14,7.14,0,0,1-2.48,0,7,7,0,0,1-2.06-1.22,6.21,6.21,0,0,0-3.57-1.63,6.21,6.21,0,0,0-3.56,1.63A7.11,7.11,0,0,1,49.23,23a7.19,7.19,0,0,1-2.49,0,6.19,6.19,0,0,0-3.8.36,6.12,6.12,0,0,0-2.24,3.16,7,7,0,0,1-1.21,2.12,7,7,0,0,1-2.12,1.21,6.16,6.16,0,0,0-3.16,2.23,6.16,6.16,0,0,0-.35,3.81,7.42,7.42,0,0,1,0,2.49,7,7,0,0,1-1.22,2A6.27,6.27,0,0,0,31,44a6.24,6.24,0,0,0,1.63,3.57,7,7,0,0,1,1.22,2,7.42,7.42,0,0,1,0,2.49,6.16,6.16,0,0,0,.35,3.81,4.72,4.72,0,0,0,2.14,1.77L29,78.78A2.27,2.27,0,0,0,29.39,81a2.24,2.24,0,0,0,2.11.76l6.32-1.09a.76.76,0,0,1,.69.25l4.27,4.78a2.22,2.22,0,0,0,1.67.76,2.3,2.3,0,0,0,.45,0,2.25,2.25,0,0,0,1.7-1.47l6.18-17.72a3.77,3.77,0,0,0,4.14,0l6.19,17.72A2.26,2.26,0,0,0,64.8,86.4a2.3,2.3,0,0,0,.45,0,2.24,2.24,0,0,0,1.68-.76l4.27-4.78a.75.75,0,0,1,.69-.25l6.32,1.09a2.25,2.25,0,0,0,2.51-3ZM45.17,84.44a.74.74,0,0,1-.56.49.76.76,0,0,1-.71-.24L39.63,79.9A2.25,2.25,0,0,0,38,79.15a2.56,2.56,0,0,0-.39,0l-6.32,1.09a.75.75,0,0,1-.7-.26.76.76,0,0,1-.14-.73l7.32-21a5.84,5.84,0,0,1,1.77,1,7,7,0,0,1,1.21,2.13,6.14,6.14,0,0,0,2.24,3.15,6.12,6.12,0,0,0,3.8.36,7.17,7.17,0,0,1,2.49,0,7.06,7.06,0,0,1,2.06,1.21l.2.15Zm7-19.45a7.93,7.93,0,0,0-2.56-1.46,5.37,5.37,0,0,0-1.33-.15,16.19,16.19,0,0,0-1.71.12,5.12,5.12,0,0,1-2.89-.16,5.2,5.2,0,0,1-1.61-2.45,8,8,0,0,0-1.52-2.6A8.46,8.46,0,0,0,38,56.77a5,5,0,0,1-2.45-1.61,5.06,5.06,0,0,1-.17-2.88,8.38,8.38,0,0,0,0-3,8.24,8.24,0,0,0-1.45-2.57A5.08,5.08,0,0,1,32.53,44a5.11,5.11,0,0,1,1.34-2.67,8.19,8.19,0,0,0,1.45-2.56,8.38,8.38,0,0,0,0-3,5.09,5.09,0,0,1,.17-2.89A5.07,5.07,0,0,1,38,31.23a8.46,8.46,0,0,0,2.59-1.52,8.08,8.08,0,0,0,1.52-2.59,5.1,5.1,0,0,1,1.61-2.45,5.11,5.11,0,0,1,2.89-.17,8.38,8.38,0,0,0,3,0A7.93,7.93,0,0,0,52.18,23a5.2,5.2,0,0,1,2.67-1.33A5.13,5.13,0,0,1,57.52,23a8.08,8.08,0,0,0,2.57,1.46,8.38,8.38,0,0,0,3,0,5.11,5.11,0,0,1,2.89.17,5,5,0,0,1,1.6,2.45,8.29,8.29,0,0,0,1.53,2.59,8.35,8.35,0,0,0,2.59,1.52,5.12,5.12,0,0,1,2.45,1.61,5,5,0,0,1,.16,2.89,8.38,8.38,0,0,0,0,3,8.22,8.22,0,0,0,1.46,2.56A5.11,5.11,0,0,1,77.18,44a5.08,5.08,0,0,1-1.34,2.67,8.27,8.27,0,0,0-1.46,2.57,8.38,8.38,0,0,0,0,3,5,5,0,0,1-.16,2.88,5.05,5.05,0,0,1-2.45,1.61,8.35,8.35,0,0,0-2.59,1.52,8.23,8.23,0,0,0-1.53,2.6A5.11,5.11,0,0,1,66,63.34a5.12,5.12,0,0,1-2.89.16,8.38,8.38,0,0,0-3,0A7.93,7.93,0,0,0,57.53,65a5.12,5.12,0,0,1-2.68,1.33A5.13,5.13,0,0,1,52.18,65Zm27,15a.77.77,0,0,1-.71.26l-6.32-1.09a2.28,2.28,0,0,0-2.07.72L65.8,84.69a.74.74,0,0,1-.7.24.77.77,0,0,1-.57-.49L58.22,66.35l.2-.15A6.93,6.93,0,0,1,60.48,65,7.11,7.11,0,0,1,63,65a6.14,6.14,0,0,0,3.81-.36A6.26,6.26,0,0,0,69,61.49a7,7,0,0,1,1.2-2.13,6,6,0,0,1,1.77-1l7.32,21A.74.74,0,0,1,79.17,80Z"/><path class="cls-1" d="M71.57,44A16.72,16.72,0,1,0,54.85,60.72,16.73,16.73,0,0,0,71.57,44ZM54.85,59.21A15.21,15.21,0,1,1,70.06,44,15.23,15.23,0,0,1,54.85,59.21Z"/></g><path id="Star" class="cls-1" d="M63.76,39.65,59,39a.4.4,0,0,1-.3-.22l-2.13-4.32a1.91,1.91,0,0,0-3.42,0L51,38.74a.4.4,0,0,1-.3.22l-4.77.69A1.87,1.87,0,0,0,44.41,41a1.89,1.89,0,0,0,.48,1.95l3.45,3.36a.39.39,0,0,1,.11.35l-.81,4.75a1.91,1.91,0,0,0,.76,1.87,1.88,1.88,0,0,0,2,.14l4.27-2.24a.4.4,0,0,1,.37,0l4.26,2.24a1.89,1.89,0,0,0,.89.22,1.9,1.9,0,0,0,1.88-2.23l-.82-4.75a.39.39,0,0,1,.12-.35l3.45-3.36a1.91,1.91,0,0,0-1.06-3.25Zm0,2.17-3.45,3.36a1.9,1.9,0,0,0-.55,1.69l.81,4.75a.39.39,0,0,1-.16.39A.4.4,0,0,1,60,52L55.74,49.8a1.86,1.86,0,0,0-.89-.22,1.82,1.82,0,0,0-.88.22L49.7,52a.4.4,0,0,1-.42,0,.41.41,0,0,1-.16-.39l.82-4.75a1.93,1.93,0,0,0-.55-1.69l-3.45-3.36a.4.4,0,0,1-.1-.41.38.38,0,0,1,.32-.27l4.77-.69a1.88,1.88,0,0,0,1.43-1.05l2.13-4.32a.39.39,0,0,1,.36-.22.39.39,0,0,1,.36.22l2.13,4.32a1.91,1.91,0,0,0,1.44,1.05l4.76.69a.4.4,0,0,1,.23.68Z"/></g></svg>`;
      break;
    }
    return this._sanitizer.bypassSecurityTrustHtml(icon);
  }
}
