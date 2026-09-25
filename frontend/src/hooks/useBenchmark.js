import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBenchmarks, runBenchmark, getBenchmarkComparison } from '../services/api';

export function useBenchmarks(limit = 50) {
  return useQuery({
    queryKey: ['benchmarks', limit],
    queryFn: async () => {
      const { data } = await getBenchmarks(limit);
      return data;
    },
  });
}

export function useBenchmarkComparison(datasetSize, operation) {
  return useQuery({
    queryKey: ['benchmarkComparison', datasetSize, operation],
    queryFn: async () => {
      const { data } = await getBenchmarkComparison(datasetSize, operation);
      return data;
    },
    enabled: false,
  });
}

export function useRunBenchmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ method, datasetSize, operation }) =>
      runBenchmark(method, datasetSize, operation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benchmarks'] });
      queryClient.invalidateQueries({ queryKey: ['benchmarkComparison'] });
    },
  });
}
