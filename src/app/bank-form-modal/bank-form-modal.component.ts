import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { AlertService } from '../services/alert.service';
import { BankService } from '../apis/bank.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-bank-form-modal',
  templateUrl: './bank-form-modal.component.html',
  styleUrls: ['./bank-form-modal.component.scss']
})
export class BankFormModalComponent implements OnInit {
  @ViewChild('accountForm') accountForm: NgForm;
  @ViewChild('template') template;
  @Input() flow: any;
  @Output() submitted: EventEmitter<boolean> = new EventEmitter();

  account: any = {};
  modalRef: BsModalRef;
  isSubmitted = false;

  constructor(
    private bankService: BankService,
    private alertService: AlertService,
    private modalService: BsModalService,
  ) { }

  ngOnInit() {
  }

  openModal() {
    this.modalRef = this.modalService.show(this.template);
  }

  getType(type) {
    let inputType = 'text';
    switch (type) {
      case 'string':
        inputType = 'text';
        break;
    }
    return inputType;
  }

  onSubmit(accountForm) {
    const data = accountForm.value;
    if (accountForm.valid) {
      this.isSubmitted = true;
      this.bankService.createAccount(this.flow.id, data)
        .subscribe(
          (data: any) => {
            accountForm.reset();
            this.isSubmitted = false;
            if (data.success) {
              this.alertService.success('Bank account linked');
              this.submitted.emit(true);
            } else {
              this.alertService.error(data.error[0].message);
              this.submitted.emit(false);
            }
            this.modalRef.hide();
          },
          (error: any) => {
            accountForm.reset();
            this.isSubmitted = false;
            this.modalRef.hide();
          }
        );
    } else {
      // TODO: error message
    }
  }

}
