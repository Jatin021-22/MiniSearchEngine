export default function AlgorithmLabControls({
  datasetSize, setDatasetSize,
  operation, setOperation,
  onRunBatch, onRunIncremental,
  isRunning,
}) {
  return (
    <div className="glass-card p-6 space-y-6">
      <h3 className="text-lg font-semibold text-slate-800">Benchmark Controls</h3>

      <div>
        <label className="block text-sm font-medium text-slate-600 mb-2">Dataset Size</label>
        <input
          type="range"
          min="10"
          max="1000"
          step="10"
          value={datasetSize}
          onChange={(e) => setDatasetSize(Number(e.target.value))}
          className="w-full accent-sky-500"
        />
        <p className="text-sm text-slate-500 mt-1">{datasetSize} documents</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-600 mb-2">Workload</label>
        <div className="flex gap-2">
          {['insert', 'update', 'delete'].map((op) => (
            <button
              key={op}
              onClick={() => setOperation(op)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                operation === op
                  ? 'bg-sky-500 text-white'
                  : 'bg-white/60 text-slate-600 hover:bg-sky-50'
              }`}
            >
              {op}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onRunBatch}
          disabled={isRunning}
          className="flex-1 px-4 py-3 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 disabled:opacity-50 transition-colors"
        >
          {isRunning ? 'Running...' : 'Run Batch Rebuild'}
        </button>
        <button
          onClick={onRunIncremental}
          disabled={isRunning}
          className="flex-1 px-4 py-3 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-600 disabled:opacity-50 transition-colors"
        >
          {isRunning ? 'Running...' : 'Run Incremental'}
        </button>
      </div>
    </div>
  );
}
