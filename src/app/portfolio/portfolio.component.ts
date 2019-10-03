import { Component, OnInit, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { SwPush, SwUpdate } from '@angular/service-worker';
import { WalletService } from '../services/wallet.service';
import { UtilService } from '../services/util.service';
import { Router } from '@angular/router';
import { Wallet } from '../models/wallet.model';
import { AlertService } from '../services/alert.service';
import { PushNotificationService } from '../services/push-notification.service';
import {environment} from '../../environments/environment';
import * as d3 from 'd3';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss']
})
export class PortfolioComponent implements OnInit, OnDestroy {

  wallets: any = [];
  displayWallets: any = [];
  marketData: any = [];
  highestBalance: number = null;
  portfolioAge = 0;
  currencyChange = 0.00;
  totalAssets: number = null;
  assetNumber: number = null;
  showMore = true;
  minGain = 0.00;
  maxGain = 0.00;
  bodyEl: any = undefined;

  constructor(
    public walletService: WalletService,
    public utilService: UtilService,
    private elRef: ElementRef,
    private router: Router,
    private renderer: Renderer2,
    private swUpdate: SwUpdate,
    public alertService: AlertService,
    private pnService: PushNotificationService,
    private swPush: SwPush
  ) {
    this.bodyEl = this.elRef.nativeElement.ownerDocument.body;
    this.loadBackground();
    this.utilService.showLoading.next(true);
    this.walletService.wallet()
      .subscribe(
        (data: any) => {
          this.utilService.showLoading.next(false);
          if (data.success) {
            this.wallets = data.data;
            this.displayWallets = this.wallets.slice(0, 5);
            this.calcAssetsTotal();
            this.loadChart();
            this.loadMarketData();
            this.calculateInformation();
          }
        },
        (error: any) => {
          this.utilService.showLoading.next(false);
        }
      );
  }

  ngOnInit() {
    if (this.swUpdate.isEnabled) {
      this.swPush.requestSubscription({serverPublicKey: environment.pushKey })
        .then((response: PushSubscription) => {
          this.pnService.addPushSubscriber(response.endpoint)
            .subscribe(r => {
            });
        })
        .catch(error => {
        });
      this.swUpdate.available.subscribe((evt) => {
      });

      this.swUpdate.checkForUpdate().then(() => {
        // noop
      }).catch((err) => {
      });
    } else {
    }
  }

  loadBackground() {
    this.renderer.setAttribute(this.bodyEl, 'background', '/assets/images/card-setting-background.png');
  }

  loadChart() {
    const chartDiv = d3.select('#chart-area');
    const width = chartDiv.node().getBoundingClientRect().width -  40;
    const height = width;
    const radius = Math.min(width, height) / 2;
    const color = d3.scaleOrdinal(this.wallets.map(wallet => wallet.symbolData.color));
    const pie = d3.pie()
        .sort(null)
        .value(d => {
          const percentage = ( (d.balanceCurrency / this.totalAssets) * 100 );
          if (percentage < 1 && d.balanceCurrency > 0) {
            return 1;
          }
          return percentage;
        });

    const arc = d3.arc()
                    .padAngle(0.01)
                    .outerRadius(radius)
                    .innerRadius(radius - 4);
    const hiddenArc = d3.arc()
        .padAngle(0.01)
        .outerRadius(radius)
        .innerRadius(0);
    const svg = chartDiv.append('svg')
                          .attr('width', width)
                          .attr('height', height)
                          .style('transform', 'translate(8%,7%)')
                        .append('g')
                          .attr('transform', `translate(${width / 2}, ${height / 2})`);
    const tooltip = d3.select('#chart-area')
                        .append('div')
                          .attr('class', 'graph-tooltip');
    tooltip.append('div')
      .attr('class', 'total');
    tooltip.append('div')
      .attr('class', 'symbol');

    const path = svg.selectAll('path')
      .data(pie(this.wallets));

    path.enter().append('path')
      .attr('fill', (d, i) => color(i))
      .attr('d', arc);
    path.enter().append('path')
      .attr('fill', 'transparent')
      .attr('d', hiddenArc)
      .on('mouseover', (d, i, c) => {
        d3.select(c[i]).style('cursor', 'pointer');
        tooltip.select('.total').html(`${d.data.balanceCurrencyFormatted}`).style('color', 'black');
        tooltip.select('.symbol').html(d.data.symbol.toUpperCase());
        tooltip.style('display', 'block');
        tooltip.style('opacity', 1);
      })
      .on('mousemove', (d, i, c) => {
        const x = Math.cos(d.startAngle + (d.endAngle - d.startAngle) / 2 - 1.57) * radius;
        let y = Math.sin(d.startAngle + (d.endAngle - d.startAngle) / 2 - 1.57) * radius;
        if (((d.startAngle + (d.endAngle - d.startAngle) / 2 - 1.57 >= 3.14)
        && (d.startAngle + (d.endAngle - d.startAngle) / 2 - 1.57 <= 4.71))
        || (d.startAngle + (d.endAngle - d.startAngle) / 2 - 1.57 < 0)) {
          y = y - 65;
        }
        tooltip
        .style('top', y + 150 + 'px')
        .style('left', x + 150 + 'px');
      })
      .on('mouseout', (d, i, c) => {
        tooltip.style('display', 'none');
        tooltip.style('opacity', 0);
      });
  }

  formattedAmount(labelValue) {
    // Nine Zeroes for Billions
    return Math.abs(Number(labelValue)) >= 1.0e+9

    ? ( Math.abs(Number(labelValue)) / 1.0e+9 ).toFixed(2) + 'B'
    // Six Zeroes for Millions
    : Math.abs(Number(labelValue)) >= 1.0e+6

    ? ( Math.abs(Number(labelValue)) / 1.0e+6 ).toFixed(2) + 'M'
    // Three Zeroes for Thousands
    : Math.abs(Number(labelValue)) >= 1.0e+3

    ? ( Math.abs(Number(labelValue)) / 1.0e+3 ).toFixed(2) + 'K'

    : (Math.abs(Number(labelValue))).toFixed(2);
  }

  loadMarketData() {
    this.walletService.marketData()
      .subscribe(
        (data: any) => {
          if (data.success) {
            this.marketData = data.data;
          } else {
          }
        },
        (error: any) => {
        }
      );
  }

  calculateInformation() {
    const data = this.wallets;
    this.calcPortfolioAge();
    this.calcRateChange();
    this.calcAssetGain();
  }

  /* Assuming top transaction is the lastest one and get age difference in days */
  calcPortfolioAge() {
    this.walletService.transaction()
      .subscribe(
        (data: any) => {
          if (data.success) {
            const transactions = data.data.transactions;
            if (transactions.length > 0) {
              const lastDate = new Date(transactions[0].dateTime);
              const currentDate = new Date();
              const timeDiff = Math.abs(currentDate.getTime() - lastDate.getTime());
              const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
              this.portfolioAge = isNaN(diffDays) ? 0 : diffDays;
            } else {
              this.portfolioAge = 0;
            }
           } else {
          }
        },
        (error: any) => {
        }
      );
  }

  calcRateChange() {
    this.walletService.marketData()
      .subscribe(
        (data: any) => {
          if (data.success) {
            const prices = data.data.price;
            let currentHourSum = 0;
            let lastHourSum = 0;
            const assetsMap = {};
            const assets = [];
            prices.forEach(price => {
              const date = new Date (new Date(price.date).setSeconds(0)).toUTCString();
              if (assetsMap[date]) {
                assetsMap[date].data.push(price);
              } else {
                assetsMap[date] = {
                  data: []
                };
                assetsMap[date].data.push(price);
              }
            });
            for (const asset of Object.keys(assetsMap)) {
              const obj = {
                date: asset,
                data: assetsMap[asset]
              };
              assets.push(obj);
            }

            /* Current Hour */
            assets[0].data.data.forEach(price => {
              currentHourSum += parseFloat(price.amount);
            });

            /* Last Hour  */
            assets[assets.length - 1].data.data.forEach(price => {
              lastHourSum += parseFloat(price.amount);
            });
            this.currencyChange = (currentHourSum - lastHourSum);
          } else {
          }
        },
        (error: any) => {
        }
      );
  }

  calcAssetsTotal() {
    this.wallets.forEach(wallet => this.totalAssets += wallet.balanceCurrency);
    this.assetNumber = this.wallets.filter(el => el.balanceCurrency !== 0 ).length;
  }

  calcAssetGain() {
    this.walletService.marketData()
    .subscribe(
      (data: any) => {
        if (data.success) {
          const prices = data.data.price;
          const assetsMap = {};
          prices.forEach(price => {
            if (assetsMap[price.symbol]) {
              assetsMap[price.symbol].data.push(price);
            } else {
              assetsMap[price.symbol] = {
                data: []
              };
              assetsMap[price.symbol].data.push(price);
            }
          });
          let assetGains = [];
          let assetLoss = [];
          for (const asset of Object.keys(assetsMap)) {
            const assetData = assetsMap[asset].data;
            /* Getting difference b/w latest & oldest hour for asset */
            const symbol = assetData[0].symbol;
            const firstHourVal = parseFloat(assetData[assetData.length - 1].amount);
            const latestHourVal = parseFloat(assetData[0].amount);
            const gain = ( latestHourVal - firstHourVal );
            const loss = ( firstHourVal - latestHourVal );
            const gainPercentage = ( gain / firstHourVal );
            const lossPercentage = ( loss / firstHourVal );
            assetGains.push({gain, gainPercentage, symbol});
            assetLoss.push({loss, lossPercentage, symbol});
          }
          assetGains = assetGains.sort((a, b) => a.gain - b.gain);
          assetLoss = assetLoss.sort((a, b) => a.lossPercentage - b.lossPercentage);
          this.minGain = assetGains[0].gain.toFixed(2);
          this.maxGain = assetGains[assetGains.length - 1].gain.toFixed(2);
        } else {
        }
      },
      (error: any) => {
      }
    );
  }

  portfolioPercentage(balance) {
    return  ( (balance / this.totalAssets) * 100 ).toFixed(5) ;
  }

  onShowMore() {
    this.showMore = false;
    this.displayWallets = this.wallets;
  }

  onShowLess() {
    this.showMore = true;
    this.displayWallets = this.wallets.slice(0, 5);
  }

  onWalletSelect(wallet: Wallet) {
    this.router.navigate(['main-asset'], {queryParams: {symbol: wallet.symbol}});
  }

  ngOnDestroy() {
    this.renderer.removeAttribute(this.bodyEl, 'background');
    this.renderer.removeStyle(this.bodyEl, 'background-color');
  }
}
