import { TestBed } from '@angular/core/testing';
import { LoadTypeService } from './load-type.service';

describe('LoadTypesService', () => {
  let service: LoadTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
