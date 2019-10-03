import {API} from './baseAPI';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {User} from '../models/user.model';
import {tap} from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';


@Injectable()
export class UserService extends API {

  constructor(http: HttpClient) {
    super(http);
    this._user = localStorage.getItem('user') !== 'undefined' ? JSON.parse(localStorage.getItem('user')) as User : null;
  }

  _user: User;
  private userSource = new BehaviorSubject(this._user);
  public currentuser = this.userSource.asObservable();

  me() {
    return this.getOne<User>('user')
      .pipe(tap((r: any) => {
        this.setCurrentUser(r);
      }));
  }

  public get currentUser(): User {
    return this._user;
  }

  private setCurrentUser(u: User) {
    localStorage.setItem('user', JSON.stringify(u));
    this._user = u;
  }

  update(obj) {
    return this.put('user/update', obj)
      .pipe(tap((r: any) => {
        if (r.success) {
          this.setCurrentUser(r.data);
        }
      }));
  }

  updateEmail(email: string) {
    return this.update({email});
  }

  updatePassword(oldPassword, newPassword) {
    return this.update({oldPassword, newPassword});
  }

  verifyPhone(code) {
    return this.post('user/verify/phone', {code});
  }

  verifyEmail(code) {
    return this.post('user/verify/Email', {code});
  }

  softwareToken() {
    return this.post('user/softwareToken', null);
  }

  softwareTokenVerify(code) {
    return this.post('user/softwareToken/verify', {code});
  }

  updateLocal(user) {
    this.setCurrentUser(user);
    this.userSource.next(user);
  }

  userDocs(data: any, type: any) {
    return this.post('user/docs', {type, data});
  }
}
