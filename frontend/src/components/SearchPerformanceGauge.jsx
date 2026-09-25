export default function SearchPerformanceGauge({ latency }) {
  const getColor = (ms) => {
    if (ms < 5) return 'text-green-600';
    if (ms < 10) return 'text-yellow-600';
    if (ms < 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getLabel = (ms) => {
    if (ms < 5) return '⚡ Excellent';
    if (ms < 10) return '✅ Good';
    if (ms < 50) return '⚠️ Fair';
    return '❌ Slow';
  };

  if (!latency && latency !== 0) return null;

  return (
    <div className={`text-3xl font-bold ${getColor(latency)}`}>
      {latency.toFixed(2)}ms
      <span className="text-sm block font-normal mt-1">{getLabel(latency)}</span>
    </div>
  );
}
