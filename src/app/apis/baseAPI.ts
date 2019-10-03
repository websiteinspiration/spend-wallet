/**
 * Created by iAboShosha on 7/13/17.
 */
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';


@Injectable()
export class API {
  protected baseUrl = environment.baseUrl;
  private timeInterval = undefined;
  constructor(private http: HttpClient) {
  }

  /*
  * Get http method
  * reruns array of the Type T
  * inputs apiUrl part of the url after the base url
  * qs : query string
  * */
  get<T>(apiUrl: string, qs?: string): Observable<T[]> {
    return this.http
      .get(`${this.baseUrl}/${apiUrl}${qs ? '?' + qs : ''}`)
      .pipe(
        map(res => {
          if (res && res['success'] === false && !environment.production) {
            throw new Error(res['error'][0]['message']);
          }
          return (res as { data }).data;
        }),
        catchError((err: HttpErrorResponse) => {
          if (!environment.production) {
            throw new Error(err.statusText);
          }
          return null;
        })
      );
  }

  /*
  * Get http method
  * reruns one object of Type T
  * inputs apiUrl part of the url after the base url
  * qs : query string
  * */
  getOne<T>(apiUrl: string, qs?: string): Observable<T> {
    return this.http
      .get(`${this.baseUrl}/${apiUrl}${qs ? '?' + qs : ''}`)
      .pipe(
        map(res => {
          if (res && res['success'] === false && !environment.production) {
            throw new Error(res['error'][0]['message'] || res['errors'][0]['message']);
          }
          return (res as { data }).data;
        }),
        catchError((err: HttpErrorResponse) => {
          if (!environment.production) {
            throw new Error(err.message);
          }
          return null;
        })
      );
  }

  /*
  * POST http method
  * reruns one object of Type T
  * inputs apiUrl part of the url after the base url
  * data : data that will be send throw the body
  * */
  post<T>(apiUrl: string, data: any) {
    return this.http
      .post<T>(`${this.baseUrl}/${apiUrl}`, data);
  }

  /*
   * PUT http method
   * reruns one object of Type T
   * inputs apiUrl part of the url after the base url
   * data : data that will be send throw the body
   * */
  put<T>(apiUrl: string, data: any) {
    return this.http
      .put<T>(`${this.baseUrl}/${apiUrl}`, data);
  }

  delete<T>(apiUrl: string) {
    return this.http
      .delete(`${this.baseUrl}/${apiUrl}`);
  }

  /*
 * onTimeInterval event
 * to be implemented in the sub classes
 * */
  protected onTimeInterval(): Subject<Boolean> | Observable<Boolean> {
    return Observable.create(true);
  }

  /*
  * time interval service
  * it will be executed basedon the environment setting `interval`*/
  startInterval() {
    const that = this;
    this.timeInterval = setTimeout(function () {
      that.onTimeInterval().subscribe(_continue => {
        if (_continue) {
          that.startInterval();
        } else {
        }
      }, err => {
        that.startInterval();
      });
    }, environment.interval);
    return this.timeInterval;
  }

  /*
  * time interval service
  * it will stop time interval started in startInterval()*/
  stopInterval() {
    clearTimeout(this.timeInterval);
  }

  checkForErrors(x: Observable<any>): Observable<boolean> {
    return new Observable<boolean>(observer => {
      const h = x.subscribe(
        c => {
          observer.next(true);
          observer.complete();

        },
        error1 => {
          observer.next(error1.status < 400 || error1.status >= 500);
          observer.complete();
        }, () => h.unsubscribe());
    });
  }

}

