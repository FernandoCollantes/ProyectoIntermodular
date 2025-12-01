import { TestBed } from '@angular/core/testing';

import { Pregunta } from './pregunta';

describe('Pregunta', () => {
  let service: Pregunta;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Pregunta);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
