import React, { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_MINT, TOKEN_DECIMALS } from "../config";

export default function CrownBalance() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    if (!publicKey) {
      setBalance(null);
      return;
    }
    (async () => {
      try {
        const ata = await getAssociatedTokenAddress(
          new PublicKey(TOKEN_MINT),
          publicKey
        );
        const accountInfo = await getAccount(connection, ata);
        setBalance(Number(accountInfo.amount) / 10 ** TOKEN_DECIMALS);
      } catch {
        setBalance(0);
      }
    })();
  }, [connection, publicKey]);

  if (!publicKey) return null;

  return (
    <span className="font-mono text-sm text-amber-400">
      {balance !== null ? `${balance.toFixed(2)} $CROWN` : "..."}
    </span>
  );
}