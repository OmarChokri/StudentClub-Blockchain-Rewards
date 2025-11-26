// routes/history.routes.js
import { Router } from "express";
import { Alchemy, Network } from "alchemy-sdk";

const router = Router();

const alchemy = new Alchemy({
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_SEPOLIA, // Change selon ton réseau
});

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

router.get("/history/:address", async (req, res) => {
  const { address } = req.params;

  try {
    const [incoming, outgoing] = await Promise.all([
      // Réceptions (mint + transfer in + activity)
      alchemy.core.getAssetTransfers({
        fromBlock: "0x0",
        toAddress: address,
        contractAddresses: [CONTRACT_ADDRESS],
        category: ["external", "internal", "erc20"],
        withMetadata: true,
        maxCount: 100,
      }),
      // Envois (transfer out + burn)
      alchemy.core.getAssetTransfers({
        fromBlock: "0x0",
        fromAddress: address,
        contractAddresses: [CONTRACT_ADDRESS],
        category: ["external", "internal", "erc20"],
        withMetadata: true,
        maxCount: 100,
      }),
    ]);

    const allTransfers = [...(incoming.transfers || []), ...(outgoing.transfers || [])];

    const formatted = allTransfers.map(t => ({
      hash: t.hash,
      from: t.from,
      to: t.to,
      value: t.value ? Number(t.value) : 0,
      type:
        t.from === "0x0000000000000000000000000000000000000000"
          ? "mint"
          : t.to === null
          ? "burn"
          : t.from === address
          ? "sent"
          : "received",
      timestamp: t.metadata.blockTimestamp,
      raw: t.raw,
    }));

    // Trier par date décroissante
    formatted.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      address,
      total: formatted.length,
      history: formatted,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur Alchemy", details: error.message });
  }
});

export default router;