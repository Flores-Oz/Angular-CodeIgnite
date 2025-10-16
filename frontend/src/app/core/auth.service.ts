import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {jwtDecode} from 'jwt-decode';

type LoginResponse = {
  access_token: string;   //  backend llama 
  token_type: string;     // "Bearer"
  expires_in: number;     // en segundos
  user: { id:number; name:string; email:string; roles:string[] };
};

type JWTPayload = {
  exp?: number;
  iat?: number;
  nbf?: number;
  iss?: string;
  uid?: number;
  email?: string;
  roles?: string[];
  [k: string]: any;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/auth`;     // /api/auth
  private tokenKey = 'token';

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.base}/login`, { email, password });
  }

  saveTokenFromLogin(r: LoginResponse) {
    // Guarda solo el JWT; el tipo ya es Bearer y lo ponemos en el header con el interceptor
    localStorage.setItem(this.tokenKey, r.access_token);
  }

  get token(): string { return localStorage.getItem(this.tokenKey) || ''; }

  get payload(): JWTPayload | null {
    if (!this.token) return null;
    try { return jwtDecode<JWTPayload>(this.token); } catch { return null; }
  }

  logout() { localStorage.removeItem(this.tokenKey); }

  isLogged(): boolean {
    const p = this.payload;
    return !!p?.exp && (Date.now()/1000) < p.exp;
  }

  hasRole(role: string): boolean {
    const roles = this.payload?.roles || [];
    return roles.includes(role);
  }

  me() {
    // Tu backend expuso GET /api/auth/me
    return this.http.get<{ user: any }>(`${this.base}/me`);
  }
}