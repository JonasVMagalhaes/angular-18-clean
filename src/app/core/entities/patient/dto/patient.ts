import {PrimitivePatientResponse} from "@models/primitives/patient/patient-response.interface";

export class Patient {
  id: string;
  personalName: string;
  nickName: string;
  birthDate: string;

  constructor(patientResponse: PrimitivePatientResponse) {
    this.id = patientResponse.id;
    this.personalName = patientResponse.personalName;
    this.nickName = patientResponse.nickName;
    this.birthDate = patientResponse.birthDate;
  }

  static fromDto(patientResponse: PrimitivePatientResponse): Patient {
    return new Patient(patientResponse);
  }
}
