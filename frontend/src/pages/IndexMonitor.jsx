import { useIndexStats } from '../hooks/useDocuments';
import { useQuery } from '@tanstack/react-query';
import { getIndexOperations } from '../services/api';
import { usePageAnimation, useCounterAnimation } from '../hooks/useAnimation';
import LoadingSpinner from '../components/LoadingSpinner';

function Gauge({ label, value, max, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="glass-card p-6">
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-slate-800 mt-1">{value?.toLocaleString()}</p>
      <div className="mt-3 w-full bg-slate-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-${color}-400 to-${color}-500`}
          style={{ width: `${pct}%`, background: `linear-gradient(to right, var(--color-${color === 'sky' ? 'primary' : 'secondary'}), var(--color-accent))` }}
        />
      </div>
    </div>
  );
}

export default function IndexMonitor() {
  const pageRef = usePageAnimation();
  const { data: stats, isLoading } = useIndexStats();
  const { data: operations } = useQuery({
    queryKey: ['indexOperations'],
    queryFn: async () => {
      const { data } = await getIndexOperations(20);
      return data;
    },
    refetchInterval: 5000,
  });

  const termCounterRef = useCounterAnimation(stats?.term_count);
  const docCounterRef = useCounterAnimation(stats?.doc_count);

  if (isLoading) return <LoadingSpinner />;

  const maxVal = Math.max(stats?.term_count || 0, stats?.doc_count || 0, stats?.operation_count || 0, 1);

  return (
    <div ref={pageRef} className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Index Monitor</h1>
        <p className="text-slate-500 mt-1">Real-time inverted index statistics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Gauge label="Vocabulary Size" value={stats?.term_count} max={maxVal} color="sky" />
        <Gauge label="Documents Indexed" value={stats?.doc_count} max={maxVal} color="cyan" />
        <Gauge label="Index Operations" value={stats?.operation_count} max={maxVal} color="sky" />
        <Gauge label="Total Searches" value={stats?.search_count} max={maxVal} color="cyan" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 text-center">
          <p className="text-sm text-slate-500">Vocabulary</p>
          <p ref={termCounterRef} className="text-5xl font-bold text-sky-600 mt-2">
            {stats?.term_count || 0}
          </p>
          <p className="text-xs text-slate-400 mt-2">unique terms in index</p>
        </div>
        <div className="glass-card p-6 text-center">
          <p className="text-sm text-slate-500">Documents</p>
          <p ref={docCounterRef} className="text-5xl font-bold text-cyan-600 mt-2">
            {stats?.doc_count || 0}
          </p>
          <p className="text-xs text-slate-400 mt-2">active documents</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Operations</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="pb-2">Operation</th>
                <th className="pb-2">Doc ID</th>
                <th className="pb-2">Terms</th>
                <th className="pb-2">Duration</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {operations?.map((op) => (
                <tr key={op.id} className="border-b border-slate-100">
                  <td className="py-2 capitalize font-medium">{op.operation}</td>
                  <td>{op.document_id || '—'}</td>
                  <td>{op.affected_terms}</td>
                  <td className="font-mono text-sky-600">{op.duration_ms?.toFixed(2)}ms</td>
                  <td>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      op.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {op.status}
                    </span>
                  </td>
                  <td className="text-slate-400">{new Date(op.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
