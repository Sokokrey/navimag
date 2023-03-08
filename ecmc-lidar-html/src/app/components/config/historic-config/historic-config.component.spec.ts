import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricConfigComponent } from './historic-config.component';

describe('HistoricConfigComponent', () => {
  let component: HistoricConfigComponent;
  let fixture: ComponentFixture<HistoricConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistoricConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoricConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
