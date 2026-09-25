export default function VersionHistoryModal({ isOpen, onClose, history }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Version History</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
        </div>
        {history?.length === 0 ? (
          <p className="text-slate-500 text-sm">No history available</p>
        ) : (
          <div className="space-y-3">
            {history?.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                <div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                    item.operation === 'insert' ? 'bg-green-100 text-green-700' :
                    item.operation === 'update' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {item.operation}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">
                    {item.affected_terms} terms affected
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-sky-600">{item.duration_ms?.toFixed(2)}ms</p>
                  <p className="text-xs text-slate-400">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
