import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAnimalsListComponent } from './admin-animals-list.component';

describe('AdminAnimalsListComponent', () => {
  let component: AdminAnimalsListComponent;
  let fixture: ComponentFixture<AdminAnimalsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAnimalsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAnimalsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
