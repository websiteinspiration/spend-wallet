import { Component, OnInit, Renderer2, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { Router } from '@angular/router';

@Component({
  selector: 'app-loan',
  templateUrl: './loan.component.html',
  styleUrls: ['./loan.component.scss'],
  providers: [BsModalRef, BsModalService]
})
export class LoanComponent implements OnInit, OnDestroy {
  verified = true;
  bodyEl: any;
  @ViewChild('template') template;
  @ViewChild('template1') template1;
  step = 1;
  step3Title = 'Where have you lived back in 2017?';
  step3Loading = false;
  step3Step = 1;
  step3Verified = true;
  page = 'loans';
  selectedItem = 0;
  payoff = false;
  showSelectList = false;

  constructor(
    private renderer: Renderer2,
    private elRef: ElementRef,
    private modalRef: BsModalRef,
    private modalService: BsModalService,
    private router: Router
  ) {
    this.bodyEl = this.elRef.nativeElement.ownerDocument.body;
    this.loadBackground();
  }

  ngOnInit() {
    if (!this.verified) {
      this.modalRef = this.modalService.show(this.template, {ignoreBackdropClick: true});
    }
  }

  loadBackground() {
    this.renderer.setAttribute(this.bodyEl, 'background', '/assets/images/card-setting-background.png');
  }

  ngOnDestroy() {
    this.renderer.removeAttribute(this.bodyEl, 'background');
  }

  closeModal() {
    this.modalRef.hide();
    this.router.navigate(['/portfolio']);
  }

  verify() {
    this.modalRef.hide();
  }

  goStep2() {
    this.step = 2;
  }

  goStep3() {
    this.step = 3;
  }

  submitStep3() {
    this.step3Title = 'Processing Application';
    this.step3Loading = true;
    this.step3Step = 2;
    setTimeout(() => {
      this.step3Loading = false;
      this.step3Step = 3;
      if (this.step3Verified) {
        this.step3Title = 'Application Approved';
      } else {
        this.step3Title = 'Application Declined';
      }
    }, 3000);
  }

  goStep3Next() {
    this.step = 4;
  }

  goApply() {
    this.page = 'apply';
    this.step = 1;
    this.step3Title = 'Where have you lived back in 2017?';
    this.step3Step = 1;
  }

  finishApply() {
    this.page = 'loans';
  }

  selectItem(position) {
    this.selectedItem = position;
  }

  showCurrentModal() {
    this.modalRef = this.modalService.show(this.template1);
  }

  pay() {
    this.modalRef.hide();
    this.payoff = true;
  }

  completePayoff() {
    this.payoff = false;
    this.page = 'loans';
    this.showSelectList = false;
  }

  showList() {
    this.showSelectList = !this.showSelectList;
  }
}
