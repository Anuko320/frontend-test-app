import { Observable, Subject } from 'rxjs';

export class DialogRef<T = unknown> {
  private readonly closed$ = new Subject<T | undefined>();

  afterClosed(): Observable<T | undefined> {
    return this.closed$.asObservable();
  }

  close(result?: T): void {
    this.closed$.next(result);
    this.closed$.complete();
  }
}
