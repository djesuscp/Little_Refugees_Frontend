import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAdoptionRequestComponent } from './admin-adoption-request.component';

describe('AdminAdoptionRequestComponent', () => {
  let component: AdminAdoptionRequestComponent;
  let fixture: ComponentFixture<AdminAdoptionRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAdoptionRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAdoptionRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
