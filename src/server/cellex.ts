import fastifyStatic from "@fastify/static"
import { FastifyInstance } from "fastify"
import fsp from "fs/promises"

export function addCellexRoute(fastify: FastifyInstance, path: string) {
  fastify.get("/", async (request, reply) => {
    let html = await fsp.readFile(`${path}/index.html`, "utf8")
    let queryString = Object.entries(request.query as Record<string, string>)
      .map(([k, v]) => `${k}=${v}`)
      .join("&")
    if (queryString) {
      queryString = `?${queryString}`
    }
    html = html.replace(
      "<!-- __OG_IMAGE__ -->",
      `<meta property="og:image" content="/render.png${queryString}" />`,
    )

    reply.type("text/html").send(html)
  })

  fastify.register(fastifyStatic, {
    root: path,
  })
}
