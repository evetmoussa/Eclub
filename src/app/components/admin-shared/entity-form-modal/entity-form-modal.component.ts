// entity-form-modal.component.ts — Generic Add/Edit modal for admin lists.

import {
  Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators
} from '@angular/forms';

export type FieldType = 'text' | 'email' | 'tel' | 'number' | 'url' | 'date' | 'textarea' | 'select';

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: { value: string | number; label: string }[];
  min?: number;
  max?: number;
  hint?: string;
  width?: 'full' | 'half';
}

@Component({
  selector: 'app-entity-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './entity-form-modal.component.html',
  styleUrl: './entity-form-modal.component.scss'
})
export class EntityFormModalComponent implements OnChanges {
  private fb = inject(FormBuilder);

  @Input() title = 'Add Entity';
  @Input() subtitle = '';
  @Input() submitLabel = 'Save';
  @Input() fields: FieldDef[] = [];
  /** Optional initial values — when set, the modal is treated as Edit.
   *  Accepts any entity object — keys are looked up dynamically. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() initial: { [k: string]: any } | null = null;
  @Input() isSubmitting = false;

  @Output() submitted = new EventEmitter<Record<string, unknown>>();
  @Output() cancelled = new EventEmitter<void>();

  form: FormGroup = this.fb.group({});

  ngOnChanges(c: SimpleChanges): void {
    if (c['fields'] || c['initial']) this.rebuildForm();
  }

  private rebuildForm(): void {
    const group: Record<string, FormControl> = {};
    for (const f of this.fields) {
      const validators = f.required ? [Validators.required] : [];
      if (f.type === 'email') validators.push(Validators.email);
      if (f.type === 'number' && f.min !== undefined) validators.push(Validators.min(f.min));
      if (f.type === 'number' && f.max !== undefined) validators.push(Validators.max(f.max));
      group[f.key] = new FormControl(this.initialValue(f), validators);
    }
    this.form = this.fb.group(group);
  }

  /** Normalise an incoming value to what each control type expects. */
  private initialValue(f: FieldDef): unknown {
    const raw = this.initial?.[f.key];
    if (raw === null || raw === undefined) return '';
    // <select> matches options by string; a numeric initial would never match.
    if (f.type === 'select') return String(raw);
    // <input type="date"> needs yyyy-MM-dd; trim any ISO/time suffix.
    if (f.type === 'date' && typeof raw === 'string') return raw.slice(0, 10);
    return raw;
  }

  onSubmit(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitted.emit(this.form.value);
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onBackdrop(evt: MouseEvent): void {
    if ((evt.target as HTMLElement).classList.contains('efm-backdrop')) {
      this.onCancel();
    }
  }

  hasError(key: string): boolean {
    const ctrl = this.form.get(key);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }
}
