/* ─── Widget Registry ─────────────────────────────────────────────────── */
import type { WidgetRegistration, WidgetCategory } from './types';

class WidgetRegistryClass {
  private _map = new Map<string, WidgetRegistration>();

  register(reg: WidgetRegistration) {
    this._map.set(reg.type, reg);
  }

  get(type: string): WidgetRegistration | undefined {
    return this._map.get(type);
  }

  all(): WidgetRegistration[] {
    return Array.from(this._map.values());
  }

  byCategory(category: WidgetCategory): WidgetRegistration[] {
    return this.all().filter(r => r.category === category);
  }

  search(query: string): WidgetRegistration[] {
    const q = query.toLowerCase();
    return this.all().filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  types(): string[] {
    return Array.from(this._map.keys());
  }
}

export const WidgetRegistry = new WidgetRegistryClass();
