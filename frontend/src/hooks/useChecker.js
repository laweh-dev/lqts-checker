// src/hooks/useChecker.js
// Encapsulates the state machine + recent-searches sync.

import { useCallback, useEffect, useState } from 'react';
import { checkMedicine, loadRecent, saveRecent, clearRecent } from '../lib/api';

/**
 * @param {(name: string) => Promise<any>} [checkFn]
 *   Override the network call (useful for tests / storybook).
 */
export function useChecker(checkFn = checkMedicine) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'result' | 'error'
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState(() => loadRecent());

  const run = useCallback(
    async (name) => {
      const trimmed = (name || '').trim();
      if (!trimmed) return;
      setQuery(trimmed);
      setStatus('loading');
      setError(null);
      try {
        const data = await checkFn(trimmed);
        setResult(data);
        setStatus('result');
        setRecent((prev) =>
          saveRecent(
            {
              medicine: data.medicine || trimmed,
              verdict: data.overall_verdict,
              at: Date.now(),
            },
            prev
          )
        );
      } catch (e) {
        setError(e?.message || 'network');
        setStatus('error');
      }
    },
    [checkFn]
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
    setQuery('');
  }, []);

  const clear = useCallback(() => {
    clearRecent();
    setRecent([]);
  }, []);

  // Keep recent in sync if another tab updates it.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'lqts-recent-searches-v1') setRecent(loadRecent());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return {
    status, result, error, query, setQuery, run, reset,
    recent: { items: recent, clear },
  };
}
