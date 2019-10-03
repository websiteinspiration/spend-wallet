import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CardService {

  constructor(private http: HttpClient) { }

  cards() {
    return this.http.get(environment.baseUrl + '/cards');
  }

  getCards() {
    return this.http.get(environment.baseUrl + '/v3/card');
  }

  getTransctions() {
    return this.http.get(environment.baseUrl + '/v3/transaction');
  }

  changePin(data: any) {
    return this.http.post(environment.baseUrl + '/v3/card/pin', data);
  }

  activateCard(data: any) {
    return this.http.post(environment.baseUrl + '/card/activate', data);
  }

  changeStatus(san: boolean, data: any) {
    return this.http.put(environment.baseUrl + '/v3/card/status/' + san, data);
  }

  issueCard(data: any) {
    return this.http.post(environment.baseUrl + '/card/issue', data);
  }

  createPin(data: any) {
    return this.http.post(environment.baseUrl + '/card/pin/create', data);
  }

  getCardTransactions(id) {
    return this.http.get(environment.baseUrl + '/card/transaction/' + id);
  }
}
