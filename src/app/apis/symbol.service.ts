import {API} from './baseAPI';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, retry, tap} from 'rxjs/operators';
import {CompareHelper} from '../helper/compare';
import {Subject} from 'rxjs';
import {Symbol} from '../models/symbol.model';

@Injectable()
export class SymbolService extends API {

  constructor(http: HttpClient) {
    super(http);
  }

  private symbolChange = new Subject<Symbol[]>();
  symbolChange$ = this.symbolChange.asObservable();


  _symbols: Symbol[] = [];

  public get symbols() {
    return this._symbols;
  }

  symbol() {
    const that = this;
    return this.get<Symbol>('symbol')
      .pipe(
        retry(3),
        map(r => r.filter(x => x.status)),
        tap(
          s => {
            if (!CompareHelper.compare(s, that._symbols)) {
              that.symbolChange.next(s);
            }
            return s;
          }
        ),
        tap(s => that._symbols = s)
      )
      ;
  }

  onTimeInterval() {
    return this.checkForErrors(this.symbol());
  }

  getMarketData(symbol: string, period: string, periodFactor: number, interval: number) {
    if (period && periodFactor) {
      return this.get(`marketData?symbol=${symbol}&period=${period}&periodFactor=${periodFactor}&interval=${interval}`);
    }
      return this.get(`marketData?symbol=${symbol}`);
  }

}
