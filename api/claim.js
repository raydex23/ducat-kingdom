import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, transfer, burnChecked } from "@solana/spl-token";

const RPC_URL = "https://api.devnet.solana.com";
const connection = new Connection(RPC_URL, "confirmed");

// Ustaw swój mint
const MINT_ADDRESS = "FD2ZoUvLtSNm4tUAdPN62LicLECoa7dmP5fDj4oTvbdq";
const DECIMALS = 6; // 6 dla SPL tokenów

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { wallet, amount } = req.body;
    if (!wallet || !amount) return res.status(400).json({ error: "Missing wallet or amount" });

    // 🔒 zaokrąglamy i odrzucamy wartości z przecinkami
    const floored = Math.floor(amount);
    if (floored <= 0) return res.status(400).json({ error: "Invalid amount" });

    // 🔥 burn 2%
    const burnPortion = Math.floor(floored * 0.02);
    const payout = floored - burnPortion;

    // łączymy się z treasury (twój keypair z ENV)
    const secret = JSON.parse(process.env.CROWN_KEYPAIR);
    const treasury = Keypair.fromSecretKey(Uint8Array.from(secret));

    const mint = new PublicKey(MINT_ADDRESS);
    const userWallet = new PublicKey(wallet);

    // tworzymy ATA
    const treasuryATA = await getOrCreateAssociatedTokenAccount(connection, treasury, mint, treasury.publicKey);
    const userATA = await getOrCreateAssociatedTokenAccount(connection, treasury, mint, userWallet);

    // przeliczamy kwoty na lamporty tokenowe
    const payoutLamports = BigInt(payout) * BigInt(10 ** DECIMALS);
    const burnLamports = BigInt(burnPortion) * BigInt(10 ** DECIMALS);

    // 🔁 transfer 98% do gracza
    await transfer(
      connection,
      treasury,
      treasuryATA.address,
      userATA.address,
      treasury.publicKey,
      payoutLamports
    );

    // 🔥 burn 2% z konta treasury
    await burnChecked(
      connection,
      treasury,
      treasuryATA.address,
      mint,
      treasury.publicKey,
      burnLamports,
      DECIMALS
    );

    console.log(`💸 Sent ${payout} $CROWN, 🔥 Burned ${burnPortion} $CROWN`);

    return res.status(200).json({
      success: true,
      payout,
      burned: burnPortion,
      tx: "done",
      message: `✅ Claimed ${payout} $CROWN, 🔥 Burned ${burnPortion} $CROWN`
    });
  } catch (err) {
    console.error("Claim error:", err);
    return res.status(500).json({ error: err.message });
  }
}