import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type Post = {
  id_posts:number; title:string; content:string;
  state:number; created_at:string;
  author?:string; author_email?:string;
};

// tipo para respuesta paginada (si el backend ya la devuelve)
export type Paged<T> = {
  data: T[]; page: number; limit: number; total: number; totalPages: number;
};

@Injectable({ providedIn: 'root' })
export class PostsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/posts`;

  // ahora acepta params opcionales y puede devolver Post[] o Paged<Post>
  list(params?: { page?: number; limit?: number }) {
    return this.http.get<Post[] | Paged<Post>>(this.base, { params: params as any });
  }

  mine() { return this.http.get<Post[]>(`${this.base}/mine`); }
  create(data: {title:string; content:string}) { return this.http.post<Post>(this.base, data); }
}