import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {Router} from '@angular/router';
import { UserService } from '../apis/user.service';
import { User } from '../models/user.model';
import { UtilService } from '../services/util.service';

@Component({
  selector: 'app-upper-menu',
  templateUrl: './upper-menu.component.html',
  styleUrls: ['./upper-menu.component.scss']
})
export class UpperMenuComponent implements OnInit {
  isCollapsed = true;
  user: User = {
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    zipcode: '',
    country: '',
    city: '',
    tierLevel: 0,
    state: '',
    address: '',
    birthdate: '',
    address2: '',
    phoneVerified: false,
    mfa: false,
    softwareMfa: false,
    trackingAddresses: [],
    availableMfa: [],
    last_login_at: '',
    last_login_ip: '',
    avatar: '/assets/images/user-icon.jpg'
  };
  @Input()
  public toggle = undefined;
  @Output()
  public toggleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService,
    private utilService: UtilService
  ) {
  }


  ngOnInit() {
    this.user = this.userService.currentUser;
    this.userService.currentuser.subscribe(user => {
      if (user) {
        this.user = user;
      }
    });
  }

  toggleMenu() {
    this.toggle = !this.toggle;
    this.toggleChange.emit(this.toggle);
  }

  logout() {
    this.utilService.showLoading.next(true);
    this.authService.logout()
      .subscribe(r => {
        this.utilService.showLoading.next(false);
        localStorage.clear();
        this.router.navigate(['signin']);
      }, error1 => {
        this.utilService.showLoading.next(false);
        localStorage.clear();
        this.router.navigate(['signin']);
      });
  }

}
