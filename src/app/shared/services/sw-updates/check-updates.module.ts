import { NgModule, isDevMode } from '@angular/core';
import { ServiceWorkerModule, SwUpdate } from '@angular/service-worker';

import { CheckUpdatesService } from './check-updates.service';

@NgModule({
  declarations: [],
  imports: [
    ServiceWorkerModule.register('ngsw-worker.js', {
        enabled: !isDevMode()
    })
  ],
  providers: [CheckUpdatesService, SwUpdate]
})
export class CheckUpdatesModule { }
