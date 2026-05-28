// src/LQTSChecker.jsx
// Recommended direction — calm cream homepage + card-based result.
// Drop-in usage:
//   import LQTSChecker from './LQTSChecker';
//   <LQTSChecker />

import { useEffect, useState } from 'react';
import { useChecker } from './hooks/useChecker';
import { verdictMeta } from './lib/api';

const VERDICT = {
  avoid:          { dot: 'bg-rose-500',    wash: 'bg-rose-50',    ink: 'text-rose-800' },
  caution:        { dot: 'bg-amber-500',   wash: 'bg-amber-50',   ink: 'text-amber-800' },
  'no known risk':{ dot: 'bg-emerald-500', wash: 'bg-emerald-50', ink: 'text-emerald-800' },
  unknown:        { dot: 'bg-stone-400',   wash: 'bg-stone-100',  ink: 'text-stone-700' },
};

function ingredientDot(cat) {
  const c = (cat || '').toLowerCase();
  if (c.includes('known risk') && !c.includes('no ')) return 'bg-rose-500';
  if (c.includes('possible') || c.includes('conditional')) return 'bg-amber-500';
  if (c.includes('no')) return 'bg-emerald-500';
  return 'bg-stone-400';
}

export default function LQTSChecker() {
  const { status, result, error, query, setQuery, run, reset, recent } = useChecker();
  const [showIngredients, setShowIngredients] = useState(false);
  useEffect(() => { setShowIngredients(false); }, [result]);

  return (
    <div className="min-h-svh flex flex-col bg-stone-50 text-stone-800 font-[Nunito,system-ui,sans-serif] max-w-md mx-auto w-full">
      <div className="hidden md:block text-center text-xs text-stone-500 py-2 bg-stone-100 border-b border-stone-200">
    Designed for mobile — for the best experience, open on your phone
  </div>
      <header className="px-7 pt-5 flex items-baseline justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[15px] font-bold text-emerald-800 tracking-tight">lqts</span>
          <span className="inline-block w-[5px] h-[5px] rounded-full bg-emerald-600 -translate-y-px" />
          <span className="ml-1 text-[13px] font-medium text-stone-500">medicine checker</span>
        </div>
        {status !== 'idle' && (
          <button onClick={reset} className="text-sm text-stone-500 hover:text-stone-800 transition-colors">
            New check
          </button>
        )}
      </header>

      <main
        className={`flex-1 px-7 flex flex-col min-h-0 ${status === 'result' ? 'overflow-y-auto' : 'overflow-hidden'}`}
      >
        {status === 'idle' && (
          <IdleView query={query} setQuery={setQuery} onSubmit={() => run(query)} recent={recent} run={run} />
        )}
        {status === 'loading' && <LoadingView query={query} />}
        {status === 'result' && result && (
          <ResultView
            result={result}
            showIngredients={showIngredients}
            setShowIngredients={setShowIngredients}
          />
        )}
        {status === 'error' && <ErrorView onRetry={() => run(query)} />}
      </main>

      <footer className="px-7 py-4 pb-5 border-t border-stone-200/80 flex flex-col gap-1.5">
        <p className="m-0 text-[10.5px] leading-snug text-stone-500 text-pretty">
          For information only — not medical advice. Always check with your pharmacist or cardiologist before taking a new medicine.
        </p>
        <p className="m-0 text-[10.5px] font-semibold text-stone-500">
          Risk data sourced from CredibleMeds<sup className="text-[7px]">®</sup>.
        </p>
      </footer>
    </div>
  );
}

function IdleView({ query, setQuery, onSubmit, recent, run }) {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
      className="flex-1 flex flex-col justify-center gap-10 pb-10"
    >
      <div>
        <h1 className="m-0 text-[34px] font-bold leading-[1.1] tracking-tight text-stone-800 text-balance">
          Is this medicine
          <br />
          <span className="text-emerald-800 font-extrabold">safe to take?</span>
        </h1>
        <p className="mt-3.5 text-[15.5px] leading-[1.5] text-stone-500 text-pretty">
          Check a medicine against the CredibleMeds list of drugs that can affect the heart rhythm in Long QT Syndrome.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <label className="flex items-center gap-3 border-b-[1.5px] border-stone-200 pb-3.5 focus-within:border-emerald-600 transition-colors">
          <SearchGlyph className="text-emerald-600" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a medicine name, e.g. Lemsip"
            className="flex-1 outline-none bg-transparent text-[19px] font-semibold text-stone-800 placeholder:text-stone-400 placeholder:font-medium py-1.5"
          />
        </label>
        <button
          type="submit"
          disabled={!query.trim()}
          className="self-start rounded-full px-6 py-3.5 text-[15px] font-bold transition-colors bg-emerald-700 text-white hover:bg-emerald-800 disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed"
        >
          Check this medicine
        </button>
      </div>

      {recent.items.length > 0 && (
        <div>
          <p className="m-0 mb-2.5 text-[11.5px] font-bold tracking-widest uppercase text-stone-500">Recent</p>
          <ul className="list-none p-0 m-0 flex flex-col">
            {recent.items.map((r) => (
              <li key={r.medicine}>
                <button
                  type="button"
                  onClick={() => run(r.medicine)}
                  className="w-full text-left bg-transparent border-b border-stone-200 py-3 flex items-center gap-3 cursor-pointer hover:bg-stone-100/40 transition-colors"
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${(VERDICT[r.verdict] || VERDICT.unknown).dot}`} />
                  <span className="flex-1 text-[15px] font-semibold text-stone-800">{r.medicine}</span>
                  <span className="text-xs text-stone-500">{verdictMeta(r.verdict).label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}

function LoadingView({ query }) {
  return (
    <div className="flex-1 flex flex-col justify-center gap-4">
      <span
        className="inline-block w-3.5 h-3.5 rounded-full bg-emerald-600"
        style={{ animation: 'lqtsBreath 1.6s ease-in-out infinite' }}
      />
      <style>{`
        @keyframes lqtsBreath {
          0%, 100% { opacity: 0.35; transform: scale(0.9); }
          50%      { opacity: 1;    transform: scale(1.25); }
        }
        @keyframes lqtsFade {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <p className="m-0 text-[17px] font-semibold text-stone-500">
        Checking <span className="text-stone-800">{query}</span>…
      </p>
      <p className="m-0 text-[13px] text-stone-400 text-pretty">
        Looking this up in the CredibleMeds database. Just a moment.
      </p>
    </div>
  );
}

function ResultView({ result, showIngredients, setShowIngredients }) {
  const v = verdictMeta(result.overall_verdict);
  const tone = VERDICT[result.overall_verdict] || VERDICT.unknown;
  const isUnknown = result.overall_verdict === 'unknown';

  return (
    <div className="flex flex-col gap-3.5 pt-4 pb-2">
      <div className={`rounded-3xl p-5 flex flex-col gap-3.5 ${tone.wash}`}>
        <div className="flex items-center gap-2.5">
          <span className={`inline-flex items-center gap-2 bg-white rounded-full pl-2.5 pr-3 py-1 text-[11.5px] font-extrabold tracking-wider uppercase shadow-sm ${tone.ink}`}>
            <span className={`w-2 h-2 rounded-full ${tone.dot}`} />
            {v.label}
          </span>
          <span className={`text-[12.5px] font-bold opacity-85 ${tone.ink}`}>
            {result.medicine}
          </span>
        </div>

        <h2 className="m-0 text-2xl font-extrabold leading-[1.18] tracking-tight text-stone-800 text-balance">
          {v.heading}
        </h2>

        {!isUnknown ? (
          <p className="m-0 text-base leading-[1.5] text-stone-800 text-pretty">
            {result.plain_english}
          </p>
        ) : (
          <p className="m-0 text-[15px] leading-[1.5] text-stone-800 text-pretty">
            We couldn't find <strong className="font-extrabold">{result.medicine}</strong> in the CredibleMeds database.
            <br />
            <span className="text-stone-500">
              That doesn't mean it's safe — please check with your pharmacist or cardiologist before taking it.
            </span>
          </p>
        )}
      </div>

      {result.ingredients?.length > 0 && (
        <div className="bg-white rounded-3xl shadow-[0_1px_2px_rgba(60,56,40,0.04),_0_8px_24px_-10px_rgba(60,56,40,0.10)] overflow-hidden">
          <button
            onClick={() => setShowIngredients((s) => !s)}
            className="w-full bg-transparent border-none py-3.5 px-[18px] flex items-center justify-between cursor-pointer"
          >
            <span className="text-sm font-extrabold text-stone-800">What's in it</span>
            <span className={`text-[11px] text-stone-500 font-bold transition-transform duration-200 ${showIngredients ? 'rotate-180' : ''}`}>▾</span>
          </button>
          {showIngredients && (
            <ul
              className="list-none m-0 px-[18px] pb-3.5"
              style={{ animation: 'lqtsFade 280ms ease' }}
            >
              {result.ingredients.map((ing) => (
                <li
                  key={ing.ingredient_name}
                  className="flex items-center gap-2.5 py-2.5 border-t border-stone-200/70"
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${ingredientDot(ing.risk_category)}`} />
                  <span className="flex-1 text-sm font-bold text-stone-800">{ing.ingredient_name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function ErrorView({ onRetry }) {
  return (
    <div className="flex-1 flex flex-col justify-center gap-4">
      <span className="w-2.5 h-2.5 rounded-full bg-stone-400" />
      <h2 className="m-0 text-2xl font-extrabold leading-[1.15] tracking-tight text-stone-800 text-balance">
        We couldn't reach the database
      </h2>
      <p className="m-0 text-[15px] text-stone-500 leading-[1.5]">
        Please check your connection and try again in a moment.
      </p>
      <button
        onClick={onRetry}
        className="self-start rounded-full bg-emerald-700 text-white px-6 py-3 text-sm font-bold hover:bg-emerald-800 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}

function SearchGlyph({ className = '' }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="9" cy="9" r="6.25" stroke="currentColor" strokeWidth="1.8" />
      <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
