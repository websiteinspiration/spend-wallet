import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderCardComponent } from './order-card.component';
import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

describe('OrderCardComponent', () => {
  let component: OrderCardComponent;
  let fixture: ComponentFixture<OrderCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        OrderCardComponent,
        MockUpperMenuComponent
      ],
      imports: [
        HttpClientModule
      ],
      providers: [
        {provide: ActivatedRoute, useValue: {}}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  @Component({selector: 'app-upper-menu', template: ''})
  class MockUpperMenuComponent {
    @Input() public toggle: any;
  }
});
