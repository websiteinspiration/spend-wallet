import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerificationComponent } from './verification.component';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../apis/user.service';
import { HttpClientModule } from '@angular/common/http';

describe('VerificationComponent', () => {
  let component: VerificationComponent;
  let fixture: ComponentFixture<VerificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        VerificationComponent,
        MockUpperMenuComponent,
      ],
      imports: [
        HttpClientModule
      ],
      providers: [
        {provide: Router, useValue: {}},
        {provide: UserService, useValue: {}},
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerificationComponent);
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
