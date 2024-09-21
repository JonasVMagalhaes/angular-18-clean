import { Observable } from "rxjs";

export abstract class CacheStrategy {
    abstract save(key: string, value: string, daysToExpire: number): Observable<void>;
    abstract get(key: string): Observable<string>;
    abstract getValue(key: string): string;
    abstract update(key: string, value: string, daysToExpire: number): Observable<void>;
    abstract delete(key: string): Observable<void>;
}
