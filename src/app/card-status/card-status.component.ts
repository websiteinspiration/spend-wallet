import { Component, OnInit, Renderer2, ElementRef, OnDestroy } from '@angular/core';
import { CardService } from '../services/card.service';
import { UtilService } from '../services/util.service';

@Component({
  selector: 'app-card-status',
  templateUrl: './card-status.component.html',
  styleUrls: ['./card-status.component.scss']
})
export class CardStatusComponent implements OnInit, OnDestroy {
  bodyEl: any;
  card = null;

  constructor(
    private renderer: Renderer2,
    private elRef: ElementRef,
    private cardService: CardService,
    private utilService: UtilService
  ) { }

  ngOnInit() {
    this.bodyEl = this.elRef.nativeElement.ownerDocument.body;
    this.loadBackground();
    this.loadCards();
  }

  loadCards() {
    this.card = JSON.parse(localStorage.getItem('selected-card'));
  }

  loadBackground() {
    this.renderer.setAttribute(this.bodyEl, 'background', '/assets/images/card-setting-background.png');
  }

  ngOnDestroy() {
    this.renderer.removeAttribute(this.bodyEl, 'background');
  }
}
