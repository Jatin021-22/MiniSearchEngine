import { useRef } from 'react';
import { useChartAnimation } from '../hooks/useAnimation';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

export default function BenchmarkChart({ data, type = 'bar' }) {
  const chartRef = useChartAnimation();

  if (!data?.length) {
    return <p className="text-slate-500 text-center py-8">No benchmark data yet. Run a benchmark to see results.</p>;
  }

  const chartData = data.map((d) => ({
    name: `${d.method} (${d.operation})`,
    duration: d.duration_ms,
    memory: d.memory_mb,
    terms: d.affected_terms,
    size: d.dataset_size,
  }));

  return (
    <div ref={chartRef} className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        {type === 'line' ? (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
            <YAxis label={{ value: 'ms', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="duration" stroke="#0EA5E9" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        ) : (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
            <YAxis label={{ value: 'ms', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="duration" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
            <Bar dataKey="memory" fill="#06B6D4" radius={[4, 4, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export function ComparisonChart({ batch, incremental }) {
  const chartRef = useChartAnimation();

  if (!batch && !incremental) return null;

  const data = [
    { name: 'Batch Rebuild', duration: batch?.duration_ms || 0, fill: '#0EA5E9' },
    { name: 'Incremental', duration: incremental?.duration_ms || 0, fill: '#06B6D4' },
  ];

  return (
    <div ref={chartRef} className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis label={{ value: 'Duration (ms)', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Bar dataKey="duration" radius={[8, 8, 0, 0]}>
            {data.map((entry, i) => (
              <rect key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TimingBreakdownChart({ searches }) {
  const chartRef = useChartAnimation();
  if (!searches?.length) return null;

  const data = searches.slice(-20).map((s) => ({
    query: s.query?.substring(0, 12) || 'query',
    tokenization: s.tokenization_ms || 0,
    indexLookup: s.index_lookup_ms || 0,
    candidateCollection: s.candidate_collection_ms || 0,
    scoring: s.scoring_ms || 0,
    ranking: s.ranking_ms || 0,
    dbFetch: s.db_fetch_ms || 0,
  }));

  return (
    <div ref={chartRef} className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="query" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 10 }} />
          <YAxis label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="tokenization" stackId="a" fill="#8884d8" />
          <Bar dataKey="indexLookup" stackId="a" fill="#82ca9d" />
          <Bar dataKey="candidateCollection" stackId="a" fill="#ffc658" />
          <Bar dataKey="scoring" stackId="a" fill="#ff7c7c" />
          <Bar dataKey="ranking" stackId="a" fill="#8dd1e1" />
          <Bar dataKey="dbFetch" stackId="a" fill="#d084d0" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
