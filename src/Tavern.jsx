import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Tavern() {
  const [state, setState] = useState(() => {
    try {
      const s = localStorage.getItem("ducat_game_en");
      return s ? JSON.parse(s) : {};
    } catch {
      return {};
    }
  });

  const [bet, setBet] = useState(100);
  const [message, setMessage] = useState("");
  const [rumors, setRumors] = useState([]);

  // lista przykładowych plotek
  const possibleRumors = [
    "A traveling merchant arrived — building costs are 10% cheaper today!",
    "Miners whisper about a gold-rich vein found near the mountains.",
    "An unknown noble sponsors dueling contests in the capital.",
    "Rumor says a hidden cave doubles mining power for brave adventurers.",
    "Bards sing that tomorrow brings a new world event...",
  ];

  useEffect(() => {
    // wczytaj losowe plotki przy wejściu
    const shuffled = possibleRumors.sort(() => 0.5 - Math.random());
    setRumors(shuffled.slice(0, 3));
  }, []);

  function saveGame(updated) {
    localStorage.setItem("ducat_game_en", JSON.stringify(updated));
    setState(updated);
  }

  // 🎲 Rzut kością
  function rollDice() {
    const current = { ...state };
    if (current.balance < bet) {
      setMessage("Not enough $CROWN to gamble!");
      return;
    }
    const roll = Math.floor(Math.random() * 6) + 1;
    if (roll >= 4) {
      const win = bet * 2;
      current.balance += win;
      setMessage(`🎲 You rolled ${roll}! You won ${win} $CROWN!`);
    } else {
      current.balance -= bet;
      setMessage(`🎲 You rolled ${roll}... You lost ${bet} $CROWN.`);
    }
    saveGame(current);
  }

  // 🍺 Zakup alkoholu — zwiększa energię górników
  function buyBeer(price, energyGain) {
    const current = { ...state };
    if (current.balance < price) {
      setMessage("You can’t afford that drink!");
      return;
    }
    current.balance -= price;
    current.energy = Math.min(200, (current.energy || 0) + energyGain);
    saveGame(current);
    setMessage(`🍺 You bought a drink! Miners’ energy +${energyGain}`);
  }

return (
  <div className="min-h-screen bg-gradient-to-b from-[#1c1a17] via-[#2a2520] to-[#1a1713] text-gray-200 p-6">
    <header className="flex justify-between items-center mb-6 border-b border-[#3b332b]/60 pb-3">
      <h1 className="text-3xl font-bold text-amber-400">🍻 CrownForge Tavern</h1>
      <Link
        to="/"
        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-black font-semibold shadow transition"
      >
        Return to Kingdom
      </Link>
    </header>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 🎲 DICE GAME */}
      <div className="p-5 bg-[#2a2520]/80 border border-[#3b332b] rounded-2xl shadow-lg flex flex-col">
        <img
          src="/images/tavern/dice_game.png"
          alt="Dice Game"
          className="w-full h-40 object-cover rounded-xl mb-3 shadow-md border border-[#3b332b]"
        />
        <h2 className="text-xl font-semibold text-amber-300 mb-2">Dice Game</h2>
        <p className="text-sm text-gray-400 mb-3">Bet some $CROWN and try your luck!</p>
        <input
          type="number"
          min="10"
          value={bet}
          onChange={(e) => setBet(Number(e.target.value))}
          className="w-full p-2 mb-3 rounded bg-[#1f1a16] border border-[#3b332b] text-gray-200"
        />
        <button
          onClick={rollDice}
          className="w-full px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition"
        >
          Roll Dice
        </button>
      </div>

      {/* 🍺 BUY DRINKS */}
      <div className="p-5 bg-[#2a2520]/80 border border-[#3b332b] rounded-2xl shadow-lg flex flex-col">
        <img
          src="/images/tavern/buy_drinks.png"
          alt="Buy Drinks"
          className="w-full h-40 object-cover rounded-xl mb-3 shadow-md border border-[#3b332b]"
        />
        <h2 className="text-xl font-semibold text-amber-300 mb-2">Buy Drinks</h2>
        <p className="text-sm text-gray-400 mb-3">
          Drinks restore your miners’ <span className="text-amber-300">energy</span>!
        </p>

        <div className="space-y-2">
          <button
            onClick={() => buyBeer(100, 10)}
            className="w-full flex justify-between px-3 py-2 bg-[#3a322a]/80 hover:bg-[#4a3b30] rounded-lg border border-[#5a4a3b]/60 transition"
          >
            <span>🍺 Ale (10 energy)</span>
            <span className="text-amber-300">100 $CROWN</span>
          </button>
          <button
            onClick={() => buyBeer(250, 25)}
            className="w-full flex justify-between px-3 py-2 bg-[#3a322a]/80 hover:bg-[#4a3b30] rounded-lg border border-[#5a4a3b]/60 transition"
          >
            <span>🍷 Wine (25 energy)</span>
            <span className="text-amber-300">250 $CROWN</span>
          </button>
          <button
            onClick={() => buyBeer(600, 60)}
            className="w-full flex justify-between px-3 py-2 bg-[#3a322a]/80 hover:bg-[#4a3b30] rounded-lg border border-[#5a4a3b]/60 transition"
          >
            <span>🥃 Dwarven Spirits (60 energy)</span>
            <span className="text-amber-300">600 $CROWN</span>
          </button>
        </div>

        <p className="mt-4 text-sm text-gray-400">
          Current Energy:{" "}
          <span className="text-amber-300 font-mono">{state.energy || 0}</span>
        </p>
      </div>

      {/* 🗞️ WORLD RUMORS */}
      <div className="p-5 bg-[#2a2520]/80 border border-[#3b332b] rounded-2xl shadow-lg flex flex-col">
        <img
          src="/images/tavern/world_rumors.png"
          alt="World Rumors"
          className="w-full h-40 object-cover rounded-xl mb-3 shadow-md border border-[#3b332b]"
        />
        <h2 className="text-xl font-semibold text-amber-300 mb-2">World Rumors</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-300 flex-1">
          {rumors.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>
    </div>

    {/* KOMUNIKAT */}
    {message && (
      <div className="mt-6 text-center text-amber-300 bg-black/30 py-3 rounded-lg border border-amber-700/40">
        {message}
      </div>
    )}
  </div>
);
}
