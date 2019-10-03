import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  getUser() {
    return this.http.get(environment.baseUrl + '/user');
  }

  updateUser(data: any) {
    return this.http.put(environment.baseUrl + '/user/update', data);
  }
}
