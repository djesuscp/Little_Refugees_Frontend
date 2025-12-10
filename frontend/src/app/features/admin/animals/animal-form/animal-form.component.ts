import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {
  AdminAnimalService,
  AdminAnimal,
  AdminAnimalPhoto,
} from '../../services/admin-animal.service';
import { ConfirmActionDialogComponent } from '../../../../shared/components/confirm-action-dialog/confirm-action-dialog.component';

@Component({
  selector: 'app-admin-animal-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmActionDialogComponent],
  templateUrl: './animal-form.component.html',
  styleUrls: ['./animal-form.component.scss'],
})
export class AnimalFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private adminAnimalService = inject(AdminAnimalService);

  mode: 'create' | 'edit' = 'create';
  animalId: number | null = null;
  loading = false;

  // *** CLOUDINARY: fotos existentes del animal (las que vienen de la BD)
  existingPhotos: AdminAnimalPhoto[] = [];

  // *** CLOUDINARY: archivos seleccionados para subir (aún no subidos)
  selectedFiles: File[] = [];

  // *** CLOUDINARY: estado de subida
  uploadingPhotos = false;

  // *** CLOUDINARY: configuración de validación
  readonly maxPhotos = 5;
  readonly maxFileSizeMb = 5;
  readonly allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];

  // URLs de fotos que vamos a enviar al backend
  photoUrls: string[] = [];

  // Campo auxiliar para añadir fotos desde un input de texto
  newPhotoUrl = '';

  // NUEVO: flag para mostrar el diálogo de confirmación de borrado
  showDeleteDialog = false;
  // ⭐ NUEVO: control del diálogo
  showDeletePhotoDialog = false;         // si mostrar el diálogo
  photoPendingDeletion: AdminAnimalPhoto | null = null;   // qué foto borrar

  form = this.fb.group({
    name: ['', Validators.required],
    species: ['', Validators.required],
    breed: ['', Validators.required],
    gender: ['', Validators.required], // select macho/hembra en HTML
    age: [0], // opcional
    description: [''],
    adopted: [false], // solo visible en modo edición
  });

  ngOnInit(): void {
    // Miramos si hay :id en la ruta
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.mode = 'edit';
      this.animalId = Number(idParam);
      this.loadAnimalForEdit(this.animalId);
    } else {
      this.mode = 'create';
    }
  }

  /** Cargar datos del animal en modo edición */
  loadAnimalForEdit(id: number) {
    this.loading = true;
    this.adminAnimalService.getAnimalById(id).subscribe({
      next: (res) => {
        this.loading = false;
        const a = res.animal;
        // Patch de los datos principales
        this.form.patchValue({
          name: a.name,
          species: a.species,
          breed: a.breed,
          gender: a.gender,
          age: a.age,
          description: a.description ?? '',
          adopted: a.adopted,
        });

        // *** CLOUDINARY: guardamos las fotos existentes (con id + url)
        this.existingPhotos = a.photos ?? [];

        // Mantener photoUrls por compatibilidad, aunque backend ya gestiona fotos aparte
        this.photoUrls = this.existingPhotos.map((p) => p.url);

        // Fotos existentes → las pasamos a array de URLs
        //this.photoUrls = a.photos?.map((p) => p.url) ?? [];
      },
      error: (err) => {
        const msg =
          err.error?.message ?? 'No se pudo cargar la información del animal.';
        this.toastr.error(msg);
        this.loading = false;
        this.router.navigate(['/admin/animals']);
      },
    });
  }

  // ---------------------------------------------------------------------------
  // *** CLOUDINARY: gestión de selección de archivos
  // ---------------------------------------------------------------------------

  /** Indica si podemos gestionar fotos (solo en modo edición y con id) */
  get canManagePhotos(): boolean {
    return this.mode === 'edit' && !!this.animalId;
  }

  /** Cuántas fotos más se pueden subir */
  get remainingSlots(): number {
    return this.maxPhotos - this.existingPhotos.length;
  }

  /** Selección de archivos desde el input type="file" */
  onFilesSelected(event: Event) {
    if (!this.canManagePhotos) {
      return;
    }

    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const files = Array.from(input.files);

    for (const file of files) {
      // Si ya no queda hueco, avisamos
      if (this.existingPhotos.length + this.selectedFiles.length >= this.maxPhotos) {
        this.toastr.warning(
          `Solo puedes subir un máximo de ${this.maxPhotos} fotos por animal.`
        );
        break;
      }

      // Validar extensión
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      if (!this.allowedExtensions.includes(ext)) {
        this.toastr.error(
          `Formato no permitido: ${ext}. Permitidos: ${this.allowedExtensions.join(
            ', '
          )}`
        );
        continue;
      }

      // Validar tamaño
      const sizeMb = file.size / (1024 * 1024);
      if (sizeMb > this.maxFileSizeMb) {
        this.toastr.error(
          `La imagen "${file.name}" supera los ${this.maxFileSizeMb} MB.`
        );
        continue;
      }

      this.selectedFiles.push(file);
    }

    // Limpiamos el input para poder volver a seleccionar los mismos archivos si se quiere
    input.value = '';
  }

  /** Quitar un archivo de la selección local (antes de subir) */
  onRemoveSelectedFile(file: File) {
    this.selectedFiles = this.selectedFiles.filter((f) => f !== file);
  }

  /** Subir las fotos seleccionadas al backend/Cloudinary */
  onUploadSelectedPhotos() {
    if (!this.canManagePhotos || !this.animalId) return;
    if (this.selectedFiles.length === 0) {
      this.toastr.info('No hay fotos nuevas para subir.');
      return;
    }

    this.uploadingPhotos = true;

    this.adminAnimalService
      .uploadAnimalPhotos(this.animalId, this.selectedFiles)
      .subscribe({
        next: (newPhotos) => {
          // Añadimos las nuevas fotos a las existentes
          this.existingPhotos = [...this.existingPhotos, ...newPhotos];
          this.photoUrls = this.existingPhotos.map((p) => p.url);

          this.selectedFiles = [];
          this.uploadingPhotos = false;
          this.toastr.success('Fotos subidas correctamente.');
        },
        error: (err) => {
          const msg =
            err.error?.message ?? 'No se pudieron subir las fotos del animal.';
          this.toastr.error(msg);
          this.uploadingPhotos = false;
        },
      });
  }

  /** Eliminar una foto existente (ya subida) */
  // ⭐ MODIFICADO: ahora solo abre el confirm dialog
  onDeleteExistingPhoto(photo: AdminAnimalPhoto) {
    if (!this.canManagePhotos || !this.animalId) return;

    this.photoPendingDeletion = photo;      // guardamos la foto que se va a borrar
    this.showDeletePhotoDialog = true;      // mostramos el diálogo
  }
  // ⭐ NUEVO: el usuario confirma que quiere borrar la foto
  onConfirmDeletePhoto() {
    if (!this.photoPendingDeletion || !this.animalId) return;

    const photo = this.photoPendingDeletion;
    this.showDeletePhotoDialog = false;
    this.uploadingPhotos = true;

    this.adminAnimalService
      .deleteAnimalPhoto(this.animalId, photo.id)
      .subscribe({
        next: () => {
          // eliminar de listado local
          this.existingPhotos = this.existingPhotos.filter(p => p.id !== photo.id);
          this.photoUrls = this.existingPhotos.map(p => p.url);
          this.uploadingPhotos = false;
          this.toastr.success('Foto eliminada correctamente.');
        },
        error: (err) => {
          const msg = err.error?.message ?? 'No se pudo eliminar la foto del animal.';
          this.toastr.error(msg);
          this.uploadingPhotos = false;
        }
      });

    this.photoPendingDeletion = null;
  }

  // ⭐ NUEVO: cancelar diálogo
  onCancelDeletePhoto() {
    this.showDeletePhotoDialog = false;
    this.photoPendingDeletion = null;
  }

  // onDeleteExistingPhoto(photo: AdminAnimalPhoto) {
  //   if (!this.canManagePhotos || !this.animalId) return;

  //   const confirmed = confirm('¿Seguro que quieres eliminar esta foto?');
  //   if (!confirmed) return;

  //   this.uploadingPhotos = true;

  //   this.adminAnimalService
  //     .deleteAnimalPhoto(this.animalId, photo.id)
  //     .subscribe({
  //       next: () => {
  //         this.existingPhotos = this.existingPhotos.filter(
  //           (p) => p.id !== photo.id
  //         );
  //         this.photoUrls = this.existingPhotos.map((p) => p.url);
  //         this.uploadingPhotos = false;
  //         this.toastr.success('Foto eliminada correctamente.');
  //       },
  //       error: (err) => {
  //         const msg =
  //           err.error?.message ?? 'No se pudo eliminar la foto del animal.';
  //         this.toastr.error(msg);
  //         this.uploadingPhotos = false;
  //       },
  //     });
  // }

  // /** Añadir una nueva URL de foto al listado */
  // onAddPhotoUrl() {
  //   const url = this.newPhotoUrl.trim();
  //   if (!url) return;

  //   this.photoUrls.push(url);
  //   this.newPhotoUrl = '';
  // }

  // /** Eliminar una foto existente del listado (solo en frontend, se reflejará al guardar) */
  // onRemovePhotoUrl(index: number) {
  //   this.photoUrls.splice(index, 1);
  // }

  /** Guardar (crear o editar) */
  onSubmit() {
    if (this.form.invalid) {
      this.toastr.error('Completa correctamente los campos obligatorios.');
      return;
    }

    if (this.mode === 'create') {
      this.createAnimal();
    } else {
      this.updateAnimal();
    }
  }

  private createAnimal() {
    this.loading = true;
    this.adminAnimalService
      .createAnimal(this.form.value, []) //Aqui estaba this.photoUrls en lugar del array.
      .subscribe({
        next: () => {                 // Aqui se supone que, en el parentesis, va "created".
          this.loading = false;
          this.toastr.success('Animal creado correctamente.');
          this.router.navigate(['/admin/animals']);
        },
        error: (err) => {
          this.loading = false;
          const msg = err.error?.message ?? 'No se pudo crear el animal.';
          this.toastr.error(msg);
        },
      });
  }

  private updateAnimal() {
    if (this.animalId == null) return;

    this.loading = true;
    this.adminAnimalService
      .updateAnimal(this.animalId, this.form.value, this.photoUrls)
      .subscribe({
        next: () => {
          this.loading = false;
          this.toastr.success('Animal actualizado correctamente.');
          this.router.navigate(['/admin/animals']);
        },
        error: (err) => {
          this.loading = false;
          const msg = err.error?.message ?? 'No se pudo actualizar el animal.';
          this.toastr.error(msg);
        },
      });
  }

  onCancel() {
    this.router.navigate(['/admin/animals']);
  }

  /** Pulsan el botón "Eliminar animal" */
  onClickDelete() {
    if (this.animalId == null) return;
    this.showDeleteDialog = true;
  }

  /** Confirman en el ConfirmActionDialog */
  onConfirmDelete() {
    if (this.animalId == null) return;

    this.showDeleteDialog = false;
    this.loading = true;

    this.adminAnimalService.deleteAnimal(this.animalId).subscribe({
      next: () => {
        this.loading = false;
        this.toastr.success('Animal eliminado correctamente.');
        this.router.navigate(['/admin/animals']);
      },
      error: (err) => {
        this.loading = false;
        const msg =
          err.error?.message ?? 'No se pudo eliminar el animal.';
        this.toastr.error(msg);
      },
    });
  }

  /** Cancelan el diálogo de confirmación */
  onCancelDeleteDialog() {
    this.showDeleteDialog = false;
  }
}
