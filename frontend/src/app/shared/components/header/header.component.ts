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
  @Input() cycle: 'DAM' | 'DAW' | null = null;

  @Output() logout = new EventEmitter<void>();
  @Output() switchCycle = new EventEmitter<void>();

  get iniciales(): string {
    if (!this.user?.name) return '??';
    return this.user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
  }
}