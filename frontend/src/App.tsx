import { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import type { LogEntry } from './services/api';

function App() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [jsonInput, setJsonInput] = useState('{"example": "data"}');
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      const data = await api.getLogs();
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const parsed = JSON.parse(jsonInput);
      await api.createLog(parsed);
      setJsonInput('{"example": "data"}');
      await fetchLogs();
    } catch (error) {
      console.error('Failed to create log:', error);
      alert('Invalid JSON or server error');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchExternal = async () => {
    setLoading(true);
    try {
      await api.fetchExternal();
      await fetchLogs();
    } catch (error) {
      console.error('Failed to fetch external:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-semibold text-gray-900 mb-8 tracking-tight">Log Management System</h1>

        <div className="bg-white border border-gray-200 rounded-xl p-8 mb-6 shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-5">Add Log Entry</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent font-mono text-sm resize-none"
              rows={5}
              placeholder='{"key": "value"}'
            />
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 active:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Log
              </button>
              <button
                type="button"
                onClick={handleFetchExternal}
                disabled={loading}
                className="px-6 py-2.5 bg-white text-gray-900 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Fetch External Data
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-5">
            Log Entries <span className="text-gray-500 font-normal">({logs.length})</span>
          </h2>
          <div className="max-h-[600px] overflow-y-auto space-y-5 pr-2">
            {logs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No logs yet. Add your first log entry above.
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="border border-gray-200 rounded-lg p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-gray-900">ID: {log.id}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(log.inserted_at).toLocaleString()}
                    </span>
                  </div>
                  <pre className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono overflow-x-auto text-gray-800 leading-relaxed">
                    {JSON.stringify(log.json, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
