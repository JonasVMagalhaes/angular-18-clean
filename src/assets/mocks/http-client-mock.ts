import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { AuthCredentials } from "@entities/auth/models/auth-credentials.interface";
import { Primitive } from "@enums/primitives/primitive.enum";
import { SignCodeErrors } from "@enums/primitives/sign-code-errors-enum";
import { PrimitiveRegisterResponse } from "@models/primitives/register/register-response.interface";
import { PrimitiveSignInResponse } from "@models/primitives/sign-in/sign-in-response.interface";
import { ErrorRequisition } from "@models/requisitions/error-requisition";
import { Observable, of, throwError } from "rxjs";
import {PrimitiveScheduleResponse} from "@models/primitives/schedule/schedule-response.interface";
import {PrimitivePatientResponse} from "@models/primitives/patient/patient-response.interface";

@Injectable()
export class HttpClientMock extends HttpClient {
    override post(url: string, body: any | null, options: any): Observable<any> {
      switch(url) {
            case Primitive.SIGN: return MockPrimitives.postSign(body);
            case Primitive.REGISTER: return MockPrimitives.postRegister(body);
            default: super.post(url, body, options);
        }

        return super.post(url, body, options);
    }

    override get(url: string): Observable<any> {
      switch(url) {
        case Primitive.SCHEDULE: return MockPrimitives.getSchedule();
        case Primitive.PATIENT: return MockPrimitives.getPatient();
        default: super.get(url);
      }

      return super.get(url);
    }
}

class MockPrimitives {
    static postSign(body: AuthCredentials): Observable<PrimitiveSignInResponse> {
        const validUsers = [
            { username: "jonas", password: "123" },
            { username: "moises", password: "124" }
        ]

        const errorUnauthorized: ErrorRequisition<{}> = {
            status: 401,
            code: SignCodeErrors.CREEDENTIALS_NOT_MATCH,
            message: "Error nas credenciais"
        }

        if(validUsers.some((validUser: any) => validUser.username === body.username && validUser.password === body.password)){
            return of({ access_token: '123456789', expires_in: new Date().getDate() });
        } else {
            return throwError(() => errorUnauthorized);
        }
    }

    static postRegister(body: any | null): Observable<PrimitiveRegisterResponse> {
        const validUsers = [
            { username: "jonas", password: "MinhaSenha123$" },
            { username: "moises", password: "MinhaSenha124$" }
        ]

        const errorUnauthorized: ErrorRequisition<{}> = {
            status: 401,
            code: SignCodeErrors.CREEDENTIALS_NOT_MATCH,
            message: "Error na criação do cadastro"
        }

        const errorServidor: ErrorRequisition<{}> = {
            status: 500,
            code: SignCodeErrors.INTERNAL_SERVER_ERROR,
            message: "INTERNAL SERVER ERROR"
        }

        const errorDataBadFormatted: ErrorRequisition<{}> = {
            status: 400,
            code: SignCodeErrors.INTERNAL_SERVER_ERROR,
            message: "Algum dos dados está errado"
        }

        if(body.username === "ERROR501") {
            return throwError(() => errorServidor)
        }

        if(body.username === "ERROR400") {
            return throwError(() => errorDataBadFormatted)
        }

        if(validUsers.some((validUser: any) => validUser.username === body.username && validUser.password === body.password)){
            return of({ access_token: '123456789', expires_in: new Date().getDate()});
        } else {
            return throwError(() => errorUnauthorized);
        }
    }

    static getSchedule(): Observable<PrimitiveScheduleResponse> {
      console.log('Schedule')
      return of({});
    }

    static getPatient(): Observable<PrimitivePatientResponse> {
      return of({
        id: "123",
        personalName: "João Gabriel",
        nickName: "Biel",
        birthDate: "17/12/2021",
        image: ""
      })
    }
}
