import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Injectable} from '@angular/core';
import {WalletService} from '../apis/wallet.service';
import {SymbolService} from '../apis/symbol.service';
import {forkJoin, Observable} from 'rxjs';
import {TransactionService} from '../apis/transaction.service';
import {environment} from '../../environments/environment';
import { UtilService } from '../services/util.service';


@Injectable()
export class WalletResolver implements Resolve<Event> {

  constructor(
    private walletService: WalletService,
    private symbolService: SymbolService,
    private transactionService: TransactionService,
    private utilService: UtilService
  ) {
  }


  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Event> | Promise<Event> | Event | any {
    this.walletService.startInterval();
    this.utilService.showLoading.next(true);
    if (route.url[0].path !== 'main-asset') {
      this.transactionService.startInterval();
    }
    let defaultSymbol = localStorage.getItem('selectedSymbol') || environment.defaultSymbol;
    if (route.queryParams['symbol']) {
      defaultSymbol = route.queryParams['symbol'];
    }
    return forkJoin(
      this.walletService.wallet(),
      this.symbolService.symbol()
    ).toPromise()
      .then(x => {
        this.utilService.showLoading.next(false);
        return {
          wallet: x[0].find(s => s['symbol'] === defaultSymbol),
          symbol: x[1].find(s => s['symbol'] === defaultSymbol),
        };
      }).catch(err => {
        this.utilService.showLoading.next(false);
      });
  }
}
