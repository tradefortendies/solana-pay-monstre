import { createQR, encodeURL, TransferRequestURLFields, findReference, validateTransfer, FindReferenceError, ValidateTransferError, TransactionRequestURLFields } from "@solana/pay";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef } from "react";
import BackLink from "../../components/BackLink";
import PageHeading from "../../components/PageHeading";
import { shopAddress, usdcAddress } from "../../lib/addresses";
import calculatePrice from "../../lib/calculatePrice";

export default function Checkout() {
  const router = useRouter()

  
  const qrRef = useRef<HTMLDivElement>(null)

  const amount = useMemo(() => calculatePrice(router.query), [router.query])

  const reference = useMemo(() => Keypair.generate().publicKey, [])

  const searchParams = new URLSearchParams({ reference: reference.toString() });
  for (const [key, value] of Object.entries(router.query)) {
    if (value) {
      if (Array.isArray(value)) {
        for (const v of value) {
          searchParams.append(key, v);
        }
      } else {
        searchParams.append(key, value);
      }
    }
  }

  // Get a connection to Solana Mainnet
  const network = WalletAdapterNetwork.Mainnet
  const endpoint = clusterApiUrl(network)
  const connection = new Connection('https://api.mainnet-beta.solana.com')

  // Show the QR code
  useEffect(() => {
    const { location } = window
    const apiUrl = `${location.protocol}//${location.host}/api/makeTransactionFaucet?${searchParams.toString()}`
    const urlParams: TransactionRequestURLFields = {
      link: new URL(apiUrl),
      label: "WL Faucet",
      message: "Let's chew glass!",
    }
    const solanaUrl = encodeURL(urlParams)
    const qr = createQR(solanaUrl, 256, 'transparent')
    if (qrRef.current && amount.isGreaterThan(0)) {
      qrRef.current.innerHTML = ''
      qr.append(qrRef.current)
    }
  })


  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // Check if there is any transaction for the reference
        const signatureInfo = await findReference(connection, reference, { finality: 'confirmed' })
        
        await validateTransfer(
          connection,
          signatureInfo.signature,
          {
            recipient: shopAddress,
            amount,
            splToken: usdcAddress,
            reference,
          },
          { commitment: 'confirmed' }
        )
        router.push('/shop/confirmed')
      } catch (e) {
        if (e instanceof FindReferenceError) {
          
          return;
        }
        if (e instanceof ValidateTransferError) {
          
          console.error('Transaction is invalid', e)
          return;
        }
        console.error('Unknown error', e)
      }
    }, 500)
    return () => {
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="relative flex flex-col items-center gap-8">
      <BackLink href='/faucet'>Cancel</BackLink>

      <PageHeading>Depositing ${amount.toString()}</PageHeading>

      {/* div added to display the QR code */}
      <div className="relative bg-white rounded-md" ref={qrRef} />
    </div>
  )
}