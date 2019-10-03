import {API} from './baseAPI';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Wallet} from '../models/wallet.model';
import {Address} from '../models/address.model';
import {map, retry, tap} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {CompareHelper} from '../helper/compare';

@Injectable()
export class WalletService extends API {

  constructor(http: HttpClient) {
    super(http);
  }

  _wallets: Wallet[];

  private walletChange = new Subject<Wallet[]>();
  walletChange$ = this.walletChange.asObservable();

  public get wallets() {
    return this._wallets;
  }


  wallerUrl = 'wallet';

  wallet() {
    const that = this;
    return this.get<Wallet>(this.wallerUrl)
      .pipe(
        retry(3),
        tap(
          s => {
            if (!CompareHelper.compare(s, that._wallets)) {
              that.walletChange.next(s);
            }
            return s;
          }
        ),
        tap(s => that._wallets = s)
      )
      ;
  }

  address(symbol: string) {
    return this.getOne<Address>(`${this.wallerUrl}/address/${symbol}`);
  }

  withdraw(symbol: string, address: string, amount: number) {
    return this.post(`${this.wallerUrl}/withdraw/${symbol}`, {address, amount});
  }

  toggleDefault(symbol, isDefault) {
    return this.put(`${this.wallerUrl}/${symbol}`, {isDefault});
  }

  onTimeInterval() {
    return this.checkForErrors(this.wallet());
  }

}
