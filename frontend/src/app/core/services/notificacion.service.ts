import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Notificacion {
  mensaje: string;
  tipo: 'exito' | 'error';
}

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private notificacionSubject = new Subject<Notificacion>();
  notificacion$ = this.notificacionSubject.asObservable();

  mostrar(mensaje: string, tipo: 'exito' | 'error' = 'exito') {
    this.notificacionSubject.next({ mensaje, tipo });
  }
}