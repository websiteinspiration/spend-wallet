import { Component, OnInit, Renderer2, ElementRef } from '@angular/core';
import { AlertService } from './services/alert.service';
import { UtilService } from './services/util.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  bodyEl: any;
  showLoading = false;

  constructor(
    public alertService: AlertService,
    private renderer: Renderer2,
    private elRef: ElementRef,
    private utilService: UtilService
  ) {
    this.bodyEl = this.elRef.nativeElement.ownerDocument.body;
  }

  ngOnInit() {
    this.utilService.showLoading.subscribe(res => {
      if (res) {
        this.showLoading = true;
        this.renderer.setStyle(this.bodyEl, 'overflow', 'hidden');
      } else {
        this.showLoading = false;
        this.renderer.setStyle(this.bodyEl, 'overflow', 'auto');
      }
    });
  }
}
