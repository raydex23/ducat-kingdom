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
    <header className="mb-8 md:mb-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        {/* LOGO + NAZWA */}
        <div className="flex items-center gap-3">
          <img
            src="/images/logo.png"
            alt="Crownforge"
            className="h-14 md:h-16 w-auto drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
            loading="eager"
            decoding="async"
          />
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-100">
            Crownforge <span className="text-amber-400">— Beta</span>
          </h1>
        </div>

        {/* MENU */}
        <nav className="flex gap-4 md:gap-6 text-sm md:text-base font-medium text-gray-300">
          <a
            href="https://jup.ag/swap/SOL-DUCAT"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-400 transition-colors"
          >
            Trade $DUCAT
          </a>
          <a
            href="#economy"
            className="hover:text-amber-400 transition-colors"
          >
            Economy
          </a>
          <a
            href="#roadmap"
            className="hover:text-amber-400 transition-colors"
          >
            Roadmap
          </a>
          <a
            href="#community"
            className="hover:text-amber-400 transition-colors"
          >
            Community
          </a>
        </nav>
      </div>

      {/* linia pod menu */}
      <div className="mt-4 border-t border-[#3b332b]" />
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

  // Mroczniejsza oprawa ramki sceny
  const KingdomImage = React.memo(function KingdomImage({ level }) {
    const clamped = Math.min(level, 5);
    const imgSrc = `/images/kingdom_lvl${clamped}.png`;

    return (
      <div className="relative w-full overflow-hidden rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.55)] bg-gradient-to-b from-[#2a2520] to-[#1f1a16] border border-[#3b332b]">
        <img
          src={imgSrc}
          alt={`Kingdom level ${level}`}
          className="w-full h-64 md:h-80 object-cover"
          loading="eager"
          decoding="async"
        />
        {/* subtelna winieta */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(120%_80%_at_50%_10%,transparent,rgba(0,0,0,0.35))]" />
        <div className="absolute bottom-2 right-3 text-xs md:text-sm text-amber-200 bg-black/40 backdrop-blur px-2 py-1 rounded">
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
    <div className="min-h-screen bg-gradient-to-b from-[#1c1a17] via-[#2a2520] to-[#1a1713] text-gray-200 p-6">
      <BrandHeader />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          {/* STATUS */}
          <div className="p-4 md:p-5 bg-[#2a2520]/80 backdrop-blur rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-[#3b332b]">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-semibold text-xl text-amber-400">Kingdom Status</h2>
                <div className="mt-3">
                  <KingdomImage level={state.kingdomLevel} />
                </div>
                <p className="mt-3 text-sm text-gray-300">Level: {state.kingdomLevel}</p>
                <p className="text-sm text-gray-300">
                  Mining Power: {Math.floor(state.miningPower)}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Balance</div>
                <div className="font-mono text-2xl tabular-nums text-amber-300">
                  {Math.floor(state.balance)} $DUCAT
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={upgradeKingdom}
                className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-black/90 hover:text-black shadow-sm hover:shadow transition-all"
              >
                Upgrade Kingdom (1000 $DUCAT)
              </button>
              <button
                onClick={reset}
                className="ml-3 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-900/40 transition"
              >
                Reset
              </button>
            </div>

            <div className="mt-2 text-sm text-gray-400">
              Next halving in: {Math.ceil(nextHalving / 1000 / 60 / 60)}h
            </div>
          </div>

          {/* AVAILABLE MINES */}
          <div className="p-4 md:p-5 bg-[#2a2520]/80 backdrop-blur rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-[#3b332b]">
            <h3 className="font-semibold text-amber-300">Available Mines</h3>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BUILDINGS.map(b => (
                <div key={b.id} className="p-3 border border-[#3b332b] rounded bg-[#1f1a16]/60">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-100">
                        {b.name}{' '}
                        <span className="text-xs text-gray-400">({b.rarity})</span>
                      </div>
                      <div className="text-sm text-gray-400">Power +{b.basePower}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-gray-200">{b.price} $DUCAT</div>
                      <button
                        onClick={() => buyBuilding(b.id)}
                        className="mt-2 px-3 py-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-700 text-white shadow-sm transition-all"
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* YOUR MINES */}
          <div className="p-4 md:p-5 bg-[#2a2520]/80 backdrop-blur rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-[#3b332b]">
            <h3 className="font-semibold text-amber-300">Your Mines</h3>
            {state.buildings.length === 0 && (
              <div className="text-sm text-gray-400">No mines owned</div>
            )}
            {state.buildings.map(b => (
              <div key={b.id} className="flex justify-between p-2 border-b border-[#3b332b]">
                <div className="text-gray-200">
                  {b.name} x{b.count}{' '}
                  <span className="text-xs text-gray-400">({b.rarity})</span>
                </div>
                <div className="font-mono text-amber-200">+{b.basePower * b.count} MP</div>
              </div>
            ))}
          </div>
        </div>

        {/* STATS */}
        <aside className="md:sticky md:top-6 h-fit">
          <div className="p-4 bg-[#2a2520]/80 backdrop-blur rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-[#3b332b] mb-4">
            <h4 className="font-semibold text-amber-300">Statistics</h4>
            <div className="mt-2 text-sm">
              <div className="text-gray-300">
                Mining Power:{' '}
                <span className="font-mono tabular-nums text-gray-100">
                  {Math.floor(state.miningPower)}
                </span>
              </div>
              <div className="text-gray-300">
                Balance:{' '}
                <span className="font-mono text-amber-200">{Math.floor(state.balance)}</span> $DUCAT
              </div>
              <div className="text-gray-300">Kingdom Level: {state.kingdomLevel}</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
