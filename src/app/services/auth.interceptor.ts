import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router, private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if( request.url.indexOf('countries') > 0 ||
        request.url.indexOf('states') > 0 ||
        request.url.indexOf('signup') > 0 
      ) {
      request = request.clone({
        setHeaders: {
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'Content-Type' : 'application/json'
        }
      });
    } else{
      request = request.clone({
        setHeaders: {
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'Content-Type' : 'application/json',
          'Authorization' : `${this.getAuthToken()}`
        }
      });
    }

    return next.handle(request).pipe(tap((event:HttpEvent<any>) => {
      if(event instanceof HttpResponse) {
        // log that event successfully intercepted
      }
    },
    (err: any) => {
      if(err instanceof HttpErrorResponse) {
        if(err.status === 401) {
          // remove token from localStorage and do proper sign out.
          // redirect user to login page.
            localStorage.clear();
            this.router.navigate(['signin']);
        }
      }
    }));
  }

  private getAuthToken() {
    return localStorage.accessToken;
  }
}
