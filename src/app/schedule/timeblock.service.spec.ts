import { TestBed } from '@angular/core/testing';

import { TimeBlockService } from './timeblock.service';

describe('ScheduleService', () => {
  let service: TimeBlockService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimeBlockService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
