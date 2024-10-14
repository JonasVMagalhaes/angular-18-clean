import {Auth} from "@entities/auth/dtos/auth";
import {PrimitiveSignInResponse} from "@models/primitives/sign-in/sign-in-response.interface";
import {AuthCredentials} from "@entities/auth/models/auth-credentials.interface";
import {PrimitiveSignInRequest} from "@models/primitives/sign-in/sign-in-request.interface";

describe(Auth.name, () => {
  describe('constructor', () => {
    it('Must be instanciate constructor', () => {
      const authResponse: PrimitiveSignInResponse = {
        access_token: 'access_token',
        expires_in: 3600,
      }

      const auth: Auth = new Auth(authResponse);

      expect(auth.accessToken).toBe(authResponse.access_token);
      expect(auth.expireTime).toBe(authResponse.expires_in);
    });
  });

  describe('toDto', () => {
    it('Must be return intance of PrimitiveSignInRequest', () => {
      const authCredentials: AuthCredentials = {
        username: 'username',
        password: 'password',
      }

      const toDto: PrimitiveSignInRequest = Auth.toDto(authCredentials);

      expect(toDto.username).toBe(authCredentials.username);
      expect(toDto.password).toBe(authCredentials.password);
    });
  });

  describe('fromDto', () => {
    it('Must be return intance of Autht', () => {
      const signResponse: PrimitiveSignInResponse = {
        access_token: 'access_token',
        expires_in: 3600,
      }

      const fromDto: Auth = Auth.fromDto(signResponse);

      expect(fromDto.accessToken).toBe(signResponse.access_token);
      expect(fromDto.expireTime).toBe(signResponse.expires_in);
    });
  });
});
