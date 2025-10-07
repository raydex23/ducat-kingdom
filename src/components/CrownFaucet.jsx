import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

export default function CrownFaucet({ balance, resetBalance }) {
  const { publicKey } = useWallet();
  const [status, setStatus] = useState("idle");

  async function claim() {
    if (!publicKey) return alert("Connect wallet first!");
    if (balance <= 0) return alert("No $CROWN to claim!");
    setStatus("loading");

    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: publicKey.toString(), amount: balance }),
      });
      const data = await res.json();

      if (data.success) {
        alert(`✅ Claimed ${balance} $CROWN!\nTx: ${data.signature}`);
        resetBalance(); // wyzeruj lokalny stan gry
      } else {
        alert(`❌ Claim failed: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert("Claim request failed");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <button
      onClick={claim}
      disabled={status === "loading"}
      className="ml-4 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-black font-medium transition-all disabled:opacity-50"
    >
      {status === "loading" ? "Claiming..." : "Claim Earned $CROWN"}
    </button>
  );
}