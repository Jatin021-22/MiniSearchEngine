import UploadZone from '../components/UploadZone';
import { usePageAnimation } from '../hooks/useAnimation';

export default function Upload() {
  const pageRef = usePageAnimation();

  return (
    <div ref={pageRef} className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-800">Upload Document</h1>
        <p className="text-slate-500 mt-1">Add PDF or TXT files to the search index</p>
      </div>
      <UploadZone />
      <div className="glass-card p-6">
        <h3 className="font-semibold text-slate-800 mb-3">How it works</h3>
        <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
          <li>Upload a PDF or TXT document</li>
          <li>Text is extracted and tokenized (stopwords removed)</li>
          <li>Terms are added to the in-memory inverted index</li>
          <li>Postings are persisted to PostgreSQL for recovery</li>
        </ol>
      </div>
    </div>
  );
}
