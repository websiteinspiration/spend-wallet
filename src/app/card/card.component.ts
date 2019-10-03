import { Component, OnInit, ViewChild, ElementRef, Renderer2, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CardService } from '../services/card.service';
import swal from 'sweetalert';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit, OnDestroy {
  bodyEl: any = undefined;
  cards: Array<any> = [];
  transactions: Array<any> = [];
  selectedCard: any = null;
  imgSrc: string = null;
  userName: string = null;
  referenceValue: string = null;
  lockingCard = false;
  availableCredit = '$25,000';
  loadPage = false;

  constructor(
    private cardService: CardService,
    private elRef: ElementRef,
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.bodyEl = this.elRef.nativeElement.ownerDocument.body;
    if (this.route.snapshot.data.defaults.cards && this.route.snapshot.data.defaults.cards.data &&
      this.route.snapshot.data.defaults.cards.data.cards.length > 0) {
      this.cards = this.route.snapshot.data.defaults.cards.data.cards;
      if (!this.selectedCard) {
        this.selectCard(this.cards[0]);
      } else {
        this.getColor(this.selectedCard.reference);
      }
      this.loadBackground();
      const user = JSON.parse(localStorage.getItem('user'));
      this.userName = `${user.firstName} ${user.lastName}`;
      this.loadPage = true;
    } else {
      this.router.navigate(['card/order']);
    }
  }

  ngOnInit() {
  }

  loadBackground() {
    this.renderer.setAttribute(this.bodyEl, 'background', '/assets/images/card-setting-background.png');
  }

  changePin() {
    if (this.selectedCard) {
      localStorage.setItem('Selected_Card', JSON.stringify(this.selectedCard));
      this.router.navigate(['/activate/card/1']);
    } else {
      swal('Error', 'No card selected', 'error');
    }
  }

  lockCard() {
    if (!this.lockingCard) {
      this.lockingCard = true;
      this.cardService.changeStatus(this.selectedCard.reference, { locked: !this.selectedCard.locked })
        .subscribe(
          (data: any) => {
            if (data.success) {
              this.selectedCard.locked = !this.selectedCard.locked;
              const status = this.selectedCard.locked ? 'Locked' : 'Unlocked';
              swal('Success', `Card ${status}`, 'success');
              this.loadCards()
                .then(() => {
                  this.lockingCard = false;
                });
            } else {
              swal('Error', data.error[0].message, 'error');
              this.lockingCard = false;
            }
          },
          (error: any) => {
          }
        );
    }
  }

  activateCard() {
    this.cardService.activateCard({ reference: parseInt(this.referenceValue) })
      .subscribe(
        (data: any) => {
          this.referenceValue = null;
          if (data.success) {
            swal('Success', 'Card activated', 'success');
            this.loadCards();
          } else {
            swal('Error', data.error[0].message, 'error');
          }
        },
        (error: any) => {

        }
      );
  }

  cancelactivateCard() {
    this.referenceValue = null;
  }

  addVirtualCard() {
    this.cardService.issueCard({ virtual: true, cardId: 40 })
      .subscribe(
        (data: any) => {
          if (data.success) {
            swal('Success', 'reference: ' + data.data.reference + ' Pin: ' + data.data.pin, 'success');
            this.loadCards();
          } else {
            swal('Error', data.error[0].message, 'error');
          }
        },
        (error: any) => {
        }
      );
  }

  loadCards() {
    return new Promise((resolve) => {
      this.cardService.getCards()
        .subscribe(
          (data: any) => {
            if (data.success) {
              this.cards = data.data.cards;
              if (!this.selectedCard) {
                this.selectCard(this.cards[0]);
              } else {
                this.getColor(this.selectedCard.reference);
              }
            } else {
            }
            resolve();
          },
          (error: any) => {
          }
        );
    });
  }

  selectCard(card) {
    if (card) {
      this.selectedCard = card;
      this.cardService.getCardTransactions(card.id).subscribe((res: any) => {
        if (res.success) {
          this.transactions = res.data;
        }
      });
      this.imgSrc = this.selectedCard.card.images.filter(image => image.type === 'front')[0].image;
      this.getColor(this.selectedCard.reference);
    }
  }

  getFormattedDate() {
    const date = '' + this.selectedCard.expiry_date;
    if (this.selectedCard.physical) {
      return '••/••';
    } else {
      return date.substr(4, 2) + '/' + date.substr(2, 2);
    }
  }

  showReference(card) {
    if (card.reference === this.selectedCard.reference) {
      return card.reference.toString();
    }
    return card.reference.toString().slice(0, 4) + '...';
  }

  changeStatus(card, event) {
    if (!this.lockingCard) {
      this.lockingCard = true;
      const data = { locked: event.target.checked };
      this.cardService.changeStatus(card.reference, data)
        .subscribe(
          (data: any) => {
            if (data.success) {
              this.loadCards()
                .then(() => {
                  this.lockingCard = false;
                });
            } else {
              swal('Error', data.error[0].message, 'error');
            }
          },
          (error: any) => {
          }
        );
    }
  }

  seePin(card) {
    this.cardService.changePin({ reference: card.reference })
      .subscribe(
        (data: any) => {
          if (data.success) {
            swal('Success', 'Pin: ' + data.data.pin, 'success');
          } else {
            swal('Error', data.error[0].message, 'error');
          }
        },
        (error: any) => {
        }
      );
  }

  getColor(reference) {
    this.cards = this.cards.map(card => {
      if (card.reference === reference) {
        return {
          ...card,
          color: 'rgba(0,0,0,.075)'
        };
      } else {
        return {
          ...card,
          color: 'none'
        };
      }
    });
  }

  ngOnDestroy() {
    this.renderer.removeAttribute(this.bodyEl, 'background');
    this.renderer.removeStyle(this.bodyEl, 'background-color');
  }
}
