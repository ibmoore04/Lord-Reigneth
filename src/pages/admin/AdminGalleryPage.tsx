import { useEffect, useRef, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { LoadingState, EmptyState } from '../../components/ui/States';
import { Images, Plus, Trash2, Star, StarOff, Upload, ImageOff } from 'lucide-react';
import {
  getAllGalleryItems,
  updateGalleryItem,
  softDeleteGalleryItem,
  uploadGalleryImage,
  createGalleryItem,
} from '../../services/galleryService';
import type { GalleryItem, GalleryCategory } from '../../types/database';
import { cn } from '../../lib/utils';

const CATEGORIES: { value: GalleryCategory; label: string }[] = [
  { value: 'food',             label: 'Food' },
  { value: 'restaurant',       label: 'Restaurant' },
  { value: 'catering',         label: 'Catering' },
  { value: 'events',           label: 'Events' },
  { value: 'behind_the_scenes',label: 'Behind the Scenes' },
];

function GalleryCard({ item, onDelete, onToggleFeatured }: {
  item: GalleryItem;
  onDelete: (id: string) => void;
  onToggleFeatured: (id: string, val: boolean) => void;
}) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <div className="group relative bg-charcoal-100 rounded-xl overflow-hidden aspect-square">
      {!imgErr ? (
        <img src={item.image_url} alt={item.title ?? ''} loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImgErr(true)} />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <ImageOff className="w-8 h-8 text-charcoal-300" aria-hidden="true" />
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-charcoal-900/0 group-hover:bg-charcoal-900/50 transition-all duration-200 flex items-end">
        <div className="w-full p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200">
          <p className="text-white text-xs font-medium truncate mb-2">{item.title ?? 'Untitled'}</p>
          <div className="flex gap-1.5">
            <button type="button"
              onClick={() => onToggleFeatured(item.id, !item.is_featured)}
              title={item.is_featured ? 'Remove from featured' : 'Mark as featured'}
              className="p-1.5 rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors">
              {item.is_featured ? <StarOff className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
            </button>
            <button type="button"
              onClick={() => onDelete(item.id)}
              title="Remove from gallery"
              className="p-1.5 rounded-md bg-red-500/80 hover:bg-red-600 text-white transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {item.is_featured && (
        <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-xs bg-gold-500 text-white font-semibold">Featured</span>
      )}
    </div>
  );
}

export function AdminGalleryPage() {
  const [items,    setItems]    = useState<GalleryItem[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState<GalleryCategory | 'all'>('all');
  const [uploading,setUploading]= useState(false);
  const [category, setCategory] = useState<GalleryCategory>('food');
  const [title,    setTitle]    = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getAllGalleryItems()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const displayed = filter === 'all' ? items : items.filter((i) => i.category === filter);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const url = await uploadGalleryImage(file);
        const created = await createGalleryItem({
          image_url: url,
          category,
          title: title || null,
          description: null,
          display_order: 0,
          is_featured: false,
          is_active: true,
        });
        setItems((prev) => [created, ...prev]);
      }
      setTitle('');
      if (fileRef.current) fileRef.current.value = '';
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this image from the gallery?')) return;
    await softDeleteGalleryItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleToggleFeatured(id: string, val: boolean) {
    await updateGalleryItem(id, { is_featured: val });
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, is_featured: val } : i));
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-charcoal-800">Gallery</h1>
          <p className="text-charcoal-500 text-sm mt-0.5">{items.length} images</p>
        </div>
        <button type="button" onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary-700 text-white text-sm font-medium hover:bg-primary-800 disabled:opacity-60 transition-colors">
          {uploading ? <Upload className="w-4 h-4 animate-pulse" /> : <Plus className="w-4 h-4" />}
          {uploading ? 'Uploading…' : 'Upload Images'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
      </div>

      {/* Upload settings */}
      <div className="bg-white rounded-xl border border-charcoal-100 p-4 mb-5 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-charcoal-600 mb-1">Upload category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as GalleryCategory)}
            className="text-sm border border-charcoal-200 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white">
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium text-charcoal-600 mb-1">Title (optional)</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Our Jollof Rice"
            className="w-full text-sm border border-charcoal-200 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500" />
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <button type="button" onClick={() => setFilter('all')}
          className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
            filter === 'all' ? 'bg-primary-700 text-white' : 'bg-white border border-charcoal-200 text-charcoal-600 hover:border-primary-300')}>
          All ({items.length})
        </button>
        {CATEGORIES.map((c) => (
          <button key={c.value} type="button" onClick={() => setFilter(c.value)}
            className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
              filter === c.value ? 'bg-primary-700 text-white' : 'bg-white border border-charcoal-200 text-charcoal-600 hover:border-primary-300')}>
            {c.label} ({items.filter((i) => i.category === c.value).length})
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState message="Loading gallery…" />
      ) : displayed.length === 0 ? (
        <EmptyState icon={<Images className="w-10 h-10" />} title="No images" description="Upload your first image using the button above." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {displayed.map((item) => (
            <GalleryCard key={item.id} item={item} onDelete={handleDelete} onToggleFeatured={handleToggleFeatured} />
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
