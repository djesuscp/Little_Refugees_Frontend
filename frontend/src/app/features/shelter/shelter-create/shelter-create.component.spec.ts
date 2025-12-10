import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShelterCreateComponent } from '../shelter-create.component';

describe('ShelterCreateComponent', () => {
  let component: ShelterCreateComponent;
  let fixture: ComponentFixture<ShelterCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShelterCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShelterCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
