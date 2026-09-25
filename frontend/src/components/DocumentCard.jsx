import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { hoverScale } from '../services/animations';

export default function DocumentCard({ document }) {
  const cardRef = useRef(null);

  useEffect(() => {
    hoverScale(cardRef.current);
  }, []);

  return (
    <Link
      ref={cardRef}
      to={`/documents/${document.id}`}
      className="stagger-item glass-card p-5 block"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-slate-800">{document.title}</h3>
          <p className="text-sm text-slate-500 mt-1">{document.filename}</p>
        </div>
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
          {document.status}
        </span>
      </div>
      {document.content_preview && (
        <p className="text-sm text-slate-600 mt-3 line-clamp-2">{document.content_preview}</p>
      )}
      <p className="text-xs text-slate-400 mt-3">
        Updated {new Date(document.updated_at).toLocaleDateString()}
      </p>
    </Link>
  );
}
