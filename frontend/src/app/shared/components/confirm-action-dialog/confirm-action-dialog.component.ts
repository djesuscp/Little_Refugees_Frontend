import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-action-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-action-dialog.component.html',
  styleUrls: ['./confirm-action-dialog.component.scss'],
})
export class ConfirmActionDialogComponent {

  //Texto que aparecerá en el popup.
  @Input() message: string = '¿Seguro que deseas continuar?';

  // Texto del botón de confirmar (por defecto: Confirmar).
  @Input() confirmText: string = 'Confirmar';

  // Texto del botón de cancelar.
  @Input() cancelText: string = 'Cancelar';

  // Emitido al pulsar confirmar.
  @Output() confirm = new EventEmitter<void>();

  // Emitido al pulsar cancelar.
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
