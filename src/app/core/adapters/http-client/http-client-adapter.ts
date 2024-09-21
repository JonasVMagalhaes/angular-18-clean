import { NgModule } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { HttpClientMock } from '@assets/mocks/http-client-mock';

@NgModule({
    declarations: [],
    imports: [],
    providers: [
        {
            provide: HttpClient,
            useClass: HttpClientMock
        },
    ]
})
export class HttpClientAdapterModule { }
