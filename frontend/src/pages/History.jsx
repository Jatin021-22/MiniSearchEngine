import { useSearchHistory } from '../hooks/useSearch';
import { useQuery } from '@tanstack/react-query';
import { getIndexOperations } from '../services/api';
import { usePageAnimation } from '../hooks/useAnimation';
import LoadingSpinner from '../components/LoadingSpinner';

export default function History() {
  const pageRef = usePageAnimation();
  const { data: searches, isLoading: searchLoading } = useSearchHistory(50);
  const { data: operations, isLoading: opsLoading } = useQuery({
    queryKey: ['indexOperations', 50],
    queryFn: async () => {
      const { data } = await getIndexOperations(50);
      return data;
    },
  });

  return (
    <div ref={pageRef} className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">History</h1>
        <p className="text-slate-500 mt-1">Search and indexing activity log</p>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Search History</h3>
        {searchLoading ? <LoadingSpinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="pb-2">Query</th>
                  <th className="pb-2">Results</th>
                  <th className="pb-2">DSA Time</th>
                  <th className="pb-2">DB Fetch</th>
                  <th className="pb-2">Total</th>
                  <th className="pb-2">Candidates</th>
                  <th className="pb-2">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {searches?.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 hover:bg-sky-50/50">
                    <td className="py-2 font-medium">{s.query}</td>
                    <td>{s.result_count}</td>
                    <td className="font-mono text-sky-600">{(s.dsa_time_ms || 0).toFixed(2)}ms</td>
                    <td className="font-mono">{(s.db_fetch_ms || 0).toFixed(2)}ms</td>
                    <td className="font-mono font-bold">{(s.total_ms || s.latency_ms || 0).toFixed(2)}ms</td>
                    <td>{s.candidate_count || '—'}</td>
                    <td className="text-slate-400">{new Date(s.created_at).toLocaleString()}</td>
                  </tr>
                ))}
                {searches?.length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center text-slate-500">No search history yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Indexing History</h3>
        {opsLoading ? <LoadingSpinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="pb-2">Operation</th>
                  <th className="pb-2">Document</th>
                  <th className="pb-2">Terms Affected</th>
                  <th className="pb-2">Duration</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {operations?.map((op) => (
                  <tr key={op.id} className="border-b border-slate-100 hover:bg-cyan-50/50">
                    <td className="py-2 capitalize font-medium">{op.operation}</td>
                    <td>{op.document_id || '—'}</td>
                    <td>{op.affected_terms}</td>
                    <td className="font-mono text-cyan-600">{op.duration_ms?.toFixed(2)}ms</td>
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
        )}
      </div>
    </div>
  );
}
