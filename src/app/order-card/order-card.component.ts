import { Component, OnInit, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { CardService } from '../services/card.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilService } from '../services/util.service';

@Component({
  selector: 'app-order-card',
  templateUrl: './order-card.component.html',
  styleUrls: ['./order-card.component.scss']
})
export class OrderCardComponent implements OnInit, OnDestroy {

  cards: any = undefined;
  bodyEl: ElementRef;
  selectedCardId: any = undefined;
  cardDetails = [
    {
      fee: `25`,
      amount: `0`,
      color: `#197df8`,
      image: `/assets/images/order-card/spend_simple.png`,
      description: `Spend Simple™ gives users access to our platform and all the great features we offer. Upgrades are always available to Spend Preferred™ and Spend Black™.`
    },
    {
      fee: `50`,
      amount: `20,000`,
      color: `#c4c4c4`,
      image: `/assets/images/order-card/spend_preferred.png`,
      description: `Spend Preferred™  grants users a flexible spending limit for use as an everyday card with access to our Spend VIP Program and enhanced rewards.`
    },
    {
      fee: `500`,
      amount: `150,000`,
      color: `#000000`,
      image: `/assets/images/order-card/spend_black.png`,
      description: `With an optional sleek metal design*, Spend Black™ cardholders receive access to our highest spending limits, highest rewards, and Spend VIP Elite Program.`
    }
  ];

  selectedCard = null;
  selectedIndex = 0;
  showOrderDialog = false;

  constructor(
    private elRef: ElementRef,
    private route: ActivatedRoute,
    private renderer: Renderer2,
    private cardService: CardService,
    private utilService: UtilService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.bodyEl = this.elRef.nativeElement.ownerDocument.body;
    this.cards = this.route.snapshot.data.defaults.cards;
    this.loadBackground();
    this.loadCards();
  }

  loadBackground(): void {
    this.renderer.setStyle(this.bodyEl, 'background-size', 'cover');
    this.renderer.setStyle(this.bodyEl, 'background-repeat', 'no-repeat');
    this.renderer.setStyle(this.bodyEl, 'background-color', 'white');
    this.renderer.setAttribute(this.bodyEl, 'background', '/assets/images/White_background.jpg');
  }

  loadCards(): void {
    this.cardService.cards().subscribe(
      (data: any) => {
        if (data.success) {
          this.cards = data.data;
        }
      },
      (error: any) => {
      }
    );
  }

  getDailyLimit(card): string {
    let limit = '0';
    if (card) {
      let dailyLimit = card.details.filter(detail => detail.type === 'dailyLimit')[0];
      if (dailyLimit) {
        limit = dailyLimit.detail;
      } else {
        dailyLimit = card.details.filter(detail => detail.detail === 'Daily Limit')[0];
        if (dailyLimit) {
          limit = dailyLimit.title;
        }
      }
    }
    return limit;
  }

  checkIfHasSymbol(val) {
    return val.indexOf('$') > -1;
  }

  onCard(id): void {
    this.selectedCardId = id;
  }

  onOrder(card, index): void {
    localStorage.setItem('selected-card', JSON.stringify(card));
    this.selectedIndex = index;
    this.selectedCard = card;
    this.showOrderDialog = true;
  }

  ngOnDestroy(): void {
    this.renderer.removeAttribute(this.bodyEl, 'background');
    this.renderer.removeStyle(this.bodyEl, 'background-size');
    this.renderer.removeStyle(this.bodyEl, 'background-position-y');
    this.renderer.removeStyle(this.bodyEl, 'background-color');
    this.renderer.removeStyle(this.bodyEl, 'background-repeat');
  }

  getImage(images) {
    return images[0] && images[0].image;
  }

  getCapitalize(str) {
    return str.replace(/\b\w/g, l => l.toUpperCase());
  }

  close() {
    this.showOrderDialog = false;
  }

  next() {
    this.showOrderDialog = false;
    this.renderer.setStyle(this.bodyEl, 'overflow', 'hidden');
    this.utilService.showLoading.next(true);
    this.cardService.issueCard({
      virtual: true,
      cardId: this.selectedCard.id
    }).subscribe((res: any) => {
      this.utilService.showLoading.next(false);
      this.renderer.setStyle(this.bodyEl, 'overflow', 'auto');
      if (res.success) {
        this.router.navigate(['/card/status']);
      } else {
        swal('Error', res.error[0] && res.error[0].message, 'error');
      }
    }, err => {
      this.utilService.showLoading.next(false);
      this.renderer.setStyle(this.bodyEl, 'overflow', 'auto');
      swal('Error', err.message, 'error');
    });
  }
}
