import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {Register} from '../models/register.model'
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

    user: Register;
    constructor(private http: HttpClient, private myRoute: Router) {
    }

    register (user: Register) {
        return this.http.post(environment.baseUrl + '/v3/user/signup', JSON.stringify(user));
    }

    login(user: any) {
        return this.http.post(environment.baseUrl + '/v3/user/login', JSON.stringify(user));
    }

	getCountries() {
		return this.http.get(environment.baseUrl + '/location/countries');
	}

	getCountriesLocal() {
		return this.http.get('/assets/countries.json');
	}

 	getStates(country: string) {
		return this.http.get(environment.baseUrl + '/location/states/' + country);
	}
	
	logout() {
   	  return this.http.get(environment.baseUrl + '/user/logout');
  }

	loginCode(username: string , session: string , code: string, type: string) {
		const obj = {
			session,
			username,
			code,
			type
		}
		return this.http.post(environment.baseUrl + '/v3/user/login/code', obj);
	}

	isConfirmationSuccess(username: string, code: string) {
	    const obj = {
	    	username,
	    	code,
	    }
		return this.http.post(environment.baseUrl + '/user/signup/verify', obj);

	}

	resendCode(data: any) {
		return this.http.post(environment.baseUrl + '/user/signup/confirm', data);
	}

	password(username: string ) {
		const obj = {
			username,
		}
		return this.http.post(environment.baseUrl + '/v3/user/password', obj);
	}

	passwordUpdated(username: string , code: string , password: string) {
		const obj = {
			username ,
			code,
			password,
		}
		return this.http.post(environment.baseUrl + '/v3/user/password/confirm', obj);
	}

	Signup (data: any) {
		return this.http.post(environment.baseUrl + '/user/signup', data);
	}

	signupCodeVerification(data: any) {
		return this.http.post(environment.baseUrl + '/user/signup/verify', data);
	}

	public isAuthenticated(): boolean {
		if (localStorage.accessToken && localStorage.fullVerified) {
            return true;
        }
        return false;
    }
}
