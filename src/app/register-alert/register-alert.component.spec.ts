import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterAlertComponent } from './register-alert.component';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

describe('RegisterAlertComponent', () => {
  let component: RegisterAlertComponent;
  let fixture: ComponentFixture<RegisterAlertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        RegisterAlertComponent,
      ],
      imports: [
        HttpClientModule
      ],
      providers: [
        {provide: Router, useValue: {}},
        {provide: ActivatedRoute, useValue: {}},
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
