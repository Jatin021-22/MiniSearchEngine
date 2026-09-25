import { useCallback, useState } from 'react';
import { useUploadDocument } from '../hooks/useDocuments';
import { useToast } from '../context/ToastContext';

const ALLOWED = ['.pdf', '.txt'];

export default function UploadZone() {
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const upload = useUploadDocument();
  const { addToast } = useToast();

  const validateFile = (file) => {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED.includes(ext)) {
      addToast('Only PDF and TXT files are allowed', 'error');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      addToast('File size must be under 10MB', 'error');
      return false;
    }
    return true;
  };

  const handleUpload = useCallback(async (file) => {
    if (!validateFile(file)) return;
    setProgress(0);
    try {
      const { data } = await upload.mutateAsync({
        file,
        onProgress: setProgress,
      });
      addToast(`Uploaded "${data.title}" — ${data.terms_indexed} terms indexed in ${data.duration_ms}ms`, 'success');
      setProgress(100);
    } catch (err) {
      addToast(err.message, 'error');
      setProgress(0);
    }
  }, [upload, addToast]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={`glass-card p-12 text-center border-2 border-dashed transition-colors ${
        dragOver ? 'border-sky-400 bg-sky-50/50' : 'border-sky-200'
      }`}
    >
      <div className="text-5xl mb-4">📄</div>
      <h3 className="text-lg font-semibold text-slate-800">Drag & drop your document</h3>
      <p className="text-sm text-slate-500 mt-2">PDF or TXT files up to 10MB</p>
      <label className="mt-6 inline-block px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-xl cursor-pointer hover:shadow-lg transition-shadow">
        Browse Files
        <input
          type="file"
          accept=".pdf,.txt"
          className="hidden"
          onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0])}
        />
      </label>
      {upload.isPending && (
        <div className="mt-6">
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-sky-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-slate-500 mt-2">Uploading... {progress}%</p>
        </div>
      )}
    </div>
  );
}
