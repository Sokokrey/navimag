import { TestBed } from '@angular/core/testing';

import { ShipperReportService } from './shipper-report.service';

describe('ShipperReportService', () => {
  let service: ShipperReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShipperReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
