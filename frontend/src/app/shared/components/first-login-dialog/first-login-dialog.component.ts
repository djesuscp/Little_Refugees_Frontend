import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-first-login-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './first-login-dialog.component.html',
  styleUrls: ['./first-login-dialog.component.scss']
})
export class FirstLoginDialogComponent {
  @Output() chooseManage = new EventEmitter<void>();
  @Output() chooseAdopt = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
}
