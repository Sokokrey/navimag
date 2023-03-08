import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadTypeConfigComponent } from './load-type-config.component';

describe('LoadTypeConfigComponent', () => {
  let component: LoadTypeConfigComponent;
  let fixture: ComponentFixture<LoadTypeConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoadTypeConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadTypeConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
