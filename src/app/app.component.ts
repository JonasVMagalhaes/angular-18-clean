import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import {HttpClientAdapterModule} from "@adapters/http-client/http-client-adapter";
import {AuthService} from "@entities/auth/services/auth.service";
import { CheckUpdatesModule } from '@services/sw-updates/check-updates.module';
import { CheckUpdatesService } from '@services/sw-updates/check-updates.service';
import {MessageService} from "@services/message/message.service";
import {CacheService} from "@services/cache/cache.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CheckUpdatesModule,
    HttpClientAdapterModule
  ],
  providers: [
    AuthService,
    CacheService,
    MessageService
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  constructor(private readonly checkUpdatesService: CheckUpdatesService) { }

  ngOnInit(): void {
    this.checkUpdatesService.checkVersions();
  }
}
