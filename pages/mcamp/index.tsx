import NFT from '../../components/Nft'
import Products from '../../components/Products'
import SiteHeading from '../../components/SiteHeading'

export default function ShopPage() {
  return (
    <div className="relative flex flex-col items-stretch max-w-4xl gap-8 pt-24 m-auto"> 
      <SiteHeading>MONSTRE</SiteHeading>
      <NFT submitTarget='/mcamp/checkout' enabled={true} />    
      </div>
  )
}