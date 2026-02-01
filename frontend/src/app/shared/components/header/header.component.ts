import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Input() titulo: string = 'ExamGen';
  @Input() user: User | null = null;
  // cycle input removed

  @Output() logout = new EventEmitter<void>();
  // switchCycle output removed

  get iniciales(): string {
    if (!this.user?.nombre) return '??';
    return this.user.nombre.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
  }
}