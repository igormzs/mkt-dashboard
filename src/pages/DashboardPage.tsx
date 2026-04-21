import { useState, useMemo } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { MetricCard } from '../components/dashboard/MetricCard';
import { GrowthChart } from '../components/dashboard/GrowthChart';
import { EngagementGauge } from '../components/dashboard/EngagementGauge';
import { YoYComparison } from '../components/comparison/YoYComparison';
import { DataInputForm } from '../components/data-input/DataInputForm';
import { DataTable } from '../components/data-table/DataTable';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { SkeletonChart } from '../components/ui/SkeletonChart';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { useAuth } from '../hooks/useAuth';
import { useKpiData } from '../hooks/useKpiData';
import type { NetworkFilter, ViewMode, MetricCardData } from '../types/kpi';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const { data, status, loading, reload, save, remove } = useKpiData();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [networkFilter, setNetworkFilter] = useState<NetworkFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('total');

  const dashboardMetrics = useMemo(() => {
    let filtered = networkFilter === 'all' ? data : data.filter((d) => d['Rede Social'] === networkFilter);
    if (filtered.length === 0) return { cards: [], trends: { reachData: [], followData: [], labels: [] }, avgEng: 0, isMonthly: viewMode === 'monthly' };

    const sortedDesc = [...filtered].sort((a, b) => new Date(b['Mês/Ano']).getTime() - new Date(a['Mês/Ano']).getTime());
    let monthlyTrends: Record<string, { reach: number; follow: number; posts: number; engSum: number; engCount: number }> = {};
    
    sortedDesc.forEach((d) => {
      const m = d['Mês/Ano'];
      if (!monthlyTrends[m]) monthlyTrends[m] = { reach: 0, follow: 0, posts: 0, engSum: 0, engCount: 0 };
      monthlyTrends[m].reach += d['Account Reached'] || 0;
      monthlyTrends[m].follow += d['Novos Seguidores'] || 0;
      monthlyTrends[m].posts += d['Nº Posts'] || 0;
      monthlyTrends[m].engSum += d['Engagement %'] || 0;
      monthlyTrends[m].engCount += 1;
    });

    const sortedMonths = Object.keys(monthlyTrends).sort().reverse().slice(0, 6);
    const trendPosts = sortedMonths.map((m) => monthlyTrends[m].posts).reverse();
    const trendFollowers = sortedMonths.map((m) => monthlyTrends[m].follow).reverse();
    const trendReach = sortedMonths.map((m) => monthlyTrends[m].reach).reverse();
    const totalReach = filtered.reduce((s, d) => s + (d['Account Reached'] || 0), 0);
    const totalFollowers = filtered.reduce((s, d) => s + (d['Novos Seguidores'] || 0), 0);
    const totalPosts = filtered.reduce((s, d) => s + (d['Nº Posts'] || 0), 0);
    const avgEng = filtered.length > 0 ? filtered.reduce((s, d) => s + (d['Engagement %'] || 0), 0) / filtered.length : 0;

    let deltaReach = '0%';
    if (trendReach.length >= 2) {
      const current = trendReach[trendReach.length - 1]; const prev = trendReach[trendReach.length - 2];
      if (prev > 0) deltaReach = (((current - prev) / prev) * 100).toFixed(1) + '%';
    }

    const formatMonth = (mStr: string) => { if(!mStr) return''; const [y,m] = mStr.split('-'); const n = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']; return `${n[parseInt(m,10)-1]} ${y}`; };

    let cards: MetricCardData[] = [];
    if (viewMode === 'monthly') {
      cards = [
        { key: 'M', label: 'Meses', value: sortedMonths.length, trend: [], style: 'light' },
        { key: 'UP', label: 'Último Período', value: sortedDesc[0] ? formatMonth(sortedDesc[0]['Mês/Ano']) : 'N/A', trend: [], style: 'light' },
      ];
    } else {
      cards = [
        { key: 'reached', label: 'Total Reached', value: totalReach, trend: trendReach, style: 'dark', delta: !deltaReach.includes('-') && deltaReach !== '0%' ? '+' + deltaReach : deltaReach },
        { key: 'followers', label: 'Novos Seguidores', value: totalFollowers, trend: trendFollowers, style: 'light', delta: '+5.2%' },
        { key: 'posts', label: 'Total Posts', value: totalPosts, trend: trendPosts, style: 'light', delta: '-1.4%' },
        { key: 'engagement', label: 'Engagement Médio', value: avgEng.toFixed(1) + '%', trend: [], style: 'light', delta: '+0.5%' },
      ];
    }

    const labels: string[] = []; let cReach: number[] = []; let cFollow: number[] = []; let cEng: number[] = [];
    const monthsLine = Array.from(new Set(filtered.map((d) => d['Mês/Ano']))).sort();
    monthsLine.forEach((m) => {
      labels.push(formatMonth(m));
      const subset = filtered.filter((d) => d['Mês/Ano'] === m);
      cReach.push(subset.reduce((acc, curr) => acc + (curr['Account Reached'] || 0), 0));
      cFollow.push(subset.reduce((acc, curr) => acc + (curr['Novos Seguidores'] || 0), 0));
      cEng.push(subset.reduce((acc, curr) => acc + (curr['Engagement %'] || 0), 0) / (subset.length || 1));
    });

    return { cards, trends: { reachData: cReach, followData: cFollow, labels }, avgEng, isMonthly: viewMode === 'monthly' };
  }, [data, networkFilter, viewMode]);

  const titles: Record<string, { t: string; s: string }> = {
    dashboard: { t: 'Overview', s: 'Acompanhe as suas métricas' },
    comparison: { t: 'Insights & Comparação', s: 'Análise YoY (Year over Year)' },
    input: { t: 'Gestão de Dados', s: 'Insira novas métricas manualmente' },
    data: { t: 'Tabela de Dados', s: 'Base consolidada e exportação' },
  };

  const renderDashboardContent = () => {
    if (loading) return (
      <><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10 w-full relative"><SkeletonCard style="dark" /><SkeletonCard style="light" /><SkeletonCard style="light" /><SkeletonCard style="light" /></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full block"><SkeletonChart /><div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card-lg flex flex-col items-center h-[400px]"><div className="skeleton w-3/4 h-6 mb-4 opacity-30"></div><div className="skeleton w-48 h-48 rounded-full opacity-30 mt-4"></div></div></div></>
    );
    if (status.type === 'error') return <ErrorState error={status.message} onRetry={reload} />;
    if (dashboardMetrics.cards.length === 0) return <EmptyState onAction={() => setActiveTab('input')} />;

    return (
      <><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10 w-full relative">{dashboardMetrics.cards.map((c) => (<MetricCard key={c.key} data={c} />))}</div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full block"><GrowthChart labels={dashboardMetrics.trends.labels} reachData={dashboardMetrics.trends.reachData} followData={dashboardMetrics.trends.followData} /><EngagementGauge averageEngagement={dashboardMetrics.avgEng} /></div></>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} user={user} onLogout={logout} />
      <main className="flex-1 overflow-y-auto w-full relative">
        <Header title={titles[activeTab].t} subtitle={titles[activeTab].s} syncStatus={status} />
        <div className="p-10 w-full max-w-[1600px] mx-auto min-h-screen">
          <div className={`${activeTab === 'dashboard' ? 'block' : 'hidden'} animate-fade-in`}>
            <div className="flex flex-wrap items-center gap-3 mb-8 bg-white p-2 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 w-max">
              <select value={networkFilter} onChange={(e) => setNetworkFilter(e.target.value as NetworkFilter)} className="glass-input px-4 py-2 rounded-xl text-sm font-medium text-gray-700 min-w-[150px]">
                <option value="all">Todas as redes</option><option value="Facebook">Facebook</option><option value="LinkedIn">LinkedIn</option><option value="Instagram">Instagram</option>
              </select>
              <select value={viewMode} onChange={(e) => setViewMode(e.target.value as ViewMode)} className="glass-input px-4 py-2 rounded-xl text-sm font-medium text-gray-700 min-w-[150px]">
                <option value="total">Resumo Total</option><option value="monthly">Por mês</option>
              </select>
              <button onClick={reload} disabled={loading} className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex items-center gap-2">
                {loading && <span className="w-4 h-4 border-2 border-gray-400 border-t-gray-800 rounded-full animate-spin"></span>}Atualizar
              </button>
            </div>
            {renderDashboardContent()}
          </div>
          <div className={`${activeTab === 'comparison' ? 'block' : 'hidden'} animate-fade-in`}>
            {loading ? <SkeletonChart /> : status.type === 'error' ? <ErrorState onRetry={reload} /> : data.length === 0 ? <EmptyState onAction={() => setActiveTab('input')} /> : <YoYComparison data={data} />}
          </div>
          <div className={`${activeTab === 'input' ? 'block' : 'hidden'} animate-fade-in`}>
            <DataInputForm onSave={save} />
          </div>
          <div className={`${activeTab === 'data' ? 'block' : 'hidden'} animate-fade-in`}>
            {loading ? <SkeletonChart /> : status.type === 'error' ? <ErrorState onRetry={reload} /> : data.length === 0 ? <EmptyState onAction={() => setActiveTab('input')} /> : <DataTable data={data} onDelete={remove} onDownload={() => {}} />}
          </div>
        </div>
      </main>
    </div>
  );
}
