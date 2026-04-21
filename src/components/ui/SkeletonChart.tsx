export function SkeletonChart() {
  return (
    <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-card-lg flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h3 className="text-lg font-bold text-gray-800">Crescimento (Reach vs Seguidores)</h3>
      </div>
      <div className="flex-1 min-h-0 relative w-full overflow-hidden flex flex-col justify-end gap-2">
        <div className="skeleton w-full h-[80%] opacity-50 rounded-lg"></div>
      </div>
    </div>
  );
}
