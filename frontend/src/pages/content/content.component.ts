import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostsService, Post } from '../../app/core/posts.service';

// Tipo local para respuesta paginada (no necesitas importarlo de otro lado)
type PagedResp<T> = {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './content.component.html'
})
export class ContentComponent {
  private api = inject(PostsService);

  // estado UI
  viewMode = signal<'list' | 'grid' | 'table'>('grid'); // grid por defecto
  loading = signal(false);
  error = signal<string | undefined>(undefined);
  ok = signal(false);

  // datos
  posts = signal<Post[]>([]);
  draft = { title: '', content: '' };

  // paginación
  page = 1;
  limit = 10;
  total = 0;
  totalPages = 1;

  ngOnInit() {
    this.load(1);
  }

  trackById = (_: number, p: Post) => p.id_posts;

  // Type guard para detectar si es una respuesta paginada
  private isPaged(res: unknown): res is PagedResp<Post> {
    return !!res && typeof res === 'object' && Array.isArray((res as any).data)
      && 'page' in (res as any) && 'total' in (res as any);
  }

  load(page = 1) {
    this.loading.set(true);
    this.error.set(undefined);

    this.api.list({ page, limit: this.limit }).subscribe({
      next: (res: Post[] | PagedResp<Post>) => {
        // Normaliza a array
        const raw: Post[] = Array.isArray(res) ? res : (res?.data ?? []);

        // DEDUPLICA por id_posts, por si llegaran repetidos
        const unique = new Map<number, Post>();
        for (const it of raw) unique.set(it.id_posts, it);
        const list = Array.from(unique.values());

        // Reemplaza (no acumula)
        this.posts.set(list);

        // Paginación si viene; si no, una sola página
        if (this.isPaged(res)) {
          this.page = res.page ?? 1;
          this.limit = res.limit ?? this.limit;
          this.total = res.total ?? list.length;
          this.totalPages = res.totalPages ?? Math.max(1, Math.ceil((this.total || list.length) / Math.max(1, this.limit)));
        } else {
          this.page = 1;
          this.total = list.length;
          this.totalPages = 1;
        }

        // Debug opcional
        // console.log('[Content] load()', { page: this.page, listLen: list.length, total: this.total });

        this.loading.set(false);
      },
      error: (e) => {
        this.loading.set(false);
        this.error.set(e?.error?.message ?? 'Error al cargar');
      }
    });
  }

  goTo(p: number) {
    if (p < 1 || (this.totalPages && p > this.totalPages)) return;
    this.load(p);
  }

  create() {
    const title = this.draft.title.trim();
    const content = this.draft.content.trim();
    if (!title || !content) return;

    this.loading.set(true);
    this.error.set(undefined);
    this.ok.set(false);

    this.api.create({ title, content }).subscribe({
      next: () => {
        this.ok.set(true);
        this.loading.set(false);
        this.draft = { title: '', content: '' };
        // recarga manteniendo la página actual
        this.load(this.page);
      },
      error: (e) => {
        this.loading.set(false);
        this.error.set(e?.error?.message ?? 'Error al publicar');
      }
    });
  }
}