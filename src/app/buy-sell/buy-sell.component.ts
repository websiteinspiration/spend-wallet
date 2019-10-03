import { Component, OnInit, HostListener, ViewChild, Renderer2, OnDestroy, AfterViewInit } from '@angular/core';
import { WalletService } from '../apis/wallet.service';
import { Wallet } from '../models/wallet.model';
import { SymbolService } from '../apis/symbol.service';
import { Symbol } from '../models/symbol.model';
import { ActivatedRoute } from '@angular/router';
import { UtilService } from '../services/util.service';
import * as d3 from 'd3';
import { ExchangeService } from '../apis/exchange.service';
import { BankService } from '../apis/bank.service';
import { ExchangeModalComponent } from '../exchange-modal/exchange-modal.component';
import swal2 from 'sweetalert2';
import * as $ from 'jquery';

@Component({
  selector: 'app-buy-sell',
  templateUrl: './buy-sell.component.html',
  styleUrls: ['./buy-sell.component.scss']
})
export class BuySellComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('exchangeModal') exchangeModal: ExchangeModalComponent;

  flow: any = {
    account: undefined,
    flow: undefined,
    format: undefined,
    id: undefined,
    services: undefined
  };
  headerColor = '';
  quote: any;
  from_amount: string;
  rates: any = {};
  wallets: Wallet[] = [];
  symbols: Symbol[] = [];
  usdAmount = '';
  symbolAmount = '';
  isSubmitted = false;
  selectedSymbol: string;
  paymentOption: string = undefined;
  selectedOption = 'sell';
  receivceSymbolData: Wallet;
  selectedSymbolMarketData: any;
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

  slideConfig = {'slidesToShow': 10, 'slidesToScroll': 10};

  constructor(
    private route: ActivatedRoute,
    private renderer: Renderer2,
    public utilService: UtilService,
    private walletService: WalletService,
    private symbolService: SymbolService,
    private bankService: BankService,
    private exchangeService: ExchangeService,
  ) { }

  @HostListener('window:resize', ['$event'])
  onresize() {
    if (this.selectedSymbolMarketData.price) {
      this.loadChart();
    }
  }

  ngOnInit(): void {
    if (window.innerWidth > 768) {
      this.slideConfig = {
        slidesToShow: parseInt(((window.innerWidth - 100) / 160).toFixed()),
        slidesToScroll: parseInt(((window.innerWidth - 100) / 160).toFixed())
      };
    } else {
      this.slideConfig = {
        slidesToShow: parseInt(((window.innerWidth - 100) / 65).toFixed()),
        slidesToScroll: parseInt(((window.innerWidth - 100) / 65).toFixed())
      };
    }
    this.wallets = this.walletService.wallets;
    this.receivceSymbolData = this.wallets.find(s => s.symbol === 'USD');
    this.rates = this.exchangeService.rates;
    this.symbols = this.symbolSort(this.symbolService.symbols).filter(symbol => symbol.type !== 'currency' && this.rates[symbol.symbol]);
    this.selectSymbol(this.route.snapshot.data.defaults.symbol, null);
    this.exchangeService.currentRate.subscribe(r => {
      this.rates = r;
      if (this.selectedOption === 'sell') {
        this.onSymbolAmount(null);
      } else {
        this.onUsdAmount(null);
      }
    });
    this.symbolService.symbolChange$.subscribe(symbols => {
      this.symbols = this.symbolSort(symbols).filter(symbol => symbol.type !== 'currency' && this.rates[symbol.symbol]);
      this.selectSymbol(this.selectedSymbolData, null);
    });
    this.walletService.walletChange$.subscribe(wallets => {
      this.selectedWalletData = wallets.find(s => s['symbol'] === this.selectedSymbol);
      this.wallets = wallets;
    });
    this.loadFlow();
  }

  ngAfterViewInit() {
    this.hideArrow();
  }

  loadFlow(): void {
    this.bankService.flow().subscribe(
      (data: any) => {
        this.flow = data;
      },
      (error: any) => {
      }
    );
  }

  symbolSort(symbols): any {
    const sortSymbol = symbols.sort((a, b) => {
      if (a['type'] > b['type']) {
        return -1;
      }
      return 1;
    });
    return sortSymbol;
  }

  selectSymbol(symbol, event): void {
    if (symbol.type === 'blockchain') {
      this.selectedSymbol = symbol.symbol;
      this.selectedSymbolData = this.symbols.find(s => s.symbol === symbol.symbol);
      this.selectedWalletData = this.walletService.wallets.find(s1 => s1['symbol'] === symbol.symbol);
    } else if (symbol.type === 'currency') {
      this.receivceSymbolData = this.walletService.wallets.find(wallet => wallet.symbol === symbol.symbol);
    }
    if (this.selectedOption === 'sell') {
      this.onSymbolAmount(null);
    } else {
      this.onUsdAmount(null);
    }
    this.headerColor = this.selectedSymbolData.color;
    this.loadMarketData();
  }

  loadChart(): void {
    const chartDiv = d3.select('#chart-area');
    if (this.selectedSymbolMarketData && chartDiv.node()) {
      let prices = this.selectedSymbolMarketData.price;
      chartDiv.selectAll('*').remove();
      const margin = { top: 10, right: 10, bottom: 10, left: 10 };
      const width = chartDiv.node().getBoundingClientRect().width;
      const height = chartDiv.node().getBoundingClientRect().height;
      const svg = chartDiv.append('svg')
        .attr('width', width - margin.left - margin.right)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${0}, ${0})`);
      prices = prices.map(price => {
        return {
          amount: price.amount * 1,
          date: new Date(price.date)
        };
      });
      const xLine = d3.scaleTime().range([margin.left, width - margin.right]);
      const yLine = d3.scaleLinear().range([height - margin.bottom, margin.top]);

      const valueline = d3.line()
        .x(d => xLine(d.date))
        .y(d => yLine(d.amount));

      xLine.domain(d3.extent(prices, price => price.date));
      yLine.domain([d3.min(prices, price => price.amount), d3.max(prices, price => price.amount)]);

      svg.append('path')
        .data([prices])
        .attr('class', 'buy-sell-line')
        .attr('d', valueline);

      const points = svg.selectAll('circle.point1').data(prices);

      points.enter().append('circle')
        .merge(points)
        .attr('class', 'buy-sell-point1')
        .attr('cx', d => xLine(d.date))
        .attr('cy', d => yLine(d.amount))
        .attr('r', () => 5);
    }
  }

  loadMarketData(): void {
    this.utilService.showLoading.next(true);
    this.symbolService.getMarketData(this.selectedSymbolData.symbol, 'hours', 25, 1)
      .subscribe(
        (data: any) => {
          this.utilService.showLoading.next(false);
          this.selectedSymbolMarketData = data;
          if (this.selectedSymbolMarketData.price) {
            this.loadChart();
          }
        },
        (error: any) => {
          this.utilService.showLoading.next(false);
        }
      );
  }

  onOptions(value): void {
    this.selectedOption = value.id;
  }

  getExchangeRate(): string {
    let rate;
    if (this.receivceSymbolData && this.rates && this.rates[this.selectedSymbolData.symbol]
      && this.rates[this.receivceSymbolData.symbol]) {
      rate = (this.rates[this.selectedSymbolData.symbol].price / this.rates[this.receivceSymbolData.symbol].price).toFixed(5);
    }
    return rate;
  }

  symbolToUsd() {
    let value = '';
    const exchangeRate = this.getExchangeRate();
    if (exchangeRate && parseFloat(this.symbolAmount)) {
      const rate = parseFloat(exchangeRate);
      const amount = parseFloat(this.symbolAmount);
      if (amount && rate) {
        value = parseFloat((amount * rate).toFixed(5)).toString();
      }
    }
    return value;
  }

  usdToSymbol(): string {
    let rate;
    let value = '';
    if (this.rates && this.receivceSymbolData && this.selectedSymbolData
        && this.rates[this.selectedSymbolData.symbol] && this.rates[this.receivceSymbolData.symbol]) {
      rate = (this.rates[this.receivceSymbolData.symbol].price / this.rates[this.selectedSymbolData.symbol].price);
    }
    const amount = parseFloat(this.usdAmount);
    if (amount && rate) {
      value = parseFloat((amount * rate).toFixed(5)).toString();
    }
    return value;
  }

  onSymbolAmount(event): void {
    if (event) {
      this.symbolAmount = event.target.value;
    }
    this.usdAmount = this.symbolToUsd();
  }

  onUsdAmount(event): void {
    if (event) {
      this.usdAmount = event.target.value;
    }
    this.symbolAmount = this.usdToSymbol();
  }

  onPaymentOption(id): void {
    this.paymentOption = id;
  }

  onBuySell(): void {

    if (this.receivceSymbolData && this.selectedSymbolData && this.rates
        && this.rates[this.selectedWalletData.symbol] && this.rates[this.receivceSymbolData.symbol]) {
      let obj;
      this.isSubmitted = true;
      if (this.selectedOption === 'buy' && this.symbolAmount) {
        this.from_amount = this.usdAmount;
        obj = {
          from_exchange_id: this.rates[this.receivceSymbolData.symbol].exchange_id,
          to_exchange_id: this.rates[this.selectedWalletData.symbol].exchange_id,
          from_quantity: parseFloat(this.usdAmount),
        };
        if (this.flow.account && this.paymentOption !== 'usd') {
          obj['account_id'] = this.getAccountId();
          obj['service_id'] = this.getServiceId();
        }
      } else if (this.selectedOption === 'sell') {
        this.from_amount = this.symbolAmount;
        obj = {
          from_exchange_id: this.rates[this.selectedWalletData.symbol].exchange_id,
          to_exchange_id: this.rates[this.receivceSymbolData.symbol].exchange_id,
          from_quantity: parseFloat(this.symbolAmount),
        };
        if (this.flow.account && this.paymentOption !== 'usd') {
          obj['account_id'] = this.getAccountId();
          obj['service_id'] = this.getServiceId();
        }
      }
      this.exchangeService.quote(obj).subscribe(
        (data: any) => {
          if (data.success) {
            this.quote = data.data;
            this.exchangeModal.openModal();
          } else {
            swal('Error', 'This operation can not be done at this time, try again late', 'error');
          }
          this.isSubmitted = false;
        },
        (error: any) => {
          this.isSubmitted = false;
        }
      );
    } else {
      swal('Error', 'This operation can not be done at this time, try again late', 'error');
    }

  }

  getAccountId(): number {
    return this.flow.account.id;
  }

  getServiceId(): number {
    return this.flow.services.filter(service => service.name === this.paymentOption)[0].id;
  }

  onExchangeDone(msg): void {
    this.displayAlert(msg);
  }

  displayAlert(type): void {
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
        confirmButtonClass: 'btn btn-primary btn-sm pl-5 pr-5'
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
        confirmButtonClass: 'btn btn-primary btn-sm pl-5 pr-5'
      });
    }
  }

  ngOnDestroy(): void {
    this.walletService.stopInterval();
    this.symbolService.stopInterval();
    this.exchangeService.stopInterval();
  }

  slickInit(e) {
  }

  breakpoint(e) {
  }

  afterChange(e) {
  }

  beforeChange(e) {
  }

  showArrow() {
    $('.carousel .slick-arrow').show();
  }

  hideArrow() {
    $('.carousel .slick-arrow').hide();
  }
}
