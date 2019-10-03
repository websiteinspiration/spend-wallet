import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpperMenuComponent } from './upper-menu.component';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { UserService } from '../apis/user.service';
import { Directive, Input } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('UpperMenuComponent', () => {
  let component: UpperMenuComponent;
  let fixture: ComponentFixture<UpperMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        UpperMenuComponent,
        RouterLinkMockDirective,
        RouterLinkActiveMockDirective
      ],
      imports: [
        HttpClientModule
      ],
      providers: [
        {provide: Router, useValue: {}},
        {provide: UserService, useValue: {}},
        {provide: ActivatedRoute, useValue: {}},
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpperMenuComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  @Directive({selector: '[routerLink]'})
  class RouterLinkMockDirective {
    @Input() public routerLink: any;
  }

  @Directive({selector: '[routerLinkActive]'})
  class RouterLinkActiveMockDirective {
    @Input() public routerLinkActive: any;
  }
});
