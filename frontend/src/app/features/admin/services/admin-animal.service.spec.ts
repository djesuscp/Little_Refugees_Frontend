import { TestBed } from '@angular/core/testing';

import { AdminAnimalService } from './admin-animal.service';

describe('AdminAnimalService', () => {
  let service: AdminAnimalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminAnimalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
