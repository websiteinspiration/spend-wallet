import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';

import { CardSettingsComponent } from './card-settings.component';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { HttpClientModule } from '@angular/common/http';
import { CardService } from '../services/card.service';
import { of } from 'rxjs';
import { Router } from '@angular/router';

describe('CardSettingsComponent', () => {
  let component: CardSettingsComponent;
  let fixture: ComponentFixture<CardSettingsComponent>;
  let mockCardService;

  beforeEach(async(() => {
    mockCardService = jasmine.createSpyObj(['getCards', 'getTransctions', 'activateCard', 'issueCard', 'changeStatus', 'changePin']);
    TestBed.configureTestingModule({
      declarations: [
        CardSettingsComponent,
        MockUpperMenuComponent
      ],
      imports: [
        FormsModule,
        PerfectScrollbarModule,
        HttpClientModule,
      ],
      providers: [
        {provide: CardService, useValue: mockCardService},
        {provide: Router, useValue: {}}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardSettingsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load cards', fakeAsync(() => {
    mockCardService.getCards.and.returnValue(of({success: true, data: {cards: []}}));
    component.loadCards();
    tick(1000);
    expect(component.cards.length).toBe(0);
  }));

  it('should load transactions', fakeAsync(() => {
    mockCardService.getTransctions.and.returnValue(of({
      success: true,
      data: {
        transactions: [
          {type: 'Purchase', amount: 10}
        ]
      }
    }));
    component.loadTransactions();
    tick(1000);
    expect(component.transactions.length).toBe(1);
  }));

  it('should load background', fakeAsync(() => {
    component.loadBackground();
    expect(component.bodyEl.background).toBe('/assets/images/card-setting-background.png');
  }));

  it('should click card list', fakeAsync(() => {
    component.onCardList('list-order-card-list');
    expect(component.selectedOption).toBe('list-order-card-list');
    component.onCardList('list-pre-card-list');
    expect(component.selectedOption).toBe('list-pre-card-list');
  }));

  it('should click activate card', fakeAsync(() => {
    mockCardService.activateCard.and.returnValue(of({
      success: true
    }));
    const activateForm = {
      valid: true,
      value: {
        reference: 'Ref',
        cvv: '123',
        expiryDate: '12/20'
      },
      reset: () => {}
    };
    component.onActivateCard(activateForm);
    tick(1000);
  }));

  it('should click issue card', fakeAsync(() => {
    mockCardService.issueCard.and.returnValue(of({
      success: true,
      data: {
        reference: 'ref',
        pin: '123'
      }
    }));
    component.cardId = '1';
    component.onIssueCard();
    tick(1000);
  }));

  it('should click change status', fakeAsync(() => {
    mockCardService.changeStatus.and.returnValue(of({}));
    mockCardService.getCards.and.returnValue(of({success: true, data: {cards: []}}));
    const card = {
      reference: 'ref',
      locked: false
    };
    component.onChangeStatus(card);
    tick(1000);
    expect(component.cards.length).toBe(0);
  }));

  it('should click change pin', fakeAsync(() => {
    mockCardService.changePin.and.returnValue(of({
      success: true,
      data: {
        pin: '123'
      }
    }));
    const changePinForm = {
      value: {
        cpReference: 'ref'
      }
    };
    component.onChangePin(changePinForm);
    tick(1000);
  }));

  @Component({selector: 'app-upper-menu', template: ''})
  class MockUpperMenuComponent {
    @Input() public toggle: any;
  }
});
