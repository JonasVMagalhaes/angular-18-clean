import { ApplicationRef, Injectable } from '@angular/core';
import { SwUpdate, VersionEvent } from '@angular/service-worker';

import { first, interval, concat } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckUpdatesService {
  constructor(private readonly appRef: ApplicationRef,
              private readonly updates: SwUpdate) { }

  public checkVersions(): void {
    if(this.updates.isEnabled) {
      this.updates.versionUpdates.subscribe((event: VersionEvent) => {
        if (event.type === "VERSION_DETECTED") {
          console.log("Version Detected");
          if (confirm("Gostaria de atualizar para a nova versão?")) {
            this.updates.activateUpdate().then(() => window.location.reload());
          }
        }
      });

      const appIsStable$ = this.appRef.isStable.pipe(first(isStable => isStable === true));
      const every1Hour$ = interval(60 * 60 * 1000);
      const checkUpdateVersion$ = concat(appIsStable$, every1Hour$);

      checkUpdateVersion$.subscribe(() => this.updates.checkForUpdate());
    } 
  }
}
