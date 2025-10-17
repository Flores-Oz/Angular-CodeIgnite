import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type Role = { id_roles: number; name_roles: string; state: number };

@Injectable({ providedIn: 'root' })
export class RolesService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/roles`;

  list() {
    return this.http.get<Role[]>(this.base);
  }

  create(data: { name_roles: string }) {
    return this.http.post<Role>(this.base, data);
  }

  update(id: number, data: Partial<Role>) {
    return this.http.put<Role>(`${this.base}/${id}`, data);
  }

  remove(id: number) {
    return this.http.delete(`${this.base}/${id}`);
  }
}
