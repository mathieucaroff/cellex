import type { VercelRequest } from "@vercel/node"
import { ImageResponse } from "@vercel/og"

export const config = {
  runtime: "edge",
}

export default function handler(request: VercelRequest) {
  if (request.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 })
  }

  const search = new URLSearchParams(request.url)

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          fontSize: 60,
          color: "black",
          background: "#f6f6f6",
          width: "100%",
          height: "100%",
          paddingTop: 50,
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <img width="1200" height="630" src={`/api/render.png?${search}`} />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}
