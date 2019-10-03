import { TestBed, inject } from '@angular/core/testing';

import { CardService } from './card.service';
import { HttpClientModule } from '@angular/common/http';

describe('CardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
      ],
      providers: [
        CardService
      ]
    });
  });

  it('should be created', inject([CardService], (service: CardService) => {
    expect(service).toBeTruthy();
  }));
});
