import {Component, OnInit, ViewChild} from '@angular/core';
import {BsModalRef} from 'ngx-bootstrap/modal/bs-modal-ref.service';
import {BsModalService} from 'ngx-bootstrap/modal';
import {AlertService} from '../services/alert.service';
import {UserService} from '../apis/user.service';

@Component({
  selector: 'app-google-auth-modal',
  templateUrl: './google-auth-modal.component.html',
  styleUrls: ['./google-auth-modal.component.css']
})
export class GoogleAuthModalComponent implements OnInit {

  @ViewChild('template')
  template;

  isSubmitted: boolean = false;
  modalRef: BsModalRef;
  model: any;
  step = 1;
  qrcodePng: string;
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

  openModal() {
    this.step = 1;
    this.model = {};

    this.modalService.config.ignoreBackdropClick = true;
    this.modalRef = this.modalService.show(this.template);
    return this.modalService.onHide;
  }

  moveToConfirmStep() {
    this.userService.softwareToken()
      .subscribe(r => {
        this.qrcodePng = r['data']['qrcodePng'];
        this.step = 2;
      }, (error1: any) => {
        this.alertService.error(error1.error.error[0].message || error1.statusText);
      });
  }

  moveToCodeStep() {
    this.step = 3;
  }

  moveToEnd() {
    if (!this.isSubmitted) {
      this.isSubmitted = true;
      this.userService.softwareTokenVerify(this.model.code2fa.split('·').join(''))
        .subscribe(r => {
          if (r['success']) {
            this.step = 4;
          } else {
            this.alertService.error(r['error'][0]['message']);
          }
          this.isSubmitted = false;
        }, (error1: any) => {
          this.isSubmitted = false;
          this.alertService.error(error1.error.error[0].message || error1.statusText);
        });
    }
  }
}
