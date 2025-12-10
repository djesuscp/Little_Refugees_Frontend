import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminShelterOverviewComponent } from './admin-shelter-overview.component';

describe('AdminShelterOverviewComponent', () => {
  let component: AdminShelterOverviewComponent;
  let fixture: ComponentFixture<AdminShelterOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminShelterOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminShelterOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
