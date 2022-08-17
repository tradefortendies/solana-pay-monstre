import { createTransferCheckedInstruction, getAssociatedTokenAddress, getMint, getOrCreateAssociatedTokenAccount } from "@solana/spl-token"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { clusterApiUrl, Connection, Keypair, PublicKey, Transaction, SystemProgram } from "@solana/web3.js"
import { NextApiRequest, NextApiResponse } from "next"
import { couponAddress, shopAddress, usdcAddress } from "../../lib/addresses"
import calculatePrice from "../../lib/calculatePrice"
import base58 from 'bs58'

export type MakeTransactionInputData = {
  account: string,
}

type MakeTransactionGetResponse = {
  label: string,
  icon: string,
}

export type MakeTransactionOutputData = {
  transaction: string,
  message: string,
}

type ErrorOutput = {
  error: string
}

function get(res: NextApiResponse<MakeTransactionGetResponse>) {
  res.status(200).json({
    label: "Depositing LEM 🪂",
    icon: "https://uploads-ssl.webflow.com/625b6e2d0c63fa93d4df9a7e/62be4aca782ade6e75b61c76_256x256%20new%20logo%20lem.png",
  })
}

async function post(
  req: NextApiRequest,
  res: NextApiResponse<MakeTransactionOutputData | ErrorOutput>
) {
  try {

    const amount = calculatePrice(req.query)
    if (amount.toNumber() === 0) {
      res.status(400).json({ error: "Can't checkout with charge of 0" })
      return
    }

    
    const { reference } = req.query
    if (!reference) {
      res.status(400).json({ error: "No reference provided" })
      return
    }

    
    const { account } = req.body as MakeTransactionInputData
    if (!account) {
      res.status(40).json({ error: "No account provided" })
      return
    }

    
    const shopPrivateKey = process.env.SHOP_PRIVATE_KEY as string
    if (!shopPrivateKey) {
      res.status(500).json({ error: "Shop private key not available" })
    }
    const shopKeypair = Keypair.fromSecretKey(base58.decode(shopPrivateKey))

    const buyerPublicKey = new PublicKey(account)
    const shopPublicKey = shopKeypair.publicKey

    const network = WalletAdapterNetwork.Mainnet
    const endpoint = clusterApiUrl(network)
    const connection = new Connection('https://api.mainnet-beta.solana.com')

     
    const buyerUSDCAddress = await getOrCreateAssociatedTokenAccount(
      connection,
      shopKeypair, 
      usdcAddress, 
      buyerPublicKey, 
    )

    const shopUsdcAddress = await getAssociatedTokenAddress(usdcAddress, shopPublicKey)
    // Get details about the USDC token, or in this case LEM Tokens
    const usdcMint = await getMint(connection, usdcAddress)  
    const couponMint = await getMint(connection, couponAddress)
    const buyercouponAccount = await getAssociatedTokenAddress(couponAddress, buyerPublicKey)
    const shopCouponAddress = await getAssociatedTokenAddress(couponAddress, shopPublicKey)  
    const { blockhash } = await (connection.getLatestBlockhash('finalized'))

    const transaction = new Transaction({
      recentBlockhash: blockhash,
      // The shop sponsors the tx fees
      feePayer: shopPublicKey,
    })

    // Create the instruction to send WL token from the buyer to the shop
    const transferInstruction = createTransferCheckedInstruction(
      buyercouponAccount, 
      couponAddress,  
      shopCouponAddress, 
      buyerPublicKey, 
      1 * (10 ** couponMint.decimals),  
      6, 
    )

    
    transferInstruction.keys.push({
      pubkey: new PublicKey(reference),
      isSigner: false,
      isWritable: false,
    })

    // Instruction to send USDC from the shop to the buyer, or in this case LEM tokens
    const couponInstruction = 
    
      // This instruction is to deposit tokens into the buyers account
      createTransferCheckedInstruction(
        shopUsdcAddress, 
        usdcAddress, 
        buyerUSDCAddress.address, 
        shopPublicKey, 
        amount.toNumber() * (10 ** usdcMint.decimals), 
        6, 
      )

    
    couponInstruction.keys.push({
      pubkey: shopPublicKey,
      isSigner: true,
      isWritable: false,
    })

    // Instruction to send SOL from the buyer to the shop
    const transferSolInstruction = SystemProgram.transfer({
      fromPubkey: shopPublicKey,
      lamports: 1000000,
      toPubkey: buyerPublicKey,
    })

    transferSolInstruction.keys.push({
      pubkey: buyerPublicKey,
      isSigner: true,
      isWritable: false,
    })

    const mint = Keypair.generate()

    // Add all instructions to the transaction
    transaction.add(couponInstruction, transferInstruction, transferSolInstruction)

    
    transaction.partialSign(shopKeypair)

    
    const serializedTransaction = transaction.serialize({
      
      requireAllSignatures: false
    })
    const base64 = serializedTransaction.toString('base64')

    // Insert into database: reference, amount

    const message = "Thanks for your purchase! 🥰"

    // Return the serialized transaction
    res.status(200).json({
      transaction: base64,
      message,
    })
  } catch (err) {
    console.error(err);

    res.status(500).json({ error: 'error creating transaction', })
    return
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MakeTransactionGetResponse | MakeTransactionOutputData | ErrorOutput>
) {
  if (req.method === "GET") {
    return get(res)
  } else if (req.method === "POST") {
    return await post(req, res)
  } else {
    return res.status(405).json({ error: "Method not allowed" })
  }
}