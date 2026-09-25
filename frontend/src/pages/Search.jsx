import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBox from '../components/SearchBox';
import SearchResults from '../components/SearchResults';
import LoadingSpinner from '../components/LoadingSpinner';
import { useSearch } from '../hooks/useSearch';
import { usePageAnimation, useStaggerAnimation } from '../hooks/useAnimation';

export default function Search() {
  const pageRef = usePageAnimation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeQuery, setActiveQuery] = useState(searchParams.get('q') || '');

  const { data, isLoading, isFetching } = useSearch(activeQuery);
  const resultsRef = useStaggerAnimation([data?.results]);

  const handleSearch = (q) => {
    setActiveQuery(q);
    setSearchParams({ q });
  };

  return (
    <div ref={pageRef} className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-800">Search</h1>
        <p className="text-slate-500 mt-1">Query the inverted index with ranked results</p>
      </div>

      <div className="flex justify-center">
        <SearchBox onSearch={handleSearch} initialQuery={query} />
      </div>

      {(isLoading || isFetching) && activeQuery && <LoadingSpinner />}

      {data && (
        <div ref={resultsRef}>
          <SearchResults
            results={data.results}
            timing={data.timing}
            candidateCount={data.candidate_count}
          />
        </div>
      )}
    </div>
  );
}
