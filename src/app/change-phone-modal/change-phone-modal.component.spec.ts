import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { ChangePhoneModalComponent } from './change-phone-modal.component';
import { FormsModule } from '@angular/forms';
import { NgxMaskModule, config } from 'ngx-mask';
import { TextMaskModule } from 'angular2-text-mask';
import { BsModalService } from 'ngx-bootstrap';
import { UserService } from '../apis/user.service';
import { of } from 'rxjs';

class MockBsModalService {
  config = {
    ignoreBackdropClick: false
  };
  show() {}
  onHide() {}
}

describe('ChangePhoneModalComponent', () => {
  let component: ChangePhoneModalComponent;
  let fixture: ComponentFixture<ChangePhoneModalComponent>;
  let mockBsModalService;
  let mockUserService;

  beforeEach(async(() => {
    mockBsModalService = new MockBsModalService();
    mockUserService = jasmine.createSpyObj(['update', 'verifyPhone']);
    TestBed.configureTestingModule({
      declarations: [
        ChangePhoneModalComponent,
      ],
      imports: [
        FormsModule,
        NgxMaskModule,
        TextMaskModule
      ],
      providers: [
        {provide: BsModalService, useValue: mockBsModalService},
        {provide: UserService, useValue: mockUserService},
        {provide: config, useValue: {}}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangePhoneModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open modal', fakeAsync(() => {
    component.oldPhone = '111';
    component.openModal(1);
    tick(1000);
    expect(component.step).toBe(2);
    expect(component.model.newPhone).toBe('111');
    expect(component.modalRef).toBeUndefined();
  }));

  it('should move to confirm step', fakeAsync(() => {
    component.model = {
      newPhone: '111'
    };
    component.moveToConfirmStep();
    expect(component.step).toBe(2);
  }));

  it('should move to 2 factor step', fakeAsync(() => {
    mockUserService.update.and.returnValue(of({
      success: true
    }));
    component.model = {
      newPhone: '111'
    };
    component.moveTo2FAStep();
    tick(1000);
    expect(component.step).toBe(3);
  }));

  it('should move to end', fakeAsync(() => {
    mockUserService.verifyPhone.and.returnValue(of({
      success: true
    }));
    component.model = {
      code2fa: '111'
    };
    component.moveToEnd();
    tick(1000);
    expect(component.step).toBe(4);
    expect(component.model.code2fa).toBe('');
  }));
});
