import { Component, OnInit, Renderer2, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  providers: [BsModalRef, BsModalService]
})
export class ReportsComponent implements OnInit, OnDestroy {
  bodyEl: any;
  @ViewChild('template') template;
  reports = [
    {
      icon: 'assets/images/dash.png',
      account: 'BTC Wallet',
      type: 'Transaction history',
      repeats: 'Never',
      status: 'Completed',
      last: 'Dec, 02, 2018 - 1:23PM',
      next: '-',
      download: ''
    },
    {
      icon: 'assets/images/dash.png',
      account: 'BTC Wallet',
      type: 'Transaction history',
      repeats: 'Never',
      status: 'Completed',
      last: 'Dec, 02, 2018 - 1:23PM',
      next: '-',
      download: ''
    },
    {
      icon: 'assets/images/dash.png',
      account: 'BTC Wallet',
      type: 'Transaction history',
      repeats: 'Never',
      status: 'Completed',
      last: 'Dec, 02, 2018 - 1:23PM',
      next: '-',
      download: ''
    },
    {
      icon: 'assets/images/dash.png',
      account: 'BTC Wallet',
      type: 'Transaction history',
      repeats: 'Never',
      status: 'Completed',
      last: 'Dec, 02, 2018 - 1:23PM',
      next: '-',
      download: ''
    },
    {
      icon: 'assets/images/dash.png',
      account: 'BTC Wallet',
      type: 'Transaction history',
      repeats: 'Never',
      status: 'Completed',
      last: 'Dec, 02, 2018 - 1:23PM',
      next: '-',
      download: ''
    },
    {
      icon: 'assets/images/dash.png',
      account: 'BTC Wallet',
      type: 'Transaction history',
      repeats: 'Never',
      status: 'Completed',
      last: 'Dec, 02, 2018 - 1:23PM',
      next: '-',
      download: ''
    },
  ];

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

  }

  loadBackground() {
    this.renderer.setAttribute(this.bodyEl, 'background', '/assets/images/card-setting-background.png');
  }

  ngOnDestroy() {
    this.renderer.removeAttribute(this.bodyEl, 'background');
  }

  openModal() {
    this.modalRef = this.modalService.show(this.template, {ignoreBackdropClick: true});
  }

  closeModal() {
    this.modalRef.hide();
  }
}
