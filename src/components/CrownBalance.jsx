import React, { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { TOKEN_MINT, TOKEN_DECIMALS } from "../config";

export default function CrownBalance() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    if (!publicKey) return;

    (async () => {
      try {
        // Pobierz wszystkie token accounts dla użytkownika
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: TOKEN_PROGRAM_ID,
        });

        const crownAccount = tokenAccounts.value.find(
          (acc) => acc.account.data.parsed.info.mint === TOKEN_MINT
        );

        if (!crownAccount) {
          setBalance(0);
          return;
        }

        const rawAmount =
          crownAccount.account.data.parsed.info.tokenAmount.amount || "0";
        const uiAmount =
          parseFloat(rawAmount) / Math.pow(10, TOKEN_DECIMALS);

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
      {balance === null ? (
        <span>Loading...</span>
      ) : (
        <span>{balance.toFixed(2)} $CROWN</span>
      )}
    </div>
  );
}
