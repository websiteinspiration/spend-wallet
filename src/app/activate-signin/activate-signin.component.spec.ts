import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivateSigninComponent } from './activate-signin.component';

describe('ActivateSigninComponent', () => {
  let component: ActivateSigninComponent;
  let fixture: ComponentFixture<ActivateSigninComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivateSigninComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivateSigninComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
