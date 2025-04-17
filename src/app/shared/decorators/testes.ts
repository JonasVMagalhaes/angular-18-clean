import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { BlockUntilComplete, ShareExecution } from '../src/decorators'; // Ajuste o caminho

describe('Decorators', () => {
  let logger: jasmine.Spy;

  beforeEach(() => {
    logger = jasmine.createSpy('logger');
  });

  describe('BlockUntilComplete', () => {
    it('should block concurrent calls and return EMPTY', (done) => {
      class TestClass {
        @BlockUntilComplete(logger)
        fetchData(): Observable<string> {
          return of('data').pipe(delay(100));
        }
      }

      const instance = new TestClass();
      let firstResult: string | undefined;
      let secondResult: string | undefined;

      instance.fetchData().subscribe({
        next: (value) => (firstResult = value),
        complete: () => {
          expect(firstResult).toBe('data');
          expect(secondResult).toBeUndefined();
          expect(logger).toHaveBeenCalledWith(
            'Method fetchData is already executing. Returning EMPTY.'
          );
          done();
        },
      });

      instance.fetchData().subscribe({
        next: (value) => (secondResult = value),
        complete: () => {
          // EMPTY completa imediatamente
          expect(secondResult).toBeUndefined();
        },
      });
    });

    it('should allow new call after first completes', (done) => {
      class TestClass {
        @BlockUntilComplete(logger)
        fetchData(): Observable<string> {
          return of('data').pipe(delay(100));
        }
      }

      const instance = new TestClass();
      let firstResult: string | undefined;
      let secondResult: string | undefined;

      instance.fetchData().subscribe({
        next: (value) => (firstResult = value),
        complete: () => {
          setTimeout(() => {
            instance.fetchData().subscribe({
              next: (value) => (secondResult = value),
              complete: () => {
                expect(firstResult).toBe('data');
                expect(secondResult).toBe('data');
                expect(logger).not.toHaveBeenCalled();
                done();
              },
            });
          }, 50); // Após a conclusão da primeira
        },
      });
    });

    it('should throw error if method does not return Observable', () => {
      class TestClass {
        @BlockUntilComplete(logger)
        fetchData(): any {
          return 'not an observable';
        }
      }

      const instance = new TestClass();
      expect(() => instance.fetchData()).toThrowError(
        'Method fetchData must return an Observable'
      );
    });

    it('should use custom logger', (done) => {
      class TestClass {
        @BlockUntilComplete(logger)
        fetchData(): Observable<string> {
          return of('data').pipe(delay(100));
        }
      }

      const instance = new TestClass();
      instance.fetchData().subscribe();
      instance.fetchData().subscribe({
        complete: () => {
          expect(logger).toHaveBeenCalledWith(
            'Method fetchData is already executing. Returning EMPTY.'
          );
          done();
        },
      });
    });
  });

  describe('ShareExecution', () => {
    it('should share execution between concurrent calls without cooldown', (done) => {
      class TestClass {
        @ShareExecution(undefined, logger)
        fetchData(): Observable<string> {
          return of('data').pipe(delay(100));
        }
      }

      const instance = new TestClass();
      let firstResult: string | undefined;
      let secondResult: string | undefined;

      instance.fetchData().subscribe({
        next: (value) => (firstResult = value),
        complete: () => {
          expect(firstResult).toBe('data');
          expect(secondResult).toBe('data');
          expect(logger).not.toHaveBeenCalled();
          done();
        },
      });

      instance.fetchData().subscribe({
        next: (value) => (secondResult = value),
      });
    });

    it('should cache result when cooldownTime is set', (done) => {
      class TestClass {
        @ShareExecution(200, logger)
        fetchData(): Observable<string> {
          return of('data').pipe(delay(100));
        }
      }

      const instance = new TestClass();
      let firstResult: string | undefined;
      let secondResult: string | undefined;

      instance.fetchData().subscribe({
        next: (value) => (firstResult = value),
        complete: () => {
          setTimeout(() => {
            instance.fetchData().subscribe({
              next: (value) => (secondResult = value),
              complete: () => {
                expect(firstResult).toBe('data');
                expect(secondResult).toBe('data');
                expect(logger).not.toHaveBeenCalled();
                done();
              },
            });
          }, 50); // Dentro do período de cache
        },
      });
    });

    it('should execute new call after cooldown expires', (done) => {
      class TestClass {
        @ShareExecution(100, logger)
        fetchData(): Observable<string> {
          return of('data').pipe(delay(50));
        }
      }

      const instance = new TestClass();
      let firstResult: string | undefined;
      let secondResult: string | undefined;

      instance.fetchData().subscribe({
        next: (value) => (firstResult = value),
        complete: () => {
          setTimeout(() => {
            instance.fetchData().subscribe({
              next: (value) => (secondResult = value),
              complete: () => {
                expect(firstResult).toBe('data');
                expect(secondResult).toBe('data');
                expect(logger).not.toHaveBeenCalled();
                done();
              },
            });
          }, 150); // Após o cooldown
        },
      });
    });

    it('should return EMPTY if no active result', (done) => {
      class TestClass {
        @ShareExecution(undefined, logger)
        fetchData(): Observable<string> {
          return of('data').pipe(delay(100));
        }
      }

      const instance = new TestClass();
      instance.fetchData().subscribe(); // Inicia execução
      instance.fetchData().subscribe({
        next: (value) => {
          expect(value).toBe('data');
          expect(logger).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it('should throw error for negative cooldownTime', () => {
      expect(() => {
        class TestClass {
          @ShareExecution(-1, logger)
          fetchData(): Observable<string> {
            return of('data');
          }
        }
        new TestClass();
      }).toThrowError('cooldownTime must be a non-negative number');
    });

    it('should throw error if method does not return Observable', () => {
      class TestClass {
        @ShareExecution(undefined, logger)
        fetchData(): any {
          return 'not an observable';
        }
      }

      const instance = new TestClass();
      expect(() => instance.fetchData()).toThrowError(
        'Method fetchData must return an Observable'
      );
    });

    it('should use custom logger', (done) => {
      class TestClass {
        @ShareExecution(100, logger)
        fetchData(): Observable<string> {
          return of('data').pipe(delay(50));
        }
      }

      const instance = new TestClass();
      instance.fetchData().subscribe();
      instance.fetchData().subscribe({
        next: (value) => {
          expect(value).toBe('data');
          expect(logger).not.toHaveBeenCalled();
          done();
        },
      });
    });
  });
});