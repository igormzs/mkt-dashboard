import { supabase } from '../lib/supabaseClient';
import type { KpiRecord, SyncStatus } from '../types/kpi';

const STORAGE_KEY = 'socialMediaKPIs_v3';
const LEGACY_STORAGE_KEY = 'socialMediaKPIs';

interface SupabaseKpiRow {
  id?: string | number;
  month_year?: string;
  monthYear?: string;
  period?: string;
  reach?: number | string;
  engagement?: number | string;
  interactions?: number | string;
  followers?: number | string;
  posts?: number | string;
  network?: string;
  [key: string]: unknown;
}

export class SocialDataConnector {
  data: KpiRecord[] = [];
  private storageKey = STORAGE_KEY;

  async initialize(): Promise<{ data: KpiRecord[]; status: SyncStatus }> {
    try {
      const cloudData = await this.fetchFromSupabase();
      if (cloudData && cloudData.length > 0) {
        this.data = cloudData;
        this._sortData();
        return { data: this.data, status: { type: 'success', message: 'Sincronizado' } };
      }
      this._migrateLegacyStorage();
      this.data = this._readLocalStorage();
      this._sortData();
      const fallbackStatus: SyncStatus =
        this.data.length > 0 ? { type: 'warning', message: 'Modo Offline' } : { type: 'warning', message: 'Sem Dados' };
      return { data: this.data, status: fallbackStatus };
    } catch (err) {
      console.error('Initialization error:', err);
      this.data = this._readLocalStorage();
      this._sortData();
      return { data: this.data, status: { type: 'error', message: 'Erro de Conexão' } };
    }
  }

  async saveRecord(record: KpiRecord): Promise<boolean> {
    this.data.push(record);
    this._sortData();
    this._writeLocalStorage();
    return true;
  }

  async deleteRecord(id: string | number): Promise<boolean> {
    this.data = this.data.filter((d) => d.id !== id);
    this._writeLocalStorage();
    return true;
  }

  private async fetchFromSupabase(): Promise<KpiRecord[]> {
    const { data, error } = await supabase.from('social_kpis').select('*');
    if (error) throw error;
    if (!data || data.length === 0) return [];

    const grouped: Record<string, { reach: number; interactions: number; followers: number }> = {};
    (data as SupabaseKpiRow[]).forEach((row) => {
      const month = row.month_year ?? row.monthYear ?? row.period;
      if (!month) return;
      if (!grouped[month]) grouped[month] = { reach: 0, interactions: 0, followers: 0 };
      grouped[month].reach += Number(row.reach) || 0;
      grouped[month].interactions += Number(row.engagement ?? row.interactions) || 0;
      const followerVal = Number(row.followers) || 0;
      if (followerVal > grouped[month].followers) grouped[month].followers = followerVal;
    });

    const consolidated: KpiRecord[] = Object.entries(grouped).map(([month, item]) => {
      const engagementRate = item.reach > 0 ? (item.interactions / item.reach) * 100 : 0;
      return {
        id: `sb-${month}`,
        'Rede Social': 'Consolidado',
        'Mês/Ano': month,
        'Nº Posts': 0,
        'Novos Seguidores': item.followers,
        'Account Reached': item.reach,
        'Engagement %': parseFloat(engagementRate.toFixed(1)),
      };
    });
    return consolidated;
  }

  private _readLocalStorage(): KpiRecord[] {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? (JSON.parse(saved) as KpiRecord[]) : [];
    } catch { return []; }
  }

  private _writeLocalStorage(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.data));
  }

  private _migrateLegacyStorage(): void {
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy && !localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, legacy);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  }

  private _sortData(): void {
    this.data.sort((a, b) => new Date(a['Mês/Ano']).getTime() - new Date(b['Mês/Ano']).getTime());
  }
}
export const connector = new SocialDataConnector();
