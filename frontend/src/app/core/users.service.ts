// src/app/core/users.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type User = { id_users:number; name_users:string; email:string; state:number; roles?:string[] };

@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/users`;

  list() { return this.http.get<User[]>(this.base); }
  create(data: {name_users:string; email:string; password:string}) { return this.http.post<User>(this.base, data); }
  update(id:number, data: Partial<User>) { return this.http.put<User>(`${this.base}/${id}`, data); }
  remove(id:number) { return this.http.delete(`${this.base}/${id}`); }

  rolesOf(userId:number){ return this.http.get<string[]>(`${this.base}/${userId}/roles`); }
  setRoles(userId:number, roles:string[]){ return this.http.put(`${this.base}/${userId}/roles`, { roles }); }
}