export function ErrorState({ error, onRetry }: { error?: string; onRetry: () => void }) {
  return (
    <div className="w-full flex flex-col items-center justify-center py-16 bg-red-50/50 rounded-3xl border border-red-100 shadow-card">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">Erro ao carregar dados</h3>
      <p className="text-red-600/80 mb-6 text-center max-w-sm">{error || 'Ocorreu um erro inesperado ao conectar com a base de dados. Por favor, tente novamente.'}</p>
      <button onClick={onRetry} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-sm transition-colors">
        Tentar Novamente
      </button>
    </div>
  );
}
