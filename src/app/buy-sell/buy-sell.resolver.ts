import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { SymbolService } from '../apis/symbol.service';
import { WalletService } from '../apis/wallet.service';
import { environment } from '../../environments/environment';
import { ExchangeService } from '../apis/exchange.service';
import { UtilService } from '../services/util.service';

@Injectable()
export class BuySellResolver implements Resolve<Event> {
  constructor(
    private walletService: WalletService,
    private symbolService: SymbolService,
    private exchangeService: ExchangeService,
    private utilService: UtilService
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Event> | Promise<Event> | Event | any {
    this.walletService.startInterval();
    this.symbolService.startInterval();
    this.exchangeService.startInterval();
    const defaultSymbol = environment.defaultSymbol;
    this.utilService.showLoading.next(true);
    return forkJoin(
      this.walletService.wallet(),
      this.symbolService.symbol(),
      this.exchangeService.rate()
    ).toPromise()
      .then(res => {
        this.utilService.showLoading.next(false);
        return {
          wallet: res[0].find(s => s['symbol'] === defaultSymbol),
          symbol: res[1].find(s => s['symbol'] === defaultSymbol),
          ticker: res[2]
        };
      })
      .catch(err => {
        this.utilService.showLoading.next(false);
        return {
          wallet: [],
          symbol: [],
          ticker: []
        };
      });
  }
}
