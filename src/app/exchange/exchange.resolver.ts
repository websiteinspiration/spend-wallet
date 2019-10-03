import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { ExchangeService } from '../apis/exchange.service';
import { WalletService } from '../apis/wallet.service';
import { UtilService } from '../services/util.service';

@Injectable()
export class ExchangeResolver implements Resolve<Event> {

  constructor(
    private exchangeService: ExchangeService,
    private walletService: WalletService,
    private utilService: UtilService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Event> | Promise<Event> | Event | any {
    this.walletService.startInterval();
    this.exchangeService.startInterval();
    this.utilService.showLoading.next(true);

    return forkJoin(
      this.walletService.wallet(),
      this.exchangeService.rate(),
      this.utilService.getApiVersions()
    ).toPromise()
      .then(x => {
        this.utilService.showLoading.next(false);
        return {
          wallets: x[0],
          rates: x[1]
        };
      }).catch(err => {
        this.utilService.showLoading.next(false);
        return {
          wallets: this.walletService.wallets,
          rates: this.exchangeService._rates
        };
      });
  }
}
