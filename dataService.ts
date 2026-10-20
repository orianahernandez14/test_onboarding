import { OnboardingProfile, KnowledgeItem } from '../types';
import { defaultKnowledgeItems } from '../data/defaultKnowledgeItems';
import { defaultProfiles } from "../data/defaultProfiles";
import { apiGet, apiPost, apiDelete, apiPatch, apiPut } from './api';

// Simulamos latencia de red para que el UI esté preparado para estados de carga
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const getDataSource = () => import.meta.env.VITE_DATA_SOURCE ?? 'local';

export const DataService = {
    async saveProfiles(profiles: OnboardingProfile[]): Promise<void> {
      console.log('[saveProfiles] called', profiles);
      await delay(300);

      if (getDataSource() === 'api') {
        // Reemplaza cada perfil completo, incluidas sus tareas.
        for (const profile of profiles) {
          await apiPut(`/profiles/${profile.id}`, profile);
        }
        return;
      }

      // Modo local
      localStorage.setItem('onboardingProfiles', JSON.stringify(profiles));
    },

  async getProfiles(defaults: OnboardingProfile[] = defaultProfiles): Promise<OnboardingProfile[]> {
    if (getDataSource() === 'api') {
      const fromApi = await apiGet<OnboardingProfile[]>('/profiles');

      // La API es la fuente de verdad: no restaurar tareas eliminadas
      // ni escribir datos durante una operación de lectura.
      return fromApi ?? [];
    }

    const stored = localStorage.getItem('onboardingProfiles');

    if (!stored) {
      localStorage.setItem('onboardingProfiles', JSON.stringify(defaults));
      return defaults;
    }

    try {
      const parsed = JSON.parse(stored) as OnboardingProfile[];

      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem('onboardingProfiles', JSON.stringify(defaults));
        return defaults;
      }

      // Respetar exactamente la configuración guardada, incluidas eliminaciones.
      return parsed;
    } catch {
      localStorage.setItem('onboardingProfiles', JSON.stringify(defaults));
      return defaults;
    }
  },

    // === Perfil (A) ===
  async createProfile(payload: OnboardingProfile): Promise<OnboardingProfile> {
    // En el contrato A, POST /profiles crea (201)
    return apiPost<OnboardingProfile>('/profiles', payload);
  },

  async replaceProfile(profile: OnboardingProfile): Promise<OnboardingProfile> {
    // PUT /profiles/{id} (admin/import)
    return apiPut<OnboardingProfile>(`/profiles/${profile.id}`, profile);
  },

  async patchProfileInfo(profileId: string, patch: Partial<OnboardingProfile['info']>) {
    return apiPatch(`/profiles/${profileId}/info`, patch);
  },

  // === Tasks (A) ===
  async createTask(profileId: string, payload: Omit<import('../types').Task, 'id'> & Partial<Pick<import('../types').Task, 'id'>> ) {
    return apiPost(`/profiles/${profileId}/tasks`, payload);
  },

  async patchTask(profileId: string, taskId: string, patch: Partial<import('../types').Task>) {
    return apiPatch(`/profiles/${profileId}/tasks/${taskId}`, patch);
  },

  // === Knowledge (contrato A) ===
  async createKnowledgeItem(payload: KnowledgeItem): Promise<KnowledgeItem> {
    return apiPost<KnowledgeItem>('/knowledge-items', payload);
  },

  async deleteTask(profileId: string, taskId: string): Promise<void> {
    await apiDelete(`/profiles/${profileId}/tasks/${taskId}`);
  },

  async saveKnowledgeItems(items: KnowledgeItem[]): Promise<void> {
    console.log('[saveKnowledgeItems] called', items);
    await delay(300);

    if (getDataSource() === 'api') {
      // MVP bulk: mandamos uno por uno (hasta que hagamos /knowledge-items/bulk)
      for (const item of items) {
        await apiPost('/knowledge-items', item);
      }
      return;
    }

    // Modo local
    localStorage.setItem('knowledgeItems', JSON.stringify(items));
  },

  // Seed items are only for bootstrap / demo.
  // In API mode, server is the source of truth.
  // Defaults are merged only to ensure initial content.
  async getKnowledgeItems(): Promise<KnowledgeItem[]> {
    if (getDataSource() === 'api') {
      const fromApi = await apiGet<KnowledgeItem[]>('/knowledge-items');

      // 1) Seed 1 sola vez (si el server está vacío)
      if (!fromApi || fromApi.length === 0) {
        for (const item of defaultKnowledgeItems) {
          await apiPost('/knowledge-items', item);
        }
        return [...defaultKnowledgeItems];
      }

      // 2) Merge server + defaults (sin duplicar por id)
      const byId = new Map<string, KnowledgeItem>();
      for (const d of defaultKnowledgeItems) byId.set(d.id, d);
      for (const s of fromApi) byId.set(s.id, s);
      return Array.from(byId.values());
    }

    // modo local
    const stored = localStorage.getItem('knowledgeItems');
    return stored ? JSON.parse(stored) : defaultKnowledgeItems;
  },

  async deleteKnowledgeItem(id: string): Promise<void> {
    if (getDataSource() === "api") {
      await apiDelete(`/knowledge-items/${id}`);
      return;
    }

    // modo local
    const stored = localStorage.getItem("knowledgeItems");
    const items: KnowledgeItem[] = stored
      ? JSON.parse(stored)
      : defaultKnowledgeItems;

    const next = items.filter(k => k.id !== id);
    localStorage.setItem("knowledgeItems", JSON.stringify(next));
  },

  exportToJSON(profiles: OnboardingProfile[], items: KnowledgeItem[]) {
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      db: { profiles, items },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `startmap_db_${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  },

  async importFromJSON(
    file: File
  ): Promise<{ profiles: OnboardingProfile[]; items: KnowledgeItem[] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          if (json.db) resolve(json.db);
          else reject('Formato de archivo inválido');
        } catch {
          reject('Error al leer el archivo');
        }
      };
      reader.readAsText(file);
    });
  },
};
