import { useIndexStats, useDocuments } from '../hooks/useDocuments';
import { useSearchHistory } from '../hooks/useSearch';
import { usePageAnimation, useCounterAnimation } from '../hooks/useAnimation';
import { TimingBreakdownChart } from '../components/BenchmarkChart';
import SearchPerformanceGauge from '../components/SearchPerformanceGauge';
import LoadingSpinner from '../components/LoadingSpinner';
import DocumentCard from '../components/DocumentCard';

function StatCard({ label, value, color }) {
  const counterRef = useCounterAnimation(value);
  return (
    <div className="glass-card p-6">
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <p ref={counterRef} className={`text-3xl font-bold mt-2 text-${color}-600`}>
        {value?.toLocaleString() || '0'}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const pageRef = usePageAnimation();
  const { data: stats, isLoading: statsLoading } = useIndexStats();
  const { data: documents, isLoading: docsLoading } = useDocuments();
  const { data: searchHistory } = useSearchHistory(20);

  const avgLatency = searchHistory?.length
    ? searchHistory.reduce((a, b) => a + (b.total_ms || b.latency_ms || 0), 0) / searchHistory.length
    : 0;

  if (statsLoading) return <LoadingSpinner />;

  return (
    <div ref={pageRef} className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">Document search system overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Documents" value={stats?.doc_count || 0} color="sky" />
        <StatCard label="Indexed Terms" value={stats?.term_count || 0} color="cyan" />
        <StatCard label="Index Operations" value={stats?.operation_count || 0} color="sky" />
        <StatCard label="Total Searches" value={stats?.search_count || 0} color="cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Search Performance</h3>
          <SearchPerformanceGauge latency={avgLatency} />
        </div>
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Search Timing Analysis</h3>
          <TimingBreakdownChart searches={searchHistory} />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Recent Documents</h2>
        {docsLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents?.slice(0, 6).map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
