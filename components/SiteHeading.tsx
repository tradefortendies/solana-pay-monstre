import { PropsWithChildren } from "react";

export default function SiteHeading({ children }: PropsWithChildren<{}>) {
  return <h1 className="text-5xl my-2 font-bold self-center text-white">{children}</h1>
}
