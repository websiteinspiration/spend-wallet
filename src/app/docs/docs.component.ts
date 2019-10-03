import { Component, OnInit, Renderer2, ElementRef, OnDestroy } from '@angular/core';
import { UtilService } from '../services/util.service';

@Component({
  selector: 'app-docs',
  templateUrl: './docs.component.html',
  styleUrls: ['./docs.component.scss']
})
export class DocsComponent implements OnInit, OnDestroy {

  links: any;
  bodyEl: any;
  constructor(
    private elRef: ElementRef,
    private renderer: Renderer2,
    private utilService: UtilService
  ) {
    this.bodyEl = this.elRef.nativeElement.ownerDocument.body;
  }

  ngOnInit() {
    this.loadBackground();
    this.loadDocs();
  }

  loadDocs() {
    this.utilService.showLoading.next(true);
    this.utilService.getApiVersions()
      .subscribe(
        (data: any) => {
          this.utilService.showLoading.next(false);
          if (data.success) {
            this.links = data.data.links;
          }
        },
        (error: any) => {
          this.utilService.showLoading.next(false);
        }
      );
  }

  loadBackground() {
    this.renderer.setAttribute(this.bodyEl, 'background', '/assets/images/card-setting-background.png');
  }

  ngOnDestroy() {
    this.renderer.removeStyle(this.bodyEl, 'background-color');
    this.renderer.removeAttribute(this.bodyEl, 'background');
  }
}
