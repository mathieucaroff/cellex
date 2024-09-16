import Fastify from "fastify"

import { addCellexRoute } from "./cellex"
import { addRenderRoute } from "./render"

export const fastify = Fastify({
  logger: true,
})

addCellexRoute(fastify, `${process.cwd()}/${process.argv[2] || "../../dist"}`)
addRenderRoute(fastify)

fastify.listen({ port: 3000 }).catch((err) => {
  fastify.log.error(err)
  process.exit(1)
})
