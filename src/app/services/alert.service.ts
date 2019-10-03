import {Injectable} from '@angular/core';

interface Alert {
  type: string;
  msg: string;
  timeout: number;
}

@Injectable({providedIn: 'root'})
export class AlertService {

  public alerts: Alert[] = [
  ];

  push(type: string, msg: string) {
    this.alerts.push({type: type, msg: msg, timeout: 5000});
  }

  success(msg) {
    this.push('success', msg);
  }

  info(msg) {
    this.push('info', msg);
  }

  error(msg) {
    this.push('error', msg);
  }

  constructor() {
  }
}
