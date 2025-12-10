import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmPasswordDialogComponent } from './confirm-password-dialog.component';

describe('ConfirmPasswordDialogComponent', () => {
  let component: ConfirmPasswordDialogComponent;
  let fixture: ComponentFixture<ConfirmPasswordDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmPasswordDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmPasswordDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
