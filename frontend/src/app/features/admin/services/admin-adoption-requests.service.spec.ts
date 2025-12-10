import { TestBed } from '@angular/core/testing';

import { AdminAdoptionRequestsService } from './admin-adoption-requests.service';

describe('AdminAdoptionRequestsService', () => {
  let service: AdminAdoptionRequestsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminAdoptionRequestsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
