import { API } from './baseAPI';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class BankService extends API {

  accountUrl = 'account';
  flowUrl = 'account/flow';
  plaidConfigUrl = 'integration/plaid/app';
  createAccountUrl = 'account';
  depositUrl = 'disbursement/deposit';
  withDrawUrl = 'disbursement/withdraw';

  constructor(http: HttpClient) {
    super(http);
  }

  flow() {
    return this.getOne<any>(this.flowUrl);
  }

  account() {
    return this.getOne<any>(this.accountUrl);
  }

  plaidConfig() {
    return this.getOne<any>(this.plaidConfigUrl);
  }

  createAccount(id, data) {
    return this.post(`${this.createAccountUrl}/${id}/create`, data);
  }

  deleteAccount(id) {
    return this.delete(`account/${id}`);
  }

  withDraw(data) {
    return this.post(`${this.withDrawUrl}`, data);
  }

  deposit(data) {
    return this.post(`${this.depositUrl}`, data);
  }

}
