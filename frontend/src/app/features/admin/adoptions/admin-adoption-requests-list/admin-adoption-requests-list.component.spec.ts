import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAdoptionRequestsListComponent } from './admin-adoption-requests-list.component';

describe('AdminAdoptionRequestsListComponent', () => {
  let component: AdminAdoptionRequestsListComponent;
  let fixture: ComponentFixture<AdminAdoptionRequestsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAdoptionRequestsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAdoptionRequestsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
