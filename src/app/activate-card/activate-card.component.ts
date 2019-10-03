import { Component, OnInit, OnDestroy, Renderer2, ElementRef } from '@angular/core';
import { CardService } from '../services/card.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-activate-card',
  templateUrl: './activate-card.component.html',
  styleUrls: ['./activate-card.component.scss']
})
export class ActivateCardComponent implements OnInit, OnDestroy {
  cvv = ['', '', ''];
  pin = ['', '', '', ''];
  confirmPin = ['', '', '', ''];
  openDialog = false;
  openFailedDialog = false;
  openSecondDialog = false;
  step = 0;
  pinVal = 0;
  error = [];
  reference = '';
  bodyEl: any;
  isSubmitted = false;
  username: string = null;
  selectedCard = null;

  constructor(
      private _cardService: CardService,
      private renderer: Renderer2,
      private elRef: ElementRef,
      private router: Router,
      private route: ActivatedRoute
  ) {
    this.route.params.subscribe(res => {
      if (res && res.step) {
        this.selectedCard = JSON.parse(localStorage.getItem('Selected_Card'));
        if (this.selectedCard) {
          this.reference = this.selectedCard.reference;
        }
        this.step = parseInt(res.step, 10);
      }
    });
    this.bodyEl = this.elRef.nativeElement.ownerDocument.body;
    this.loadBackground();
    const user = JSON.parse(localStorage.getItem('user'));
    this.username = user.username;
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.renderer.removeAttribute(this.bodyEl, 'background');
    this.renderer.removeStyle(this.bodyEl, 'background-color');
    this.renderer.removeStyle(this.bodyEl, 'background-size');
    this.renderer.removeStyle(this.bodyEl, 'background-repeat');
  }

  loadBackground() {
    this.renderer.setStyle(this.bodyEl, 'background-size', 'cover');
    this.renderer.setStyle(this.bodyEl, 'background-repeat', 'no-repeat');
    this.renderer.setAttribute(this.bodyEl, 'background', '/assets/images/card-setting-background.png');
  }

  onCvvChange(event) {
    if (this.cvv[0].length > 1) {
      this.cvv[0] = this.cvv[0].substr(0, 1);
    }
    if (this.cvv[1].length > 1) {
      this.cvv[1] = this.cvv[1].substr(0, 1);
    }
    if (this.cvv[2].length > 1) {
      this.cvv[2] = this.cvv[2].substr(0, 1);
    }
    if (event.target.value) {
      const element = event.srcElement.nextElementSibling;
      if (element === null) {
        return;
      }
      element.focus();
      element.setSelectionRange(0, 0);
    }
  }

  onPinChange(event) {
    if (this.pin[0].length > 1) {
      this.pin[0] = this.pin[0].substr(0, 1);
    }
    if (this.pin[1].length > 1) {
      this.pin[1] = this.pin[1].substr(0, 1);
    }
    if (this.pin[2].length > 1) {
      this.pin[2] = this.pin[2].substr(0, 1);
    }
    if (this.pin[3].length > 1) {
      this.pin[3] = this.pin[3].substr(0, 1);
    }
    if (event.target.value) {
      const element = event.srcElement.nextElementSibling;
      if (element === null) {
        return;
      }
      element.focus();
      element.setSelectionRange(0, 0);
    }
  }

  onConfirmPinChange(event) {
    if (this.confirmPin[0].length > 1) {
      this.confirmPin[0] = this.confirmPin[0].substr(0, 1);
    }
    if (this.confirmPin[1].length > 1) {
      this.confirmPin[1] = this.confirmPin[1].substr(0, 1);
    }
    if (this.confirmPin[2].length > 1) {
      this.confirmPin[2] = this.confirmPin[2].substr(0, 1);
    }
    if (this.confirmPin[3].length > 1) {
      this.confirmPin[3] = this.confirmPin[3].substr(0, 1);
    }
    if (event.target.value) {
      const element = event.srcElement.nextElementSibling;
      if (element === null) {
        return;
      }
      element.focus();
      element.setSelectionRange(0, 0);
    }
  }

  submit(event) {
    event.preventDefault();
    if (this.step === 0) {
      this.isSubmitted = true;
      this._cardService.activateCard({cvv: this.getVal()}).subscribe((res: any) => {
        this.isSubmitted = false;
        if (res.success) {
          this.openDialog = true;
          this.reference = res.data.reference;
        } else {
          this.error = res.error;
          this.openFailedDialog = true;
        }
      });
    } else if (this.step === 1) {
      this.step = 2;
    } else if (this.step === 2) {
      this.isSubmitted = true;
      this._cardService.createPin({pin: this.getVal(), reference: this.reference}).subscribe((res: any) => {
        this.isSubmitted = false;
        if (res.success) {
          this.openSecondDialog = true;
        } else {
          this.error = res.error;
          this.openFailedDialog = true;
        }
      });
    }
  }

  hideDialog() {
    this.openDialog = false;
  }

  setPin() {
    this.step = 1;
    this.openDialog = false;
  }

  getTitle() {
    if (this.step === 0) {
      return 'Enter the CVV';
    } else if (this.step === 1) {
      return 'Create your PIN Code';
    } else if (this.step === 2) {
      return 'Re-enter your PIN Code';
    }
  }

  getDescription() {
    if (this.step === 0) {
      return `Welcome ${this.username}, Please enter the three digit security code found on the back of your card:`;
    } else if (this.step === 1) {
      return 'Please set a secure PIN to use your Spend Card.';
    } else if (this.step === 2) {
      return 'Re-enter your 4 digits';
    }
  }

  getBtnText() {
    if (this.step === 0) {
      return 'Activate';
    } else if (this.step === 1) {
      return 'Next';
    } else if (this.step === 2) {
      return 'Complete';
    }
  }

  close() {
    if (this.openSecondDialog) {
      this.openSecondDialog = false;
      this.router.navigate(['/wallet']);
    }
    this.openFailedDialog = false;
  }

  isValid() {
    if (this.step === 0) {
      return this.getVal() && this.getVal().toString().length === 3;
    } else if (this.step === 1) {
      return this.getVal() && this.getVal().toString().length === 4;
    } else if (this.step === 2) {
      return this.getVal() && this.getVal().toString().length === 4 && this.pinVal === this.getVal() && this.reference;
    }
  }

  getVal() {
    if (this.step === 0) {
      return parseInt(this.cvv.join().replace(/,/g, ''), 10);
    } else if (this.step === 1) {
      this.pinVal = parseInt(this.pin.join().replace(/,/g, ''), 10);
      return this.pinVal;
    } else if (this.step === 2) {
      return parseInt(this.confirmPin.join().replace(/,/g, ''), 10);
    }
  }
}
