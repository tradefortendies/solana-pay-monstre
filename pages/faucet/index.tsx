import NFT from '../../components/Products'
import Products from '../../components/Products'
import SiteHeading from '../../components/SiteHeading'

export default function ShopPage() {
  return (
    <div className="relative flex flex-col items-stretch max-w-4xl gap-8 pt-24 m-auto"> 
      <SiteHeading>MONSTRE</SiteHeading>
      <Products submitTarget='/faucet/checkout' enabled={true} />    
      </div>
  )
}