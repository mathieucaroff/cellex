import { AppHome } from "@/AppHome"
// import Head from "next/head"

export default function Home() {
// {
//   searchParams,
// }: {
//   searchParams?: { [key: string]: string | string[] | undefined }
// }
  // const search = new URLSearchParams(searchParams as any)

  return (
    <>
      {/* <Head>
        <meta property="og:image" content={`/api/render.png?${search}`} />
      </Head> */}
      <AppHome />
    </>
  )
}
