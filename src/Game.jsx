import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import CrownBalance from "./components/CrownBalance";
import CrownFaucet from "./components/CrownFaucet";

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
  { id: 'coal',    name: 'Coal Mine',    price: 300,  basePower: 2,  rarity: 'common'    },
  { id: 'iron',    name: 'Iron Mine',    price: 800,  basePower: 6,  rarity: 'rare'      },
  { id: 'gold',    name: 'Gold Mine',    price: 2000, basePower: 15, rarity: 'epic'      },
  { id: 'diamond', name: 'Diamond Mine', price: 6000, basePower: 50, rarity: 'legendary' },
];

function maxMinesForLevel(level){ return 2 + 2 * (level - 1) }
function requiredLevelFor(buildingId){
  if(buildingId === 'gold') return 2;
  if(buildingId === 'diamond') return 3;
  return 1;
}
function isUnlocked(buildingId, level){ return level >= requiredLevelFor(buildingId) }
function getUpgradeCost(currentLevel){
  return 1000 * Math.pow(3, Math.max(0, currentLevel - 1))
}

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
    <header className="mb-8 md:mb-10 border-b border-[#3b332b]/70 pb-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        {/* LOGO + NAME */}
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

        {/* MENU + WALLET */}
        <div className="flex items-center gap-5 md:gap-6">
          <nav className="flex gap-4 md:gap-6 items-center text-sm md:text-base font-medium text-gray-300">
            <a href="/ranking" className="hover:text-amber-400 transition">Ranking</a>
            <a href="https://jup.ag/swap/SOL-CROWN" target="_blank" className="hover:text-amber-400 transition">Trade $CROWN</a>
            <CrownBalance />
          </nav>

          <div className="ml-2">
            <WalletMultiButton className="!bg-amber-600 hover:!bg-amber-700 !text-black font-semibold !rounded-xl !px-4 !py-2 shadow-sm hover:shadow transition-all border border-amber-700/50" />
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Game() {
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
    if (!isUnlocked(t.id, state.kingdomLevel)) {
      return alert(`Locked: ${t.name} unlocks at Kingdom Level ${requiredLevelFor(t.id)}.`);
    }
    const usedSlots = state.buildings.reduce((sum, b) => sum + (b.count || 0), 0);
    const maxSlots = maxMinesForLevel(state.kingdomLevel);
    if (usedSlots >= maxSlots) {
      return alert(`Mine limit reached: ${usedSlots}/${maxSlots}. Upgrade your kingdom to build more.`);
    }
    if (state.balance < t.price) return alert('Not enough $CROWN');
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
      <div className="relative w-full overflow-hidden rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.55)] bg-gradient-to-b from-[#2a2520] to-[#1f1a16] border border-[#3b332b]">
        <img src={imgSrc} alt={`Kingdom level ${level}`} className="w-full h-64 md:h-80 object-cover" loading="eager" decoding="async" />
        <div className="absolute bottom-2 right-3 text-xs md:text-sm text-amber-200 bg-black/40 backdrop-blur px-2 py-1 rounded">Level {level}</div>
      </div>
    );
  });

  const upgradeCost = getUpgradeCost(state.kingdomLevel);
  function upgradeKingdom() {
    if (state.balance < upgradeCost) return alert('Not enough $CROWN');
    setState(st => ({
      ...st,
      balance: st.balance - upgradeCost,
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
  const usedSlots = state.buildings.reduce((sum, b) => sum + (b.count || 0), 0);
  const maxSlots = maxMinesForLevel(state.kingdomLevel);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1c1a17] via-[#2a2520] to-[#1a1713] text-gray-200 p-6">
      <BrandHeader />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* LEWA KOLUMNA */}
        <div className="md:col-span-2 space-y-4">
          {/* WORLD NAVIGATION */}
          <div className="p-4 md:p-5 bg-[#2a2520]/80 backdrop-blur rounded-2xl border border-[#3b332b] shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <h2 className="font-semibold text-xl text-amber-400 mb-3 text-center">World Navigation</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'tavern', label: 'Tavern', color: 'text-amber-300' },
                { id: 'pleasure', label: 'Pleasure House', color: 'text-pink-300' },
                { id: 'alliance', label: 'Alliance', color: 'text-blue-300' },
                { id: 'raids', label: 'Raids', color: 'text-red-300' },
              ].map(b => (
                <div key={b.id} className="flex flex-col items-center">
                  <img
                    src={`/images/world/${b.id}.png`}
                    alt={b.label}
                    className="w-20 h-20 object-cover rounded-xl border border-[#3b332b] mb-2 hover:scale-105 transition-transform duration-200"
                  />
                  <button
                    className={`w-full px-3 py-2 rounded-xl bg-[#3a322a]/70 hover:bg-[#4a3b30] ${b.color} border border-[#5a4a3b]/60 shadow-sm transition text-sm`}
                  >
                    {b.label}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* AVAILABLE MINES */}
          <div className="p-4 md:p-5 bg-[#2a2520]/80 backdrop-blur rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-[#3b332b]">
            <h3 className="font-semibold text-amber-300">Available Mines</h3>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BUILDINGS.map(b => {
                const unlocked = isUnlocked(b.id, state.kingdomLevel);
                const canBuy = unlocked && usedSlots < maxSlots && state.balance >= b.price;
                const imgSrc = `/images/mines/${b.id}.png`;

                return (
                  <div key={b.id} className="p-3 border border-[#3b332b] rounded bg-[#1f1a16]/60 flex gap-3 items-center">
                    <img src={imgSrc} alt={b.name} className="w-20 h-20 object-cover rounded-lg border border-[#3b332b]" loading="lazy" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-gray-100">{b.name} <span className="text-xs text-gray-400">({b.rarity})</span></div>
                          {!unlocked ? (
                            <div className="text-xs text-red-300 mt-1">Locked — requires Kingdom Level {requiredLevelFor(b.id)}</div>
                          ) : (
                            <div className="text-sm text-gray-400">Power +{b.basePower}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-gray-200">{b.price} $CROWN</div>
                          <button
                            onClick={() => canBuy ? buyBuilding(b.id) : null}
                            disabled={!canBuy}
                            className={
                              "mt-2 px-3 py-1.5 rounded-xl transition-all " +
                              (canBuy ? "bg-emerald-600/90 hover:bg-emerald-700 text-white shadow-sm"
                                      : "bg-gray-700 text-gray-400 cursor-not-allowed")
                            }
                            title={
                              !unlocked ? `Unlock at Kingdom Level ${requiredLevelFor(b.id)}`
                              : usedSlots >= maxSlots ? "Mine limit reached — upgrade your kingdom"
                              : state.balance < b.price ? "Not enough $CROWN" : "Buy"
                            }
                          >
                            {unlocked ? "Buy" : "Locked"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* YOUR MINES */}
          <div className="p-4 md:p-5 bg-[#2a2520]/80 backdrop-blur rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-[#3b332b]">
            <h3 className="font-semibold text-amber-300">Your Mines</h3>
            {state.buildings.length === 0 && <div className="text-sm text-gray-400">No mines owned</div>}
            {state.buildings.map(b => (
              <div key={b.id} className="flex justify-between p-2 border-b border-[#3b332b]">
                <div className="text-gray-200">{b.name} x{b.count} <span className="text-xs text-gray-400">({b.rarity})</span></div>
                <div className="font-mono text-amber-200">+{b.basePower * b.count} MP</div>
              </div>
            ))}
          </div>
        </div>

        {/* PRAWA KOLUMNA */}
        <aside className="md:sticky md:top-6 h-fit">
          <div className="p-4 bg-[#2a2520]/80 backdrop-blur rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-[#3b332b] space-y-4">
            <h3 className="font-semibold text-amber-400 text-center">Your Kingdom</h3>
            <div className="font-mono text-xl text-amber-300">CURRENT ESTIMATE: {Math.floor(state.balance)} $CROWN</div>
            <KingdomImage level={state.kingdomLevel} />
            <div>
              <p className="text-sm text-gray-300">Level: {state.kingdomLevel}</p>
              <p className="text-sm text-gray-300">Mining Power: {Math.floor(state.miningPower)}</p>
              <p className="text-sm text-gray-300">Mine Slots: <span className="font-mono">{usedSlots}/{maxSlots}</span></p>
              <p className="text-sm text-gray-300 mt-1">Est. daily yield: <span className="font-mono text-amber-300">{Math.floor(state.miningPower * 864)} $CROWN</span></p>
              <div className="mt-3 text-right">
                <div className="text-xs text-gray-500 mb-1">Next halving in: {Math.ceil(nextHalving / 1000 / 60 / 60)}h</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-3">
              <button onClick={upgradeKingdom} className="flex-1 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-black font-semibold shadow transition-all">Upgrade ({upgradeCost} $CROWN)</button>
              <button onClick={reset} className="flex-1 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-900/40 transition">Reset</button>
              <CrownFaucet balance={state.balance} resetBalance={() => setState(st => ({ ...st, balance: 0 }))} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
