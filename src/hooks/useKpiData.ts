import { useState, useCallback, useEffect } from 'react';
import { connector } from '../services/dataConnector';
import type { KpiRecord, SyncStatus } from '../types/kpi';
import { useAuth } from './useAuth';

export function useKpiData() {
  const { session } = useAuth();
  const [data, setData] = useState<KpiRecord[]>([]);
  const [status, setStatus] = useState<SyncStatus>({ type: 'idle', message: 'Aguardando inicialização...' });
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    setStatus({ type: 'loading', message: 'Sincronizando...' });
    try {
      const result = await connector.initialize();
      setData(result.data);
      setStatus(result.status);
    } catch (err) {
      setStatus({ type: 'error', message: 'Erro de Conexão' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) { loadData(); }
  }, [session, loadData]);

  const save = async (record: KpiRecord) => {
    await connector.saveRecord(record);
    setData([...connector.data]);
  };

  const remove = async (id: string | number) => {
    await connector.deleteRecord(id);
    setData([...connector.data]);
  };

  return { data, status, loading, reload: loadData, save, remove };
}
