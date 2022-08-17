import { useRef } from "react";
import { products } from "../lib/products"
import NumberInput from "./NumberInput";
import Image from 'next/image'

interface Props {
  submitTarget: string;
  enabled: boolean;
}

export default function Products({ submitTarget, enabled }: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form method='get' action={submitTarget} ref={formRef}>
      <div className='flex flex-col gap-8'>
        <div className="grid grid-cols-0 justify-items-center gap-8">
          {products.map(product => {
            return (
              <div className="rounded-xl bg-gradient-to-r from-indigo-200 via-red-200 to-yellow-100 text-left p-8 bg-white" key={product.id}>
                <h3 className="text-2xl font-bold">{product.name}</h3>
                <p className="text-sm text-gray-800">{product.description}</p>
                <p className="my-4">
                <span className="mt-4 text-xl font-bold">${product.priceUsd}</span>
                  {product.unitName && <span className="text-sm text-gray-800"> /{product.unitName}</span>}
                </p>
                <div className="mt-4">
                  <NumberInput name={product.id} formRef={formRef} />
                </div>
              </div>
            )
          })}

        </div>

        <button
          className="items-center px-20 rounded-md py-2 max-w-fit self-center bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 text-white hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!enabled}
        >
          Checkout
        </button>
      </div>
    </form>
  )
}
