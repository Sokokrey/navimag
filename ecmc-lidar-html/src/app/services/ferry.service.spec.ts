import { TestBed } from '@angular/core/testing';

import { FerryService } from './ferry.service';

describe('ferryService', () => {
  let service: FerryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FerryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
