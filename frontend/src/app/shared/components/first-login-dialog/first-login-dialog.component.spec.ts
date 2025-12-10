import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirstLoginDialogComponent } from './first-login-dialog.component';

describe('FirstLoginDialogComponent', () => {
  let component: FirstLoginDialogComponent;
  let fixture: ComponentFixture<FirstLoginDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FirstLoginDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FirstLoginDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
