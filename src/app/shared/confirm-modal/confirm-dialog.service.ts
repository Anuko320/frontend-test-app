import { Injectable, Injector } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

import { ConfirmDialogComponent } from './confirm-dialog.component';
import { DialogRef } from './confirm-dialog-ref';

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  constructor(
    private overlay: Overlay,
    private injector: Injector
  ) {}

  open() {
    const overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'dark-backdrop',
      positionStrategy: this.overlay.position()
        .global()
        .centerHorizontally()
        .centerVertically()
    });

    const dialogRef = new DialogRef<boolean>();

    const injector = Injector.create({
      parent: this.injector,
      providers: [
        { provide: DialogRef, useValue: dialogRef }
      ]
    });

    const portal = new ComponentPortal(
      ConfirmDialogComponent,
      null,
      injector
    );

    overlayRef.attach(portal);

    overlayRef.backdropClick().subscribe(() => {
      dialogRef.close(false);
      overlayRef.dispose();
    });

    dialogRef.afterClosed().subscribe(() => {
      overlayRef.dispose();
    });

    return dialogRef.afterClosed();
  }
}