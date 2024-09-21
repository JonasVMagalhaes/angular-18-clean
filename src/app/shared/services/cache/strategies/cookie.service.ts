import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { CacheStrategy } from '../models/cache-strategy';

@Injectable({
    providedIn: 'root'
})
export class CookieService implements CacheStrategy {
    save(key: string, value: string, daysToExpire: number): Observable<void> {
        const expires = new Date();
        expires.setTime(expires.getTime() + (daysToExpire * 24 * 60 * 60 * 1000));
        document.cookie = `${key}=${value};expires=${expires.toUTCString()};path=/`;
        return of(undefined);
    }

    get(key: string): Observable<string> {
        const name = `${key}=`;
        const decodedCookie = decodeURIComponent(document.cookie);
        const cookieArray = decodedCookie.split(';');
        for (let i = 0; i < cookieArray.length; i++) {
            let cookie = cookieArray[i];
            while (cookie.charAt(0) === ' ') {
                cookie = cookie.substring(1);
            }
            if (cookie.indexOf(name) === 0) {
                return of(cookie.substring(name.length, cookie.length));
            }
        }
        return of('');
    }

    getValue(key: string): string {
        const name = `${key}=`;
        const decodedCookie = decodeURIComponent(document.cookie);
        const cookieArray = decodedCookie.split(';');
        for (let i = 0; i < cookieArray.length; i++) {
            let cookie = cookieArray[i];
            while (cookie.charAt(0) === ' ') {
                cookie = cookie.substring(1);
            }
            if (cookie.indexOf(name) === 0) {
                return cookie.substring(name.length, cookie.length);
            }
        }
        return '';
    }

    update(key: string, value: string, daysToExpire: number): Observable<void> {
        this.save(key, value, daysToExpire);
        return of(undefined);
    }

    delete(key: string): Observable<void> {
        document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
        return of(undefined);
    }
}

