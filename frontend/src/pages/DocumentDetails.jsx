import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocument, useDocumentHistory, useDeleteDocument } from '../hooks/useDocuments';
import { usePageAnimation } from '../hooks/useAnimation';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import VersionHistoryModal from '../components/VersionHistoryModal';

export default function DocumentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pageRef = usePageAnimation();
  const { data: doc, isLoading } = useDocument(id);
  const { data: history } = useDocumentHistory(id);
  const deleteDoc = useDeleteDocument();
  const { addToast } = useToast();
  const [showHistory, setShowHistory] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Delete this document from the index?')) return;
    try {
      await deleteDoc.mutateAsync(id);
      addToast('Document deleted', 'success');
      navigate('/');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (isLoading) return <LoadingSpinner />;

  if (!doc) {
    return <p className="text-center text-slate-500 py-12">Document not found</p>;
  }

  return (
    <div ref={pageRef} className="max-w-3xl mx-auto space-y-6">
      <div className="glass-card p-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{doc.title}</h1>
            <p className="text-slate-500 mt-1">{doc.filename}</p>
          </div>
          <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">{doc.status}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
          <div>
            <p className="text-slate-500">Created</p>
            <p className="font-medium">{new Date(doc.created_at).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-slate-500">Updated</p>
            <p className="font-medium">{new Date(doc.updated_at).toLocaleString()}</p>
          </div>
        </div>

        {doc.content_preview && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Preview</h3>
            <p className="text-slate-700 text-sm leading-relaxed">{doc.content_preview}</p>
          </div>
        )}

        <div className="flex gap-3 mt-8">
          <button
            onClick={() => setShowHistory(true)}
            className="px-4 py-2 bg-sky-100 text-sky-700 rounded-lg text-sm font-medium hover:bg-sky-200 transition-colors"
          >
            Version History
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteDoc.isPending}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
          >
            Delete Document
          </button>
        </div>
      </div>

      <VersionHistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        history={history}
      />
    </div>
  );
}
