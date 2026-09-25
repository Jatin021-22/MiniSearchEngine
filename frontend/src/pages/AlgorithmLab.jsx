import { useState } from 'react';
import AlgorithmLabControls from '../components/AlgorithmLabControls';
import BenchmarkChart, { ComparisonChart } from '../components/BenchmarkChart';
import { useBenchmarks, useRunBenchmark } from '../hooks/useBenchmark';
import { usePageAnimation } from '../hooks/useAnimation';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { getBenchmarkComparison } from '../services/api';

export default function AlgorithmLab() {
  const pageRef = usePageAnimation();
  const [datasetSize, setDatasetSize] = useState(100);
  const [operation, setOperation] = useState('insert');
  const [comparison, setComparison] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const { data: benchmarks, isLoading } = useBenchmarks();
  const runBenchmark = useRunBenchmark();
  const { addToast } = useToast();

  const handleRun = async (method) => {
    setIsRunning(true);
    try {
      const { data } = await runBenchmark.mutateAsync({ method, datasetSize, operation });
      addToast(`${method} completed in ${data.duration_ms}ms`, 'success');
      const { data: comp } = await getBenchmarkComparison(datasetSize, operation);
      setComparison(comp);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const speedup = comparison?.speedup;

  return (
    <div ref={pageRef} className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Algorithm Lab</h1>
        <p className="text-slate-500 mt-1">Compare batch rebuild vs incremental indexing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AlgorithmLabControls
          datasetSize={datasetSize}
          setDatasetSize={setDatasetSize}
          operation={operation}
          setOperation={setOperation}
          onRunBatch={() => handleRun('batch_rebuild')}
          onRunIncremental={() => handleRun('incremental')}
          isRunning={isRunning}
        />

        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Side-by-Side Comparison</h3>
          {comparison ? (
            <>
              <ComparisonChart batch={comparison.batch} incremental={comparison.incremental} />
              {speedup && (
                <div className="mt-4 text-center">
                  <span className="text-2xl font-bold text-green-600">{speedup}x</span>
                  <span className="text-sm text-slate-500 ml-2">speedup (incremental vs batch)</span>
                </div>
              )}
              <table className="w-full mt-6 text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="pb-2">Method</th>
                    <th className="pb-2">Duration</th>
                    <th className="pb-2">Terms</th>
                    <th className="pb-2">Memory</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.batch && (
                    <tr className="bg-sky-50">
                      <td className="py-2 font-medium">Batch Rebuild</td>
                      <td className="font-mono">{comparison.batch.duration_ms?.toFixed(2)}ms</td>
                      <td>{comparison.batch.affected_terms}</td>
                      <td>{comparison.batch.memory_mb?.toFixed(2)}MB</td>
                    </tr>
                  )}
                  {comparison.incremental && (
                    <tr className="bg-cyan-50">
                      <td className="py-2 font-medium">Incremental</td>
                      <td className="font-mono">{comparison.incremental.duration_ms?.toFixed(2)}ms</td>
                      <td>{comparison.incremental.affected_terms}</td>
                      <td>{comparison.incremental.memory_mb?.toFixed(2)}MB</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </>
          ) : (
            <p className="text-slate-500 text-center py-12">Run both benchmarks to see comparison</p>
          )}
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Benchmark History</h3>
        {isLoading ? <LoadingSpinner /> : <BenchmarkChart data={benchmarks} />}
      </div>
    </div>
  );
}
