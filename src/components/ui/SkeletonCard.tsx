export function SkeletonCard({ style }: { style: 'light' | 'dark' }) {
  const isDark = style === 'dark';
  const bgClass = isDark ? 'bg-brand-charcoal' : 'bg-white';
  const borderClass = isDark ? 'border-brand-charcoal' : 'border-gray-100';
  const shadowClass = isDark ? 'shadow-lg shadow-brand-charcoal/20' : 'shadow-card';

  return (
    <div className={`${bgClass} rounded-3xl p-6 border ${borderClass} ${shadowClass} relative overflow-hidden flex flex-col justify-between min-h-[160px]`}>
      <div className="flex justify-between items-start mb-4 relative z-10 w-full">
        <div className={`skeleton w-1/2 h-4 ${isDark ? 'opacity-30' : ''}`}></div>
        <div className={`skeleton w-16 h-6 rounded-full ${isDark ? 'opacity-30' : ''}`}></div>
      </div>
      <div className="flex items-end justify-between relative z-10 w-full">
        <div className={`skeleton w-2/3 h-10 ${isDark ? 'opacity-30' : ''}`}></div>
        <div className={`w-16 h-8 opacity-90`}>
          <div className={`skeleton w-full h-full ${isDark ? 'opacity-30' : ''}`}></div>
        </div>
      </div>
      {isDark && (
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-dark rounded-full opacity-30 blur-2xl z-0"></div>
      )}
    </div>
  );
}
