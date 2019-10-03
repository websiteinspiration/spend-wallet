import { TestBed, inject } from '@angular/core/testing';

import { UtilService } from './util.service';
import { HttpClientModule } from '@angular/common/http';

describe('UtilService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
      ],
      providers: [
        UtilService
      ]
    });
  });

  it('should be created', inject([UtilService], (service: UtilService) => {
    expect(service).toBeTruthy();
  }));
});
