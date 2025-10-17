import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostsService, Post } from '../../app/core/posts.service';
import { AuthService } from '../../app/core/auth.service';

type PagedResp<T> = { data:T[]; page:number; limit:number; total:number; totalPages:number };

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './content.component.html'
})
export class ContentComponent {
  private api  = inject(PostsService);
  private auth = inject(AuthService);

  // PERMISOS (usa 'ADMIN' en mayúsculas)
  isAdmin = computed(() => this.auth.hasRole?.('admin') === true);

  // UI
  viewMode = signal<'list'|'grid'|'table'>('grid');
  loading  = signal(false);
  error    = signal<string|undefined>(undefined);
  ok       = signal(false);

  // DATA
  posts = signal<Post[]>([]);
  // visible para la vista (usuarios no admin ocultan inactivos)
  visiblePosts = computed(() => this.isAdmin() ? this.posts() : this.posts().filter(p => p.state === 1));

  draft = { title:'', content:'' };

  // EDICIÓN
  editingId  = signal<number|null>(null);
  editDraft  = signal<{title:string; content:string}>({ title:'', content:'' });

  // PAGINACIÓN
  page = 1; limit = 10; total = 0; totalPages = 1;

  ngOnInit(){ this.load(1); }

  trackById = (_: number, p: Post) => p.id_posts;

  // --- helpers para signals (evita TS2353 en template) ---
  setEditTitle(v: string){ this.editDraft.update(d => ({ ...d, title:v })); }
  setEditContent(v: string){ this.editDraft.update(d => ({ ...d, content:v })); }

  // --- cargar/paginar ---
  private isPaged(res: unknown): res is PagedResp<Post> {
    return !!res && typeof res === 'object' && Array.isArray((res as any).data)
           && 'page' in (res as any) && 'total' in (res as any);
  }

  load(page = 1){
    this.loading.set(true);
    this.error.set(undefined);
    this.api.list({ page, limit: this.limit }).subscribe({
      next: (res: Post[] | PagedResp<Post>) => {
        const raw: Post[] = Array.isArray(res) ? res : (res?.data ?? []);
        // dedupe
        const map = new Map<number, Post>();
        raw.forEach(it => map.set(it.id_posts, it));
        const list = Array.from(map.values());
        this.posts.set(list);

        if (this.isPaged(res)) {
          this.page = res.page ?? 1;
          this.limit = res.limit ?? this.limit;
          this.total = res.total ?? list.length;
          this.totalPages = res.totalPages ?? Math.max(1, Math.ceil((this.total || list.length)/Math.max(1,this.limit)));
        } else {
          this.page = 1; this.total = list.length; this.totalPages = 1;
        }
        this.loading.set(false);
      },
      error: (e) => { this.loading.set(false); this.error.set(e?.error?.message ?? 'Error al cargar'); }
    });
  }

  goTo(p:number){
    if (p<1 || (this.totalPages && p>this.totalPages)) return;
    this.load(p);
  }

  // --- crear ---
  create(){
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
        this.draft = { title:'', content:'' };
        this.load(this.page);
      },
      error: (e) => { this.loading.set(false); this.error.set(e?.error?.message ?? 'Error al publicar'); }
    });
  }

  // --- edición / admin ---
  beginEdit(p: Post){
    if (!this.isAdmin()) return;
    this.editingId.set(p.id_posts);
    this.editDraft.set({ title: p.title, content: p.content });
  }

  cancelEdit(){
    this.editingId.set(null);
    this.editDraft.set({ title:'', content:'' });
  }

  saveEdit(p: Post){
    if (!this.isAdmin()) return;
    const d = this.editDraft();
    const title = d.title.trim();
    const content = d.content.trim();
    if (!title || !content) return;

    this.loading.set(true);
    this.api.update(p.id_posts, { title, content }).subscribe({
      next: () => { this.loading.set(false); this.editingId.set(null); this.load(this.page); },
      error: (e) => { this.loading.set(false); this.error.set(e?.error?.message ?? 'Error al actualizar'); }
    });
  }

  remove(p: Post){
    if (!this.isAdmin()) return;
    if (!confirm('¿Eliminar publicación?')) return;
    this.loading.set(true);
    this.api.remove(p.id_posts).subscribe({
      next: () => { this.loading.set(false); this.load(this.page); },
      error: (e) => { this.loading.set(false); this.error.set(e?.error?.message ?? 'Error al eliminar'); }
    });
  }

  // --- activar / desactivar (state 1/0) ---
  toggleState(p: Post){
    if (!this.isAdmin()) return;
    const newState = p.state === 1 ? 0 : 1;
    this.loading.set(true);
    this.api.update(p.id_posts, { state: newState as any }).subscribe({
      next: () => { this.loading.set(false); this.load(this.page); },
      error: (e) => { this.loading.set(false); this.error.set(e?.error?.message ?? 'No se pudo cambiar el estado'); }
    });
  }
}