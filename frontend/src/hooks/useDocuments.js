import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDocuments,
  getDocument,
  uploadDocument,
  updateDocument,
  deleteDocument,
  getDocumentHistory,
  getIndexStats,
} from '../services/api';

export function useDocuments() {
  return useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const { data } = await getDocuments();
      return data;
    },
  });
}

export function useDocument(id) {
  return useQuery({
    queryKey: ['document', id],
    queryFn: async () => {
      const { data } = await getDocument(id);
      return data;
    },
    enabled: !!id,
  });
}

export function useDocumentHistory(id) {
  return useQuery({
    queryKey: ['documentHistory', id],
    queryFn: async () => {
      const { data } = await getDocumentHistory(id);
      return data;
    },
    enabled: !!id,
  });
}

export function useIndexStats() {
  return useQuery({
    queryKey: ['indexStats'],
    queryFn: async () => {
      const { data } = await getIndexStats();
      return data;
    },
    refetchInterval: 10000,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, onProgress }) => uploadDocument(file, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['indexStats'] });
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }) => updateDocument(id, file),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document', id] });
      queryClient.invalidateQueries({ queryKey: ['indexStats'] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['indexStats'] });
    },
  });
}
