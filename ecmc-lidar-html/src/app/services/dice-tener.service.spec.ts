import { TestBed } from '@angular/core/testing';

import { DiceTenerService } from './dice-tener.service';

describe('DiceTenerService', () => {
  let service: DiceTenerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiceTenerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
