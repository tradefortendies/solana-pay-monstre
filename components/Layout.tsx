import { PropsWithChildren } from "react";
import Footer from "./Footer";
import Image from "next/image";


export default function Layout({ children }: PropsWithChildren<{}>) {
  return (
    <div className='relative min-h-screen flex flex-col bg-transparent'>
      <Image
        alt="backdrop"
        src="https://uploads-ssl.webflow.com/625b6e2d0c63fa93d4df9a7e/62f4bf43910e07b4f64d8f18_Untitled_Artwork.png"
        layout='fill'
        objectFit='cover'
      />
      <main className='mb-auto pt-24'>
        {children}
      </main>
      <Footer />
    </div>
  )
}