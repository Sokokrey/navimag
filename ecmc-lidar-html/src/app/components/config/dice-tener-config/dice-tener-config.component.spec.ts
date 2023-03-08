import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiceTenerConfigComponent } from './dice-tener-config.component';

describe('DiceTenerConfigComponent', () => {
  let component: DiceTenerConfigComponent;
  let fixture: ComponentFixture<DiceTenerConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiceTenerConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiceTenerConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
