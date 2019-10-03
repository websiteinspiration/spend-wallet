import { API } from './baseAPI';
import { Subject, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, retry, tap } from 'rxjs/operators';
import { CompareHelper } from '../helper/compare';

@Injectable()
export class ExchangeService extends API {
  _rates: any = undefined;
  tickerUrl = 'exchange/tickers';
  quoteUrl = 'exchange/quote';
  private rateSource = new BehaviorSubject(this._rates);
  public currentRate = this.rateSource.asObservable();

  constructor(http: HttpClient) {
    super(http);
  }

  public get rates() {
    return this._rates;
  }

  rate() {
    const that = this;
    return this.get<any>(this.tickerUrl)
      .pipe(
        retry(3),
        tap((response: any) => that.setRate(response))
      );
  }

  setRate(response: any) {
    this._rates = response;
    this.rateSource.next(response);
  }

  quote(data: any) {
    return this.post<any>(this.quoteUrl, data);
  }

  quoteConfirm(id) {
    return this.post<any>(`${this.quoteUrl}/${id}/confirm`, {});
  }

  onTimeInterval() {
    return this.checkForErrors(this.rate());
  }

}