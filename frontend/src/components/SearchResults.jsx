import { useState } from 'react';
import { Link } from 'react-router-dom';

function TimingRow({ label, ms, highlight }) {
  const bg = highlight === 'blue' ? 'bg-sky-50' : highlight === 'green' ? 'bg-green-50' : '';
  return (
    <div className={`flex justify-between ${bg} px-2 py-1 rounded`}>
      <span>{label}:</span>
      <span className="font-bold">{ms?.toFixed(2)}ms</span>
    </div>
  );
}

export default function SearchResults({ results, timing, candidateCount }) {
  const [showTiming, setShowTiming] = useState(false);

  if (!results) return null;

  return (
    <div className="space-y-4">
      {timing && (
        <div className="flex gap-3 items-center flex-wrap">
          <span className="text-sm font-mono bg-sky-100 text-sky-700 px-3 py-1 rounded-full">
            ⚡ {timing.total_ms?.toFixed(2)}ms
          </span>
          {candidateCount !== undefined && (
            <span className="text-xs text-slate-500">{candidateCount} candidates</span>
          )}
          <button
            onClick={() => setShowTiming(!showTiming)}
            className="text-xs text-sky-600 hover:underline"
          >
            {showTiming ? 'Hide' : 'Show'} timing breakdown
          </button>
        </div>
      )}

      {showTiming && timing && (
        <div className="glass-card p-4 font-mono text-xs space-y-1">
          <h4 className="font-bold text-slate-800 mb-2">Search Timing Breakdown</h4>
          <TimingRow label="Tokenization" ms={timing.tokenization_ms} />
          <TimingRow label="Index Lookup" ms={timing.index_lookup_ms} />
          <TimingRow label="Candidate Collection" ms={timing.candidate_collection_ms} />
          <TimingRow label="Scoring" ms={timing.scoring_ms} />
          <TimingRow label="Ranking" ms={timing.ranking_ms} />
          <TimingRow label="DB Fetch" ms={timing.db_fetch_ms} />
          <div className="border-t border-slate-200 pt-2 mt-2">
            <TimingRow label="DSA Time" ms={timing.dsa_time_ms} highlight="blue" />
            <TimingRow label="Total" ms={timing.total_ms} highlight="green" />
          </div>
        </div>
      )}

      <div className="space-y-3">
        {results.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No results found</p>
        ) : (
          results.map((result) => (
            <Link
              key={result.id}
              to={`/documents/${result.id}`}
              className="stagger-item block glass-card p-4 hover:shadow-lg transition-all"
            >
              <h3 className="font-semibold text-slate-800">{result.title}</h3>
              <p className="text-sm text-slate-500 mt-1">{result.filename}</p>
              {result.content_preview && (
                <p className="text-sm text-slate-600 mt-2 line-clamp-2">{result.content_preview}</p>
              )}
              <span className="inline-block mt-2 text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded">
                Score: {result.score}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
