// src/app/core/users.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface UserDTO {
  id_users: number;
  name_users: string;
  email: string;
  estado: number;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/users`;

  list() {
    return this.http.get<UserDTO[]>(this.base);
  }

  get(id: number) {
    return this.http.get<UserDTO>(`${this.base}/${id}`);
  }

  create(data: { name_users: string; email: string; password: string }) {
    return this.http.post(`${this.base}`, data);
  }

  update(id: number, data: Partial<{ name_users: string; email: string; password: string; estado: number }>) {
    return this.http.put(`${this.base}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete(`${this.base}/${id}`);
  }
}
