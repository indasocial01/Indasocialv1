import { Program, AnchorProvider, web3 } from '@coral-xyz/anchor';
import idl from '../src/idl/inda_campaigns.json'; // 👈 Asegúrate de que esta carpeta "idl" exista y tenga tu JSON

export const getProvider = (wallet, connection) => {
  return new AnchorProvider(connection, wallet, { preflightCommitment: "processed" });
};

export const createEscrow = async (wallet, connection, creatorAddress, amountSol) => {
  const provider = getProvider(wallet, connection);
  const program = new Program(idl, provider);

  // Generamos una "bóveda" temporal para guardar el dinero de esta campaña
  const campaignAccount = web3.Keypair.generate();
  
  // Convertimos los SOL a Lamports (1 SOL = 1,000,000,000 Lamports)
  const amountLamports = new web3.BN(amountSol * web3.LAMPORTS_PER_SOL);

  console.log("Creando Escrow en Solana Devnet...");

  const tx = await program.methods.createCampaign(amountLamports)
    .accounts({
      campaign: campaignAccount.publicKey,
      brand: wallet.publicKey,
      creator: new web3.PublicKey(creatorAddress),
      systemProgram: web3.SystemProgram.programId,
    })
    .signers([campaignAccount]) // La bóveda debe firmar su propia creación
    .rpc();

  return { txSignature: tx, campaignPubKey: campaignAccount.publicKey.toString() };
};

export const completeEscrow = async (wallet, connection, campaignPubKeyStr, creatorAddress) => {
  const provider = getProvider(wallet, connection);
  const program = new Program(idl, provider);

  console.log("Liberando fondos al creador...");

  const tx = await program.methods.completeCampaign()
    .accounts({
      campaign: new web3.PublicKey(campaignPubKeyStr),
      brand: wallet.publicKey,
      creator: new web3.PublicKey(creatorAddress),
    })
    .rpc();

  return tx;
};