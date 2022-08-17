import { PropsWithChildren } from "react";

export default function PageHeading({ children }: PropsWithChildren<{}>) {
  return <h3 className="text-4xl text-white font-bold">{children}</h3>
}
