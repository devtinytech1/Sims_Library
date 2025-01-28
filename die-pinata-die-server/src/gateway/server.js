const cors = require('@koa/cors')
const Router = require('@koa/router')
const Koa = require('koa')
const bodyparser = require('koa-bodyparser')

const { PORT } = process.env
const { inc, dec } = require('../status')

const app = new Koa()
app.use(cors())
const router = new Router()
router.use(bodyparser())

function start() {
  app.use(router.routes())
  return app.listen(PORT ?? 8080)
}

function expose({ endpoints }) {
  Object.entries(endpoints).forEach(map)
  function map([key, handler]) {
    const [method, path] = key.split('|')
    router[method](path, async function (ctx, next) {
      inc()
      ctx.response.body = await handler(ctx.request)
      dec()
      next(path)
    })
  }
}

module.exports = { start, expose }
