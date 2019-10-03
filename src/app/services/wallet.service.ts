import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WalletService {

  constructor(private http: HttpClient) { }

  wallet() {
    return this.http.get(environment.baseUrl + '/wallet');
  }

  transaction() {
    return this.http.get(environment.baseUrl + '/transaction');
  }
  marketData() {
    return this.http.get(environment.baseUrl + '/marketData');
  }
}
