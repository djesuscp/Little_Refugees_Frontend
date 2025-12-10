import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShelterEditComponent } from './shelter-edit.component';

describe('ShelterEditComponent', () => {
  let component: ShelterEditComponent;
  let fixture: ComponentFixture<ShelterEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShelterEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShelterEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
