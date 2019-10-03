import {API} from './baseAPI';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Transaction} from '../models/transaction.model';
import {environment} from '../../environments/environment';
import {retry, tap} from 'rxjs/operators';
import * as _ from 'lodash';

@Injectable()
export class TransactionService extends API {

  constructor(http: HttpClient) {
    super(http);
    this.onTimeInterval();
  }

  urlSegment = 'transaction';
  _transaction: any = {};

  get transactions() {
    return this._transaction;
  }

  BySymbol(limit: number, page: number) {
    return this.get<Transaction>(`${this.urlSegment}BySymbol?limit=${limit}&page=${page}`);
  }

  list(symbol: string, page: number, limit: number) {
    if (!symbol) {
      symbol = environment.defaultSymbol;
    }
    return this.getOne<Transaction>(`${this.urlSegment}?limit=${limit}&page=${page}&symbol=${symbol}`)
      .pipe(
        retry(3),
        tap(data => {
            this._transaction[symbol] = this._transaction[symbol] || [];
            this._transaction[symbol] = _.uniqBy(page === 1 ?
              data['transactions'].concat(this._transaction[symbol]) :
              this._transaction[symbol].concat(data['transactions']),
              (a) => a['id'])
            ;
            return this._transaction;
          }
        ));
  }

  getTransactions(symbol: string, page: number, limit: number) {
    if (!symbol) {
      symbol = environment.defaultSymbol;
    }
    return this.getOne<Transaction>(`${this.urlSegment}?limit=${limit}&page=${page}&symbol=${symbol}`);
  }

  onTimeInterval() {
    return this.checkForErrors(this.list(localStorage.getItem('selectedSymbol') || environment.defaultSymbol, 1, 20));
  }
}
