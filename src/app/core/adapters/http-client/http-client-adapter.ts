import { NgModule } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientMock } from '@assets/mocks/http-client-mock';
import {environment} from "../../../../environments/environment";

@NgModule({
  declarations: [],
  imports: [],
  providers: [
    {
      provide: HttpClient,
      useClass: environment.production ? HttpClient : HttpClientMock
    },
  ]
})
export class HttpClientAdapterModule { }
