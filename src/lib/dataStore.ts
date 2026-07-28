import { supabase, supabaseConfigured } from './supabaseClient';

export interface GalleryItem {
  id: string;
  src: string;
  title: string;
  category: string;
}

export interface Notice {
  id: string;
  heading: string;
  date: string;
  desc: string;
  fileUrl?: string;
  fileName?: string;
}

// ---------------- Gallery ----------------

export async function fetchGalleryItems(): Promise<GalleryItem[]> {
  const { data, error } = await supabase
    .from('gallery_items')
    .select('id, src, title, category')
    .order('created_at', { ascending: true });
  if (error) {
    console.error('fetchGalleryItems error', error);
    return [];
  }
  return data as GalleryItem[];
}

export async function addGalleryItem(item: Omit<GalleryItem, 'id'>): Promise<{ item: GalleryItem | null; error: string | null }> {
  const { data, error } = await supabase.from('gallery_items').insert(item).select().single();
  if (error) {
    console.error('addGalleryItem error', error);
    return { item: null, error: error.message };
  }
  return { item: data as GalleryItem, error: null };
}

export async function updateGalleryItem(id: string, item: Partial<Omit<GalleryItem, 'id'>>): Promise<boolean> {
  const { error } = await supabase.from('gallery_items').update(item).eq('id', id);
  if (error) {
    console.error('updateGalleryItem error', error);
    return false;
  }
  return true;
}

export async function deleteGalleryItem(id: string): Promise<boolean> {
  const { error } = await supabase.from('gallery_items').delete().eq('id', id);
  if (error) {
    console.error('deleteGalleryItem error', error);
    return false;
  }
  return true;
}

export async function uploadGalleryImage(file: File): Promise<{ url: string | null; error: string | null }> {
  const ext = file.name.split('.').pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from('gallery').upload(path, file);
  if (error) {
    console.error('uploadGalleryImage error', error);
    return { url: null, error: error.message };
  }
  const { data } = supabase.storage.from('gallery').getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}

// ---------------- Notices ----------------

export async function fetchNotices(): Promise<Notice[]> {
  const { data, error } = await supabase
    .from('notices')
    .select('id, heading, date, description, file_url, file_name')
    .order('date', { ascending: false });
  if (error) {
    console.error('fetchNotices error', error);
    return [];
  }
  return (data ?? []).map((n) => ({
    id: n.id,
    heading: n.heading,
    date: n.date,
    desc: n.description,
    fileUrl: n.file_url ?? undefined,
    fileName: n.file_name ?? undefined,
  }));
}

export async function addNotice(notice: Omit<Notice, 'id'>): Promise<Notice | null> {
  const { data, error } = await supabase
    .from('notices')
    .insert({
      heading: notice.heading,
      date: notice.date,
      description: notice.desc,
      file_url: notice.fileUrl ?? null,
      file_name: notice.fileName ?? null,
    })
    .select()
    .single();
  if (error) {
    console.error('addNotice error', error);
    return null;
  }
  return {
    id: data.id,
    heading: data.heading,
    date: data.date,
    desc: data.description,
    fileUrl: data.file_url ?? undefined,
    fileName: data.file_name ?? undefined,
  };
}

export async function updateNotice(id: string, notice: Partial<Omit<Notice, 'id'>>): Promise<boolean> {
  const payload: Record<string, unknown> = {};
  if (notice.heading !== undefined) payload.heading = notice.heading;
  if (notice.date !== undefined) payload.date = notice.date;
  if (notice.desc !== undefined) payload.description = notice.desc;
  if (notice.fileUrl !== undefined) payload.file_url = notice.fileUrl;
  if (notice.fileName !== undefined) payload.file_name = notice.fileName;

  const { error } = await supabase.from('notices').update(payload).eq('id', id);
  if (error) {
    console.error('updateNotice error', error);
    return false;
  }
  return true;
}

export async function deleteNotice(id: string): Promise<boolean> {
  const { error } = await supabase.from('notices').delete().eq('id', id);
  if (error) {
    console.error('deleteNotice error', error);
    return false;
  }
  return true;
}

export function notifyNoticesChanged(): void {
  window.dispatchEvent(new Event('haque:notices-changed'));
}

export function onNoticesChanged(callback: () => void): () => void {
  window.addEventListener('haque:notices-changed', callback);
  return () => window.removeEventListener('haque:notices-changed', callback);
}

export async function uploadNoticeFile(file: File): Promise<{ url: string; name: string } | null> {
  const ext = file.name.split('.').pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from('notices').upload(path, file);
  if (error) {
    console.error('uploadNoticeFile error', error);
    return null;
  }
  const { data } = supabase.storage.from('notices').getPublicUrl(path);
  return { url: data.publicUrl, name: file.name };
}

// ---------------- Annual Events ----------------

export interface AnnualEvent {
  id: string;
  name: string;
  icon_name: string;
  color: string;
}

const DEFAULT_EVENTS: Omit<AnnualEvent, 'id'>[] = [
  { name: 'Science Exhibition', icon_name: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80', color: 'bg-blue-50 text-blue-600' },
  { name: '15th Aug Independence Day', icon_name: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=600&auto=format&fit=crop&q=80', color: 'bg-orange-50 text-orange-600' },
  { name: '26th Jan Republic Day', icon_name: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&auto=format&fit=crop&q=80', color: 'bg-green-50 text-green-600' },
  { name: 'School Foundation Day', icon_name: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=80', color: 'bg-purple-50 text-purple-600' },
  { name: 'Ramazan Iftaar Program', icon_name: 'https://images.unsplash.com/photo-1581078426770-6d336e5de7bf?w=600&auto=format&fit=crop&q=80', color: 'bg-emerald-50 text-emerald-600' },
  { name: 'Annual Day Celebration', icon_name: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80', color: 'bg-pink-50 text-pink-600' }
];

const EVENTS_LOCAL_KEY = 'haque:annual_events_v2';

export function getLocalEvents(): AnnualEvent[] {
  const data = localStorage.getItem(EVENTS_LOCAL_KEY);
  if (!data) {
    // Generate UUIDs for default events
    const seeded = DEFAULT_EVENTS.map(ev => ({
      ...ev,
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)
    }));
    localStorage.setItem(EVENTS_LOCAL_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse local events, resetting', e);
    return [];
  }
}

function saveLocalEvents(events: AnnualEvent[]): void {
  localStorage.setItem(EVENTS_LOCAL_KEY, JSON.stringify(events));
}

// Helper to convert base64 image string to file and upload to Supabase storage
export async function uploadBase64Image(base64Str: string): Promise<string | null> {
  try {
    const res = await fetch(base64Str);
    const blob = await res.blob();
    const mime = blob.type || 'image/jpeg';
    const ext = mime.split('/')[1] || 'jpg';
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const file = new File([blob], path, { type: mime });
    const { url } = await uploadGalleryImage(file);
    return url;
  } catch (e) {
    console.warn('Failed to upload base64 image to Supabase storage:', e);
    return null;
  }
}

export async function fetchAnnualEvents(): Promise<AnnualEvent[]> {
  try {
    const { data: dbData, error } = await supabase
      .from('annual_events')
      .select('id, name, icon_name, color')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Supabase fetchAnnualEvents failed, falling back to localStorage:', error.message);
      return getLocalEvents();
    }

    if (dbData) {
      const dbEvents = dbData as AnnualEvent[];
      saveLocalEvents(dbEvents);
      return dbEvents;
    }
  } catch (e) {
    console.warn('Supabase annual_events fetch failed, using local storage fallback:', e);
  }
  return getLocalEvents();
}

export async function addAnnualEvent(event: Omit<AnnualEvent, 'id'>): Promise<{ event: AnnualEvent | null; error: string | null }> {
  let createdEvent: AnnualEvent | null = null;
  let supabaseErr: string | null = null;

  let iconName = event.icon_name;
  if (iconName && iconName.startsWith('data:image/')) {
    const uploadedUrl = await uploadBase64Image(iconName);
    if (uploadedUrl) iconName = uploadedUrl;
  }

  const payload = { ...event, icon_name: iconName };

  try {
    const { data, error } = await supabase.from('annual_events').insert(payload).select().single();
    if (error) {
      supabaseErr = error.message;
      console.warn('Supabase addAnnualEvent failed, adding to local storage only:', error.message);
    } else if (data) {
      createdEvent = data as AnnualEvent;
    }
  } catch (e) {
    console.warn('Supabase addAnnualEvent failed, falling back to local storage:', e);
  }

  // Always update local storage
  const localList = getLocalEvents();
  if (!createdEvent) {
    createdEvent = {
      ...payload,
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)
    };
  }
  localList.push(createdEvent);
  saveLocalEvents(localList);
  notifyEventsChanged();

  return { event: createdEvent, error: supabaseErr };
}

export async function updateAnnualEvent(id: string, updatedFields: Partial<Omit<AnnualEvent, 'id'>>): Promise<boolean> {
  let success = false;
  let fieldsToSave = { ...updatedFields };

  if (fieldsToSave.icon_name && fieldsToSave.icon_name.startsWith('data:image/')) {
    const uploadedUrl = await uploadBase64Image(fieldsToSave.icon_name);
    if (uploadedUrl) fieldsToSave.icon_name = uploadedUrl;
  }

  try {
    const { error } = await supabase.from('annual_events').update(fieldsToSave).eq('id', id);
    if (!error) {
      success = true;
    } else {
      console.warn('Supabase updateAnnualEvent failed:', error.message);
    }
  } catch (e) {
    console.warn('Supabase updateAnnualEvent failed, using local storage:', e);
  }

  // Update local storage
  const localList = getLocalEvents();
  const index = localList.findIndex(e => e.id === id);
  if (index !== -1) {
    localList[index] = { ...localList[index], ...fieldsToSave };
    saveLocalEvents(localList);
    success = true;
  }
  notifyEventsChanged();
  return success;
}

export async function deleteAnnualEvent(id: string): Promise<boolean> {
  let success = false;

  // Check if target event has a storage image to clean up
  const existingList = getLocalEvents();
  const targetEvent = existingList.find(e => e.id === id);
  if (targetEvent?.icon_name && targetEvent.icon_name.includes('/storage/v1/object/public/gallery/')) {
    const parts = targetEvent.icon_name.split('/storage/v1/object/public/gallery/');
    if (parts[1]) {
      supabase.storage.from('gallery').remove([parts[1]]).catch(err => {
        console.warn('Storage delete cleanup notice:', err);
      });
    }
  }

  try {
    const { error } = await supabase.from('annual_events').delete().eq('id', id);
    if (!error) {
      success = true;
    } else {
      console.warn('Supabase deleteAnnualEvent failed:', error.message);
    }
  } catch (e) {
    console.warn('Supabase deleteAnnualEvent failed, using local storage:', e);
  }

  // Update local storage
  let localList = getLocalEvents();
  const initialLen = localList.length;
  localList = localList.filter(e => e.id !== id);
  if (localList.length !== initialLen) {
    saveLocalEvents(localList);
    success = true;
  }
  notifyEventsChanged();
  return success;
}

export function notifyEventsChanged(): void {
  window.dispatchEvent(new Event('haque:events-changed'));
}

export function onEventsChanged(callback: () => void): () => void {
  window.addEventListener('haque:events-changed', callback);
  return () => window.removeEventListener('haque:events-changed', callback);
}

// Setup Realtime Listener for cross-device synchronization
if (typeof window !== 'undefined' && supabaseConfigured) {
  try {
    supabase
      .channel('public:annual_events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'annual_events' }, () => {
        notifyEventsChanged();
      })
      .subscribe();
  } catch (e) {
    console.warn('Realtime subscription setup failed:', e);
  }
}