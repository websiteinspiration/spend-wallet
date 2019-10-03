import { Component, OnInit, ViewChild, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CardService } from '../services/card.service';
import { ActivateCard } from '../models/activateCard.model';
import { Router } from '@angular/router';
import { UtilService } from '../services/util.service';

@Component({
  selector: 'app-card-settings',
  templateUrl: './card-settings.component.html',
  styleUrls: ['./card-settings.component.scss']
})
export class CardSettingsComponent implements OnInit, OnDestroy {
  @ViewChild('activateCardForm') activateCardForm: NgForm;
  @ViewChild('manageLimitForm') manageLimitForm: NgForm;
  @ViewChild('changePinForm') changePinForm: NgForm;

  activateCard: ActivateCard = {
    reference: undefined,
    expiryDate: undefined,
    cvv: undefined,
  };

  manageLimit: any = {
    cardNumber: undefined,
    cardLimit: undefined
  };

  changePin: any = {
    cpReference: undefined,
    currentPin: undefined,
    newPin: undefined,
    confirmNewPin: undefined
  };
  cards: any = undefined;
  bodyEl: any = undefined;
  cardId: any = 40;
  transactions: any = undefined;
  selectedOption = 'list-activate-card-list';

  constructor(
    private cardService: CardService,
    private renderer: Renderer2,
    private utilService: UtilService,
    private route: Router,
    private elRef: ElementRef) {
    this.bodyEl = this.elRef.nativeElement.ownerDocument.body;
    this.loadBackground();
  }

  ngOnInit() {
    this.loadCards();
    this.loadTransactions();
  }

  loadCards() {
    this.utilService.showLoading.next(true);
    this.cardService.getCards()
      .subscribe(
        (data: any) => {
          this.utilService.showLoading.next(false);
          if (data.success) {
            this.cards = data.data.cards;
          } else {
          }
        },
        (error: any) => {
          this.utilService.showLoading.next(false);
        }
      );
  }

  loadTransactions() {
    this.utilService.showLoading.next(true);
    this.cardService.getTransctions()
      .subscribe(
        (data: any) => {
          this.utilService.showLoading.next(false);
          if (data.success) {
            // Filtering type with Receive, Card Purchase & Card Refund
            this.transactions = data.data.transactions
              .filter(et => et.type === 'Purchase');
          } else {
          }
        },
        (error: any) => {
          this.utilService.showLoading.next(false);
        }
      );
  }

  loadBackground() {
    this.renderer.setStyle(this.bodyEl, 'background-size', 'cover');
    this.renderer.setStyle(this.bodyEl, 'background-repeat', 'no-repeat');
    this.renderer.setAttribute(this.bodyEl, 'background', '/assets/images/card-setting-background.png');
  }

  onCardList(id) {
    if (
      id !== 'list-track-card-list' &&
      id !== 'list-manage-limits-list' &&
      id !== 'list-report-fraud-list'
    ) {
      this.selectedOption = id;
    }
  }

  onActivateCard(activateCardForm) {
    if (activateCardForm.valid) {
      const data = {
        reference: parseInt(activateCardForm.value.reference),
        cvv: parseInt(activateCardForm.value.cvv),
        expiryDate: parseInt(activateCardForm.value.expiryDate)
      };
      this.cardService.activateCard(data)
        .subscribe(
          (data: any) => {
            if (data.success) {
              swal('Success', 'Card activated', 'success')
                .then(() => {
                  this.activateCardForm.reset();
                });
            } else {
              swal('Error', data.error[0].message, 'error')
                .then(() => {
                  this.activateCardForm.reset();
                });
            }
          },
          (error: any) => {
          }
        );
    } else {

    }
  }

  onFraudReport(form) {
  }

  onIssueCard() {
    const data = {
      virtual: true,
      cardId: this.cardId
    };
    this.cardService.issueCard(data)
      .subscribe(
        (data: any) => {
          if (data.success) {
            swal('Success', `Reference: ${data.data.reference} Pin: ${data.data.pin}`, 'success');
          } else {
            swal('Error', data.error[0].message, 'error');
          }
        },
        (error: any) => {
        }
      );
  }

  onChangeStatus(card) {
    const data = {
      locked: !card.locked
    };
    this.cardService.changeStatus(card.reference, data)
      .subscribe(
        (data: any) => {
          this.loadCards();
        },
        (error: any) => {
        }
      );
  }

  onManageLimit(manageLimitForm) {
  }

  onChangePin(changePinForm) {
    const obj = {
      reference: parseInt(changePinForm.value.cpReference)
    };
    this.cardService.changePin(obj)
      .subscribe(
        (data: any) => {
          this.changePinForm.resetForm();
          if (data.success) {
            swal('Success', `New Pin: ${data.data.pin}`, 'success');
          } else {
            swal('Error', data.error[0].message, 'error');
          }
        },
        (error: any) => {
        }
      );
  }

  onOrderCard() {
    this.route.navigate(['card/order']);
  }

  ngOnDestroy() {
    this.renderer.removeAttribute(this.bodyEl, 'background');
    this.renderer.removeStyle(this.bodyEl, 'background-color');
    this.renderer.removeStyle(this.bodyEl, 'background-size');
    this.renderer.removeStyle(this.bodyEl, 'background-repeat');
  }
}
