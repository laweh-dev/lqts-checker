// src/lib/api.js
// Production helper: calls the real LQTS backend.
// Reads the base URL from Vite's env (set VITE_API_URL in .env / .env.production).

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Check whether a medicine is on the CredibleMeds risk list.
 *
 * @param {string} medicine — brand or product name as it appears on the box
 * @returns {Promise<{
 *   medicine: string,
 *   ingredients: { ingredient_name: string, risk_category: string }[],
 *   overall_verdict: 'avoid' | 'caution' | 'no known risk' | 'unknown',
 *   plain_english: string,
 * }>}
 */
export async function checkMedicine(medicine) {
  if (!API_URL) {
    throw new Error('VITE_API_URL is not set');
  }
  const res = await fetch(`${API_URL}/check/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ medicine }),
  });
  if (!res.ok) {
    throw new Error(`Server responded with ${res.status}`);
  }
  return res.json();
}

// Verdict → display tokens. Shared by both UI directions.
export const VERDICT_META = {
  avoid: {
    label: 'Avoid',
    heading: 'Best to avoid this one',
  },
  caution: {
    label: 'Check first',
    heading: 'Check with your pharmacist first',
  },
  'no known risk': {
    label: 'No known risk',
    heading: 'No known risk found',
  },
  unknown: {
    label: 'Not found',
    heading: "We couldn't find this medicine",
  },
};

export function verdictMeta(verdict) {
  return VERDICT_META[verdict] || VERDICT_META.unknown;
}

// localStorage-backed recent searches.
const RECENT_KEY = 'lqts-recent-searches-v1';
const RECENT_MAX = 6;

export function loadRecent() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRecent(entry, current = loadRecent()) {
  const next = [
    entry,
    ...current.filter(
      (p) => p.medicine.toLowerCase() !== entry.medicine.toLowerCase()
    ),
  ].slice(0, RECENT_MAX);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {}
  return next;
}

export function clearRecent() {
  try { localStorage.removeItem(RECENT_KEY); } catch {}
}
