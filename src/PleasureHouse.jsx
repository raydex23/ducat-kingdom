import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function PleasureHouse() {
  const [state, setState] = useState(() => {
    try {
      const s = localStorage.getItem("ducat_game_en");
      return s ? JSON.parse(s) : {};
    } catch {
      return {};
    }
  });

  const [result, setResult] = useState(null);
  const [eventMsg, setEventMsg] = useState(null);
  const [isOpening, setIsOpening] = useState(false);

  const PACK_COST = 5000;

  const rooms = [
    {
      id: 1,
      name: "Velvet Room",
      rarity: "common",
      color: "text-gray-300",
      bonusEnergy: 20,
      bonusPower: 10,
      flavor: "A cozy room scented with lilac — the miners’ favorite.",
    },
    {
      id: 2,
      name: "Golden Chamber",
      rarity: "uncommon",
      color: "text-amber-300",
      bonusEnergy: 40,
      bonusPower: 25,
      flavor: "Luxurious pillows and fine wine, you feel oddly more productive.",
    },
    {
      id: 3,
      name: "Crimson Suite",
      rarity: "rare",
      color: "text-red-400",
      bonusEnergy: 70,
      bonusPower: 50,
      flavor: "Red silk and soft laughter echo through the halls.",
    },
    {
      id: 4,
      name: "Duchess Lounge",
      rarity: "epic",
      color: "text-purple-400",
      bonusEnergy: 100,
      bonusPower: 90,
      flavor: "Visited only by nobles, its aura alone inspires greatness.",
    },
    {
      id: 5,
      name: "Queen’s Sanctuary",
      rarity: "legendary",
      color: "text-pink-400",
      bonusEnergy: 150,
      bonusPower: 150,
      flavor: "A myth among men — said to restore the will of entire kingdoms.",
    },
  ];

  const randomEvent = [
    { msg: "💃 A mysterious guest tips generously (+500 $CROWN)", effect: (s) => (s.balance += 500) },
    { msg: "🍷 You overhear trade secrets — upgrades 10% cheaper today!", effect: (s) => (s.discount = Date.now()) },
    { msg: "🎲 The music never stops tonight — mining gains boosted!", effect: (s) => (s.boost = Date.now()) },
    { msg: "🕯️ A quiet night... nothing happens.", effect: () => {} },
  ];

  function saveGame(updated) {
    localStorage.setItem("ducat_game_en", JSON.stringify(updated));
    setState(updated);
  }

  function openPack() {
    if (isOpening) return;
    const current = { ...state };
    if (current.balance < PACK_COST) {
      setEventMsg("Not enough $CROWN to buy a Pleasure Pack!");
      return;
    }
    setIsOpening(true);
    setResult(null);
    setEventMsg(null);
    current.balance -= PACK_COST;

    // losowy pokój
    const room = rooms[Math.floor(Math.random() * rooms.length)];

    // jeśli już masz ten pokój, dostajesz rekompensatę
    const owned = current.pleasureRooms || [];
    const alreadyOwned = owned.includes(room.id);
    if (!alreadyOwned) {
      owned.push(room.id);
      current.pleasureRooms = owned;
      current.maxEnergy = (current.maxEnergy || 100) + room.bonusEnergy;
      current.miningPower = (current.miningPower || 1) + room.bonusPower;
    } else {
      current.balance += 1000;
    }

    // losowy event
    const ev = randomEvent[Math.floor(Math.random() * randomEvent.length)];
    ev.effect(current);

    saveGame(current);

    // animacja otwierania
    setTimeout(() => {
      setResult({ ...room, duplicate: alreadyOwned });
      setEventMsg(ev.msg);
      setIsOpening(false);
    }, 1500);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1b1815] via-[#2a2520] to-[#14110f] text-gray-200 p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-6 border-b border-[#3b332b]/60 pb-3">
        <h1 className="text-3xl font-bold text-pink-400">💋 CrownForge Pleasure House</h1>
        <Link
          to="/"
          className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-black font-semibold shadow transition"
        >
          Return to Kingdom
        </Link>
      </header>

      {/* Main section */}
      <div className="p-6 bg-[#2a2520]/80 border border-[#3b332b] rounded-2xl shadow-lg max-w-3xl mx-auto text-center">
        <img
          src="/images/world/pleasure.png"
          alt="Pleasure House"
          className="w-full h-48 object-cover rounded-xl border border-[#3b332b] shadow mb-4"
        />

        <h2 className="text-xl font-semibold text-pink-300 mb-3">Pleasure Packs</h2>
        <p className="text-sm text-gray-400 mb-4">
          Open a Pleasure Pack to reveal a luxurious room and permanent bonuses to your miners.
        </p>

        <button
          onClick={openPack}
          disabled={isOpening}
          className={`px-5 py-3 rounded-xl text-lg font-semibold shadow transition ${
            isOpening
              ? "bg-gray-600 text-gray-300 cursor-not-allowed"
              : "bg-pink-600 hover:bg-pink-700 text-black"
          }`}
        >
          {isOpening ? "Opening..." : `Buy Pleasure Pack (${PACK_COST} $CROWN)`}
        </button>

        {/* Result reveal */}
        {result && (
          <div className="mt-6 p-5 border border-[#5a4a3b]/70 rounded-xl bg-[#1f1a16]/70 shadow-inner animate-fadeIn">
            <h3 className={`text-2xl font-bold mb-2 ${result.color}`}>
              {result.name}{" "}
              <span className="text-sm text-gray-400">({result.rarity})</span>
            </h3>
            <p className="text-sm text-gray-300 mb-2 italic">{result.flavor}</p>
            {result.duplicate ? (
              <p className="text-amber-300 font-mono">
                Duplicate room! You received 1000 $CROWN compensation.
              </p>
            ) : (
              <p className="text-amber-300 font-mono">
                +{result.bonusEnergy} Max Energy • +{result.bonusPower} Mining Power
              </p>
            )}
          </div>
        )}

        {/* Event outcome */}
        {eventMsg && (
          <div className="mt-4 text-center text-pink-300 bg-black/30 py-3 rounded-lg border border-pink-700/40">
            {eventMsg}
          </div>
        )}
      </div>

      {/* Owned rooms list */}
      {state.pleasureRooms?.length > 0 && (
        <div className="mt-8 max-w-3xl mx-auto bg-[#2a2520]/80 border border-[#3b332b] rounded-2xl shadow-lg p-5">
          <h3 className="text-lg font-semibold text-pink-300 mb-3">Owned Rooms</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rooms
              .filter((r) => state.pleasureRooms.includes(r.id))
              .map((r) => (
                <div
                  key={r.id}
                  className="p-3 bg-[#1f1a16]/60 border border-[#3b332b] rounded-xl text-left"
                >
                  <div className={`font-semibold ${r.color}`}>{r.name}</div>
                  <div className="text-xs text-gray-400 capitalize">{r.rarity}</div>
                  <div className="text-amber-300 text-sm mt-1">
                    +{r.bonusEnergy} Max Energy, +{r.bonusPower} Power
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
