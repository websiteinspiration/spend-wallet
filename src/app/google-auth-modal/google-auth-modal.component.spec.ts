import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleAuthModalComponent } from './google-auth-modal.component';
import { TextMaskModule } from 'angular2-text-mask';
import { FormsModule } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap';
import { UserService } from '../apis/user.service';

describe('GoogleAuthModalComponent', () => {
  let component: GoogleAuthModalComponent;
  let fixture: ComponentFixture<GoogleAuthModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GoogleAuthModalComponent
      ],
      imports: [
        TextMaskModule,
        FormsModule
      ],
      providers: [
        {provide: BsModalService, useValue: {}},
        {provide: UserService, useValue: {}}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GoogleAuthModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
