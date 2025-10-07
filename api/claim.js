import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, transfer, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import bs58 from "bs58";
import fs from "fs";

const MINT_ADDRESS = "FD2ZoUvLtSNm4tUAdPN62LicLECoa7dmP5fDj4oTvbdq";
const DECIMALS = 6;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  try {
    const { wallet, amount } = req.body;
    if (!wallet || !amount) return res.status(400).json({ error: "Missing parameters" });

    // 🔐 Ładujemy klucz skarbnika (Twoje crown-keypair.json)
    const secret = JSON.parse(process.env.CROWN_KEYPAIR);
    const treasury = Keypair.fromSecretKey(Uint8Array.from(secret));

    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    const mint = new PublicKey(MINT_ADDRESS);
    const receiver = new PublicKey(wallet);

    // 🪙 znajdź lub utwórz konto tokenowe dla odbiorcy
    const receiverATA = await getOrCreateAssociatedTokenAccount(connection, treasury, mint, receiver);

    // ⚙️ znajdź lub utwórz konto tokenowe treasury
    const treasuryATA = await getOrCreateAssociatedTokenAccount(connection, treasury, mint, treasury.publicKey);

    // 🔁 transfer tokenów
    const rawAmount = Math.floor(amount * 10 ** DECIMALS);

    if (rawAmount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const txSignature = await transfer(
      connection,
      treasury,
      treasuryATA.address,
      receiverATA.address,
      treasury.publicKey,
      rawAmount
    );

    console.log("✅ Sent", amount, "$CROWN to", wallet, txSignature);
    res.status(200).json({ success: true, signature: txSignature });

  } catch (err) {
    console.error("❌ Faucet error:", err);
    res.status(500).json({ error: err.message });
  }
}