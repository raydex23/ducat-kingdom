// src/Landing.jsx
import React, { useCallback, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Coins } from "lucide-react";

console.log("✅ Landing loaded");

export default function Landing() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const REGISTRATION_FEE_SOL = 0.2;
  const GAME_TREASURY = new PublicKey("TREASURY_WALLET_ADDRESS_HERE"); // 👈 uzupełnij

  const handleRegister = useCallback(async () => {
    if (!publicKey) return alert("Please connect your wallet first.");
    try {
      setLoading(true);

      // 1️⃣ create tx to send 0.2 SOL to treasury
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: GAME_TREASURY,
          lamports: REGISTRATION_FEE_SOL * 1e9,
        })
      );

      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, "processed");

      // 2️⃣ here call your backend or faucet to airdrop $CROWN equivalent
      alert("Registration successful! $CROWN starter pack incoming...");

      // 3️⃣ redirect to game
      navigate("/game");
    } catch (err) {
      console.error(err);
      alert("Transaction failed or cancelled.");
    } finally {
      setLoading(false);
    }
  }, [publicKey, connection, sendTransaction, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1c1a17] via-[#2a2520] to-[#1a1713] text-gray-100 flex flex-col items-center justify-center text-center p-6">
      <motion.img
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        src="/images/logo.png"
        alt="CrownForge"
        className="h-28 w-auto mb-6 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
      />
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-5xl md:text-6xl font-bold text-amber-400 mb-4"
      >
        CrownForge
      </motion.h1>
      <p className="max-w-xl text-gray-400 mb-10">
        Enter a world of gold, fire, and ambition. Forge your destiny in the medieval
        Web3 RPG where every mine you build earns real $CROWN.
      </p>

      <div className="space-y-5">
        <WalletMultiButton className="!bg-amber-600 hover:!bg-amber-700 !text-black font-semibold !rounded-xl !px-6 !py-3 shadow-sm hover:shadow transition-all" />

        {connected && (
          <button
            disabled={loading}
            onClick={handleRegister}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all shadow-md border border-emerald-700/40 disabled:opacity-60"
          >
            <Coins size={20} />
            {loading ? "Processing..." : `Enter the Kingdom (0.2 SOL)`}
          </button>
        )}
      </div>

      <p className="mt-10 text-xs text-gray-500">
        Registration fee: 0.2 SOL → rewarded with equivalent $CROWN on-chain.
      </p>
      <p className="text-xs text-gray-600 mt-1">
        No presale • No whitelist • 100% fair launch
      </p>
    </div>
  );
}
