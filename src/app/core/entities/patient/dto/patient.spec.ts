import {Patient} from "@entities/patient/dto/patient";
import {PrimitivePatientResponse} from "@models/primitives/patient/patient-response.interface";

describe(Patient.name, () => {
  describe('constructor', () => {
    it('Must be instanciate constructor', () => {
      const signResponse: PrimitivePatientResponse = {
        id: '123',
        personalName: 'personalName',
        image: 'image',
        nickName: 'nickName',
        birthDate: 'birthDate'
      }

      const patient: Patient = new Patient(signResponse);

      expect(patient.id).toBe(signResponse.id);
      expect(patient.personalName).toBe(signResponse.personalName);
      expect(patient.image).toBe(signResponse.image);
      expect(patient.nickName).toBe(signResponse.nickName);
      expect(patient.birthDate).toBe(signResponse.birthDate);
    });
  });

  describe('fromDto', () => {
    it('Must be return intance of Autht', () => {
      const signResponse: PrimitivePatientResponse = {
        id: 'id',
        personalName: 'personalName',
        image: 'image',
        nickName: 'nickName',
        birthDate: 'birthDate'
      }

      const fromDto: Patient = Patient.fromDto(signResponse);

      expect(fromDto.id).toBe(signResponse.id);
      expect(fromDto.personalName).toBe(signResponse.personalName);
      expect(fromDto.image).toBe(signResponse.image);
      expect(fromDto.nickName).toBe(signResponse.nickName);
      expect(fromDto.birthDate).toBe(signResponse.birthDate);
    });
  });
});
