import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { UtilService } from './util.service';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {

  constructor(
    private http: HttpClient,
    private utilService: UtilService
  ) { }

  addPushSubscriber(token: string) {
    const obj = {
      token,
      service: this.utilService.getPushServiceType()
    };

    return this.http.post(environment.baseUrl + '/notification/device', obj);
  }

}
