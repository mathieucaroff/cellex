import Fastify from "fastify"

import { addCellexRoute } from "./cellex"
import { addRenderRoute } from "./render"

export const fastify = Fastify({
  logger: true,
})

addCellexRoute(fastify)
addRenderRoute(fastify)
