export type NetworkName = 'Facebook' | 'Instagram' | 'LinkedIn';

export interface KpiRecord {
  id: string | number;
  'Rede Social': NetworkName | string;
  'Mês/Ano': string;
  'Nº Posts': number;
  'Novos Seguidores': number;
  'Account Reached': number;
  'Engagement %': number;
}

export type SyncStatusType = 'idle' | 'loading' | 'success' | 'warning' | 'error';
export interface SyncStatus { type: SyncStatusType; message: string; }
export type ViewMode = 'total' | 'monthly';
export type NetworkFilter = 'all' | NetworkName;
export type CardStyle = 'light' | 'dark';

export interface MetricCardData {
  key: string;
  label: string;
  value: number | string;
  trend: number[];
  style: CardStyle;
  delta?: string;
}

export interface ComparisonKpi {
  label: string;
  key: keyof KpiRecord;
}
