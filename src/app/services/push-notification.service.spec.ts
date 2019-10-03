import { TestBed, inject } from '@angular/core/testing';

import { PushNotificationService } from './push-notification.service';
import { HttpClientModule } from '@angular/common/http';

describe('PushNotificationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
      ],
      providers: [
        PushNotificationService
      ]
    });
  });

  it('should be created', inject([PushNotificationService], (service: PushNotificationService) => {
    expect(service).toBeTruthy();
  }));
});
