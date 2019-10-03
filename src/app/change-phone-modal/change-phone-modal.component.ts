import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {BsModalService} from 'ngx-bootstrap/modal';
import {AlertService} from '../services/alert.service';
import {UserService} from '../apis/user.service';
import {BsModalRef} from 'ngx-bootstrap/modal/bs-modal-ref.service';

@Component({
  selector: 'app-change-phone-modal',
  templateUrl: './change-phone-modal.component.html',
  styleUrls: ['./change-phone-modal.component.css']
})
export class ChangePhoneModalComponent implements OnInit {

  @ViewChild('template')
  template;

  @Input()
  oldPhone: string;

  modalRef: BsModalRef;
  model: any;
  step = 1;

  mask = [
    /[A-Za-z0-9]/, '·', /[A-Za-z0-9]/, '·',
    /[A-Za-z0-9]/, '·', /[A-Za-z0-9]/, '·',
    /[A-Za-z0-9]/, '·', /[A-Za-z0-9]/
  ];

  constructor(private modalService: BsModalService,
              private alertService: AlertService,
              private userService: UserService) {
  }


  ngOnInit() {
  }


  openModal(resend) {
    this.step = resend ? 2 : 1;
    this.model = {newPhone: resend ? this.oldPhone : '', code2fa: ''};
    const that = this;
    this.modalService.config.ignoreBackdropClick = true;
    that.modalRef = this.modalService.show(that.template);
    return this.modalService.onHide;
  }

  moveToConfirmStep() {
    if (this.model.newPhone) {
      this.step = 2;
    } else {
      this.alertService.error('Please enter you new phone number!');
    }
  }

  moveTo2FAStep() {
    this.userService.update({
      phone: '+' + this.model.newPhone,
    })
      .subscribe((r: any) => {
        if (r.success) {
          this.step = 3;
        } else {
          this.alertService.error(r.error[0].message);
        }
      }, (error1: any) => {
        this.alertService.error(error1.error.errors[0].message || error1.statusText);
      });
  }

  moveToEnd() {
    if (this.model.code2fa) {
      this.userService.verifyPhone(this.model.code2fa.split('·').join(''))
        .subscribe(r => {
          this.model.code2fa = '';
          this.step = 4;
        }, (error1: any) => {
          this.alertService.error(error1.error.errors[0].message || error1.statusText);
        });

    } else {
      this.alertService.error('Please enter the code for your 2FA!');
    }

  }

}
