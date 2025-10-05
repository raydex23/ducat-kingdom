import React, { useEffect, useState } from 'react';

const DEFAULT_STATE = {
  balance: 5000,
  miningPower: 1,
  kingdomLevel: 1,
  lastUpgradeAt: null,
  buildings: [],
  lastCollectedAt: Date.now(),
  startTime: Date.now(),
};

const BUILDINGS = [
  { id: 'coal', name: 'Coal Mine', price: 300, basePower: 2, rarity: 'common' },
  { id: 'iron', name: 'Iron Mine', price: 800, basePower: 6, rarity: 'rare' },
  { id: 'gold', name: 'Gold Mine', price: 2000, basePower: 15, rarity: 'epic' },
  { id: 'diamond', name: 'Diamond Mine', price: 6000, basePower: 50, rarity: 'legendary' },
];

function usePersistedState(key, defaultVal) {
  const [state, setState] = useState(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : defaultVal;
    } catch {
      return defaultVal;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);
  return [state, setState];
}

function BrandHeader() {
  return (
    <header className="mb-8 md:mb-10 text-center">
      <div className="inline-flex flex-col items-center">
        <img
          src="/images/logo.png"
          alt="Crownforge"
          className="h-24 md:h-32 w-auto drop-shadow-[0_4px_15px_rgba(0,0,0,0.25)]"
          loading="eager"
          decoding="async"
        />
        <h1 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-gray-800">
          Crownforge <span className="text-amber-600">— Beta</span>
        </h1>
        <p className="text-sm md:text-base text-gray-500 mt-1">
          Build your realm, forge your wealth, rule the kingdom.
        </p>
      </div>
    </header>
  );
}

export default function App() {
  const [state, setState] = usePersistedState('ducat_game_en', DEFAULT_STATE);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const gain = state.miningPower / 10;
    const timer = setInterval(() => {
      setState(st => ({ ...st, balance: st.balance + gain }));
    }, 1000);
    return () => clearInterval(timer);
  }, [state.miningPower, setState]);

  useEffect(() => {
    const halvingInterval = 7 * 24 * 60 * 60 * 1000;
    const t = setInterval(() => {
      const elapsed = now - state.startTime;
      const halvings = Math.floor(elapsed / halvingInterval);
      if (halvings > 0) {
        setState(st => ({
          ...st,
          miningPower: Math.max(1, st.miningPower / 2),
          startTime: st.startTime + halvings * halvingInterval
        }));
      }
    }, 60000);
    return () => clearInterval(t);
  }, [now, state.startTime, setState]);

  function buyBuilding(id) {
    const t = BUILDINGS.find(b => b.id === id);
    if (!t) return;
    if (state.balance < t.price) return alert('Not enough $DUCAT');
    setState(st => {
      const newBuildings = [...st.buildings];
      const idx = newBuildings.findIndex(b => b.id === id);
      if (idx >= 0) newBuildings[idx].count += 1;
      else newBuildings.push({ ...t, count: 1 });
      return {
        ...st,
        balance: st.balance - t.price,
        buildings: newBuildings,
        miningPower: st.miningPower + t.basePower
      };
    });
  }

  const KingdomImage = React.memo(function KingdomImage({ level }) {
    const clamped = Math.min(level, 5);
    const imgSrc = `/images/kingdom_lvl${clamped}.png`;

    return (
      <div className="relative w-full overflow-hidden rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] bg-gradient-to-b from-amber-50 to-amber-100 border border-amber-200">
        <img
          src={imgSrc}
          alt={`Kingdom level ${level}`}
          className="w-full h-64 md:h-80 object-cover"
          loading="eager"
          decoding="async"
        />
        <div className="absolute bottom-2 right-3 text-xs md:text-sm text-white/95 bg-black/40 backdrop-blur px-2 py-1 rounded">
          Level {level}
        </div>
      </div>
    );
  });

  function upgradeKingdom() {
    if (state.balance < 1000) return alert('Not enough $DUCAT');
    setState(st => ({
      ...st,
      balance: st.balance - 1000,
      kingdomLevel: st.kingdomLevel + 1,
      miningPower: st.miningPower + 10,
      lastUpgradeAt: now
    }));
  }

  function reset() {
    if (confirm('Reset game data?')) {
      localStorage.removeItem('ducat_game_en');
      location.reload();
    }
  }

  const halvingInterval = 7 * 24 * 60 * 60 * 1000;
  const nextHalving = Math.max(0, halvingInterval - (now - state.startTime));

  return (
    <div className="p-6">
      <BrandHeader />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <div className="p-4 md:p-5 bg-white/90 backdrop-blur rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-semibold text-xl">Kingdom Status</h2>
                <div className="mt-3">
                  <KingdomImage level={state.kingdomLevel} />
                </div>
                <p className="mt-3 text-sm text-gray-600">Level: {state.kingdomLevel}</p>
                <p className="text-sm text-gray-600">
                  Mining Power: {Math.floor(state.miningPower)}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Balance</div>
                <div className="font-mono text-2xl tabular-nums">
                  {Math.floor(state.balance)} $DUCAT
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={upgradeKingdom}
                className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm hover:shadow transition-all"
              >
                Upgrade Kingdom (1000 $DUCAT)
              </button>
              <button
                onClick={reset}
                className="ml-3 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/15 text-red-700 border border-red-200 transition"
              >
                Reset
              </button>
            </div>

            <div className="mt-2 text-sm text-gray-500">
              Next halving in: {Math.ceil(nextHalving / 1000 / 60 / 60)}h
            </div>
          </div>

          <div className="p-4 md:p-5 bg-white/90 backdrop-blur rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-gray-100">
            <h3 className="font-semibold">Available Mines</h3>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BUILDINGS.map(b => (
                <div key={b.id} className="p-3 border rounded">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold">
                        {b.name} <span className="text-xs text-gray-500">({b.rarity})</span>
                      </div>
                      <div className="text-sm text-gray-500">Power +{b.basePower}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono">{b.price} $DUCAT</div>
                      <button
                        onClick={() => buyBuilding(b.id)}
                        className="mt-2 px-3 py-1.5 rounded-xl bg-sky-500/90 hover:bg-sky-600 text-white shadow-sm transition-all"
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 md:p-5 bg-white/90 backdrop-blur rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-gray-100">
            <h3 className="font-semibold">Your Mines</h3>
            {state.buildings.length === 0 && (
              <div className="text-sm text-gray-500">No mines owned</div>
            )}
            {state.buildings.map(b => (
              <div key={b.id} className="flex justify-between p-2 border-b">
                <div>
                  {b.name} x{b.count}{' '}
                  <span className="text-xs text-gray-400">({b.rarity})</span>
                </div>
                <div className="font-mono">+{b.basePower * b.count} MP</div>
              </div>
            ))}
          </div>
        </div>

        <aside className="md:sticky md:top-6 h-fit">
          <div className="p-4 bg-white rounded-lg shadow mb-4">
            <h4 className="font-semibold">Statistics</h4>
            <div className="mt-2 text-sm">
              <div>
                Mining Power:{' '}
                <span className="font-mono tabular-nums">
                  {Math.floor(state.miningPower)}
                </span>
              </div>
              <div>
                Balance:{' '}
                <span className="font-mono">{Math.floor(state.balance)}</span> $DUCAT
              </div>
              <div>Kingdom Level: {state.kingdomLevel}</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
