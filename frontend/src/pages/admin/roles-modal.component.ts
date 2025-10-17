import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-roles-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './roles-modal.component.html'
})
export class RolesModalComponent {
  @Input() userName = '';
  @Input() availableRoles: string[] = [];
  @Input() selected: Set<string> = new Set<string>();

  @Output() cancel = new EventEmitter<void>();
  @Output() save   = new EventEmitter<string[]>();

  // mapa role -> checked
  model = signal<Record<string, boolean>>({});

  ngOnChanges() {
    const m: Record<string, boolean> = {};
    for (const r of this.availableRoles) m[r] = this.selected?.has(r) ?? false;
    this.model.set(m);
  }

  // Helpers para plantilla
  isChecked(r: string) { return !!this.model()[r]; }
  setChecked(r: string, val: boolean) {
    const next = { ...this.model() };
    next[r] = val;
    this.model.set(next);
  }

  onSave() {
    const out = Object.entries(this.model())
      .filter(([_, v]) => v)
      .map(([k]) => k);
    this.save.emit(out);
  }
}