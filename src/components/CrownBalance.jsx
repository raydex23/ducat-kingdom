import React, { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_MINT, TOKEN_DECIMALS } from "../config";

// Stały adres programu SPL Token (ten sam na wszystkich sieciach)
const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

export default function CrownBalance() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    if (!publicKey) return;

    (async () => {
      try {
        // Pobierz wszystkie token accounts użytkownika
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: TOKEN_PROGRAM_ID,
        });

        // Znajdź konto dla naszego tokena $CROWN
        const crownAccount = tokenAccounts.value.find(
          (acc) => acc.account.data.parsed.info.mint === TOKEN_MINT
        );

        if (!crownAccount) {
          setBalance(0);
          return;
        }

        const rawAmount = crownAccount.account.data.parsed.info.tokenAmount.amount || "0";
        const uiAmount = parseFloat(rawAmount) / Math.pow(10, TOKEN_DECIMALS);
        setBalance(uiAmount);
      } catch (err) {
        console.error("Error fetching $CROWN balance:", err);
        setBalance(null);
      }
    })();
  }, [connection, publicKey]);

  if (!publicKey) return null;

  return (
    <div className="ml-4 text-sm text-amber-400">
      {balance === null ? "Loading..." : `Wallet: ${balance.toFixed(2)} $CROWN`}
    </div>
  );
}
