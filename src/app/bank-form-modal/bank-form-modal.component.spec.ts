import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { BankFormModalComponent } from './bank-form-modal.component';
import { FormsModule } from '@angular/forms';
import { BankService } from '../apis/bank.service';
import { BsModalService } from 'ngx-bootstrap';
import { of } from 'rxjs';

describe('BankFormModalComponent', () => {
  let component: BankFormModalComponent;
  let fixture: ComponentFixture<BankFormModalComponent>;
  let mockBsModalService;
  let mockBankService;

  beforeEach(async(() => {
    mockBsModalService = jasmine.createSpyObj(['show']);
    mockBankService = jasmine.createSpyObj(['createAccount']);
    TestBed.configureTestingModule({
      declarations: [
        BankFormModalComponent
      ],
      imports: [
        FormsModule,
      ],
      providers: [
        {provide: BankService, useValue: mockBankService},
        {provide: BsModalService, useValue: mockBsModalService},
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BankFormModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open modal', fakeAsync(() => {
    mockBsModalService.show.and.returnValue(null);
    component.openModal();
    tick(1000);
    expect(component.modalRef).toBeNull();
  }));

  it('should get type', fakeAsync(() => {
    expect(component.getType('string')).toBe('text');
  }));

  it('should click submit', fakeAsync(() => {
    mockBankService.createAccount.and.returnValue(of({success: true}));
    const accountForm = {
      valid: true,
      reset: () => {}
    };
    component.flow = {id: 1};
    component.modalRef = {
      hide: () => {}
    };
    component.onSubmit(accountForm);
    tick(1000);
    expect(component.isSubmitted).toBeFalsy();
  }));
});
