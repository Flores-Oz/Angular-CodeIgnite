import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostsService, Post } from '../../app/core/posts.service';
import { AuthService } from '../../app/core/auth.service';
import Swal from 'sweetalert2';

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
  // No admin: oculta inactivos
  visiblePosts = computed(() => this.isAdmin() ? this.posts() : this.posts().filter(p => p.state == 1));

  draft = { title:'', content:'' };

  // EDICIÓN
  editingId  = signal<number|null>(null);
  editDraft  = signal<{title:string; content:string}>({ title:'', content:'' });

  // PAGINACIÓN
  page = 1; limit = 10; total = 0; totalPages = 1;

  ngOnInit(){ this.load(1); }

  trackById = (_: number, p: Post) => p.id_posts;

  // helpers para signals (evita TS2353 en template)
  setEditTitle(v: string){ this.editDraft.update(d => ({ ...d, title:v })); }
  setEditContent(v: string){ this.editDraft.update(d => ({ ...d, content:v })); }

  

  private showErrorAlert(msg: string) {
  Swal.fire({
    icon: 'error',
    title: 'Ocurrió un error',
    text: msg,
    confirmButtonText: 'Cerrar',
  });
}

  // ------------- cargar/paginar -------------
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
        const map = new Map<number, Post>(); raw.forEach(it => map.set(it.id_posts, it));
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
      error: (e) => {
  this.loading.set(false);
  const msg = e?.error?.message ?? 'Error al cargar';
  this.error.set(msg);
  this.showErrorAlert(msg);
}
    });
  }

  goTo(p:number){
    if (p<1 || (this.totalPages && p>this.totalPages)) return;
    this.load(p);
  }

  // ------------- crear -------------
  async create() {
  const title = this.draft.title.trim();
  const content = this.draft.content.trim();

  if (!title || !content) {
    await Swal.fire({
      icon: 'error',
      title: 'Campos obligatorios',
      text: 'Debes completar todos los campos antes de continuar.',
    });
    return;
  }
    this.loading.set(true);
    this.error.set(undefined);
    this.ok.set(false);

    this.api.create({ title, content }).subscribe({
      next: async () => {
        this.ok.set(true);
        this.loading.set(false);
        this.draft = { title:'', content:'' };
        await Swal.fire({ icon:'success', title:'Publicado', text:'La publicación fue creada.', timer:1400, showConfirmButton:false });
        this.load(this.page);
      },
     error: async (e) => {
  this.loading.set(false);
  const msg = e?.error?.message ?? 'Error al publicar';
  this.error.set(msg);
  this.showErrorAlert(msg);
}
    });
  }

  // ------------- edición / admin -------------
  beginEdit(p: Post){
    if (!this.isAdmin()) return;
    this.editingId.set(p.id_posts);
    this.editDraft.set({ title: p.title, content: p.content });
  }

  cancelEdit(){
    this.editingId.set(null);
    this.editDraft.set({ title:'', content:'' });
  }

  async saveEdit(p: Post){
    if (!this.isAdmin()) return;
    const d = this.editDraft();
    const title = d.title.trim();
    const content = d.content.trim();
    if (!title || !content) return;

    this.loading.set(true);
    this.api.update(p.id_posts, { title, content }).subscribe({
      next: async () => {
        this.loading.set(false);
        this.editingId.set(null);
        await Swal.fire({ icon:'success', title:'Guardado', timer:1200, showConfirmButton:false });
        this.load(this.page);
      },
      error: async (e) => {
  this.loading.set(false);
  const msg = e?.error?.message ?? 'Error al actualizar';
  this.showErrorAlert(msg);
}
    });
  }

  async remove(p: Post){
    if (!this.isAdmin()) return;
    const c = await Swal.fire({
      icon: 'warning',
      title: 'Eliminar publicación',
      html: `¿Seguro que deseas eliminar <b>${p.title}</b>?`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (!c.isConfirmed) return;

    this.loading.set(true);
    this.api.remove(p.id_posts).subscribe({
      next: async () => {
        this.loading.set(false);
        await Swal.fire({ icon:'success', title:'Eliminado', timer:1200, showConfirmButton:false });
        this.load(this.page);
      },
     error: async (e) => {
  this.loading.set(false);
  const msg = e?.error?.message ?? 'Error al eliminar';
  this.showErrorAlert(msg);
}
    });
  }

  // ------------- activar / desactivar -------------
  async toggleState(p: Post){
    if (!this.isAdmin()) return;
    const toInactive = p.state == 1;
    const c = await Swal.fire({
      icon: 'question',
      title: toInactive ? 'Desactivar publicación' : 'Activar publicación',
      text: toInactive
        ? 'La publicación dejará de ser visible para usuarios.'
        : 'La publicación volverá a ser visible.',
      showCancelButton: true,
      confirmButtonText: toInactive ? 'Sí, desactivar' : 'Sí, activar',
      cancelButtonText: 'Cancelar'
    });
    if (!c.isConfirmed) return;

    this.loading.set(true);
    this.api.update(p.id_posts, { state: toInactive ? 0 : 1 } as any).subscribe({
      next: async () => {
        this.loading.set(false);
        await Swal.fire({
          icon:'success',
          title: toInactive ? 'Desactivada' : 'Activada',
          timer: 1200,
          showConfirmButton: false
        });
        this.load(this.page);
      },
      error: async (e) => {
  this.loading.set(false);
  const msg = e?.error?.message ?? 'No se pudo cambiar el estado';
  this.showErrorAlert(msg);
}
    });
  }
}
