import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AnimalService } from '../../../core/services/animal.service';
import { AnimalDetail } from '../../../core/models/animal.model';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';


@Component({
  selector: 'app-animal-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './animal-detail.component.html',
  styleUrls: ['./animal-detail.component.scss'],
})
export class AnimalDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private animalService = inject(AnimalService);
  private toastr = inject(ToastrService);

  animal: AnimalDetail | null = null;
  loading = false;

  // Carousel.
  currentPhotoIndex = 0;

  private auth = inject(AuthService);

  // Obtener usuario.
  get user(): User | null {
    return this.auth.getCurrentUser();
  }

  // Condición para permitir formulario de adopción.
  get canAdopt(): boolean {
    return !!this.user && this.user.firstLoginCompleted === true;
  }

  // Formulario de solicitud.
  adoptionForm = this.fb.group({
    message: ['', [Validators.required]],
  });

  get photos(): string[] {
    return this.animal?.photos?.map((p) => p.url) ?? [];
  }

  get currentPhotoUrl(): string {
    if (this.photos.length === 0) {
      return 'assets/images/animal/animal-placeholder.jpg';
    }
    return this.photos[this.currentPhotoIndex];
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.toastr.error('Identificador de animal no válido.');
      this.router.navigate(['/animals']);
      return;
    }

    const id = Number(idParam);
    if (Number.isNaN(id)) {
      this.toastr.error('Identificador de animal no válido.');
      this.router.navigate(['/animals']);
      return;
    }

    this.loadAnimal(id);
  }

  // Cargar animal.
  loadAnimal(id: number) {
    this.loading = true;
    this.animalService.getAnimalDetail(id).subscribe({
      next: (res) => {
        this.animal = res.animal;
        this.currentPhotoIndex = 0;
        this.loading = false;
      },
      error: (err) => {
        const msg =
          err.error?.message ??
          'No se pudo cargar la información del animal.';
        this.toastr.error(msg);
        this.loading = false;
        this.router.navigate(['/animals']);
      },
    });
  }

  // Navegación del carousel.
  onPrevPhoto() {
    if (this.photos.length === 0) return;
    this.currentPhotoIndex =
      (this.currentPhotoIndex - 1 + this.photos.length) % this.photos.length;
  }

  onNextPhoto() {
    if (this.photos.length === 0) return;
    this.currentPhotoIndex =
      (this.currentPhotoIndex + 1) % this.photos.length;
  }

    // Ir directamente a una foto concreta al hacer clic en un dot.
  goToPhoto(index: number) {
    if (!this.photos || index < 0 || index >= this.photos.length) return;
    this.currentPhotoIndex = index;
  }

  // Envío de solicitud de adopción.
  onSubmitAdoption() {
    if (!this.animal) return;

    if (this.adoptionForm.invalid) {
      this.toastr.error('Por favor, escribe un mensaje para la solicitud.');
      return;
    }

    const message = this.adoptionForm.value.message ?? '';

    this.animalService
      .sendAdoptionRequest(this.animal.id, message)
      .subscribe({
        next: () => {
          this.toastr.success(
            'Solicitud de adopción enviada correctamente.'
          );
          this.adoptionForm.reset();
          // Redirección al panel de solicitudes de usuario.
          this.router.navigate(['/adoptions/me']);
        },
        error: (err) => {
          const msg =
            err.error?.message ??
            'No se pudo enviar la solicitud de adopción.';
          this.toastr.error(msg);
        },
      });
  }
}
