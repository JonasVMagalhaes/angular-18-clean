import { TestBed } from '@angular/core/testing';

import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting, TestRequest } from "@angular/common/http/testing";
import { Primitive } from "@enums/primitives/primitive.enum";
import { PatientService } from "@entities/patient/services/patient.service";
import { PrimitivePatientResponse } from "@models/primitives/patient/patient-response.interface";
import { Patient } from "@entities/patient/dto/patient";

describe(PatientService.name, () => {
  let service: PatientService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ],
    });
  });

  beforeEach(() => {
    service = TestBed.inject(PatientService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPatient', () => {
    let spyFromDto: jasmine.Spy;

    beforeEach(() => {
      spyFromDto = spyOn(Patient, 'fromDto');
    });

    it("must bem call dtos", () => {
      const patientId: string = '1';

      service.getPatient(patientId)
        .subscribe(() => {
          expect(spyFromDto).toHaveBeenCalledTimes(1);
        });

      const req: TestRequest = httpTesting.expectOne({
        method: 'GET',
        url: Primitive.PATIENT + "/" + patientId
      });

      req.flush({} as PrimitivePatientResponse);
    });
  });
});
