import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { search, autocomplete, getSearchHistory } from '../services/api';
import { addRecentSearch } from '../services/storage';

export function useSearch(query, limit = 10) {
  return useQuery({
    queryKey: ['search', query, limit],
    queryFn: async () => {
      const { data } = await search(query, limit);
      addRecentSearch(query);
      return data;
    },
    enabled: !!query && query.length > 0,
    staleTime: 30000,
  });
}

export function useAutocomplete(prefix) {
  return useQuery({
    queryKey: ['autocomplete', prefix],
    queryFn: async () => {
      const { data } = await autocomplete(prefix);
      return data.suggestions;
    },
    enabled: prefix.length >= 2,
    staleTime: 60000,
  });
}

export function useSearchHistory(limit = 100) {
  return useQuery({
    queryKey: ['searchHistory', limit],
    queryFn: async () => {
      const { data } = await getSearchHistory(limit);
      return data;
    },
  });
}
