import { useState, useRef, useEffect } from 'react';
import { useAutocomplete } from '../hooks/useSearch';

export default function SearchBox({ onSearch, initialQuery = '' }) {
  const [query, setQuery] = useState(initialQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { data: suggestions = [] } = useAutocomplete(query);
  const inputRef = useRef(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search documents..."
            className="w-full px-4 py-3 rounded-xl glass-card focus:outline-none focus:ring-2 focus:ring-sky-400 text-slate-800"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 glass-card z-10 overflow-hidden">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { setQuery(s); onSearch(s); setShowSuggestions(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-sky-50 text-sm text-slate-700"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
        >
          Search
        </button>
      </form>
    </div>
  );
}
