import { TestBed } from '@angular/core/testing';

import { ReportHistoricService } from './report-historic.service';

describe('ReportHistoricService', () => {
  let service: ReportHistoricService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReportHistoricService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
