import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  defaultSymbolIcon = '/assets/images/default-icon.png';
  showLoading = new BehaviorSubject(false);

  constructor(private http: HttpClient) { }

  getApiVersions() {
    const data = {
      environment: environment.title,
      version: environment.version
    };
    return this.http.post(environment.baseUrl + '/versions', data);
  }

  getAlerts() {
    return this.http.get('/assets/alerts.json');
  }

  getColorIcon(symbol) {
    let imagePath = this.defaultSymbolIcon;
    if (symbol && symbol.images.length > 0) {
      const colorImage = symbol.images.filter(el => el.type === 'colored')[0];
      const defaultImage = symbol.images.filter(el => el.type === 'default')[0];
      if (colorImage) {
        imagePath = colorImage.path;
      } else if (defaultImage) {
        imagePath = defaultImage.path;
      }
    }
    return imagePath;
  }

  getDefaultIcon(symbol) {
    let imagePath = this.defaultSymbolIcon;
    if (symbol) {
      const colorImage = symbol.images.filter(el => el.type === 'colored')[0];
      const defaultImage = symbol.images.filter(el => el.type === 'default')[0];
      if (defaultImage) {
        imagePath = defaultImage.path;
      } else if (colorImage) {
        imagePath = colorImage.path;
      }
    }
    return imagePath;
  }

  getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  postRequest(url: string, data) {
    return this.http.post(environment.rootUrl + url, data);
  }

  getPushServiceType() {
    if (navigator.userAgent.match(/Android/i)) {
      return 'gcm';
    }
    if ( navigator.userAgent.match(/iPhone/i)
      || navigator.userAgent.match(/iPad/i)
      || navigator.userAgent.match(/iPod/i)) {
      return 'apns';
    }
    return 'msie';
  }

}
