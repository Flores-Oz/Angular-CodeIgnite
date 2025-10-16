import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {jwtDecode} from 'jwt-decode';

type LoginResponse = { token: string; user?: any };
type JWTPayload = { sub?: string; exp?: number; roles?: string[]; [k: string]: any };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/auth`;
  private tokenKey = 'token';

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.base}/login`, { email, password });
  }

  saveToken(t: string) { localStorage.setItem(this.tokenKey, t); }
  get token(): string { return localStorage.getItem(this.tokenKey) || ''; }

  get payload(): JWTPayload | null {
    if (!this.token) return null;
    try { return jwtDecode<JWTPayload>(this.token); } catch { return null; }
  }

  logout() { localStorage.removeItem(this.tokenKey); }

  isLogged(): boolean {
    const p = this.payload;
    return !!p?.exp && (Date.now() / 1000) < p.exp;
  }

  hasRole(role: string): boolean {
    const roles = this.payload?.roles || [];
    return roles.includes(role);
  }
}