const cors = require('@koa/cors')
const Router = require('@koa/router')
const Koa = require('koa')
const bodyparser = require('koa-bodyparser')

const PORT = process.env.RGS

const app = new Koa()
app.use(cors())
const router = new Router()
router.use(bodyparser())

function start() {
  app.use(router.routes())
  return app.listen(PORT)
}

function expose({ endpoints }) {
  Object.entries(endpoints).forEach(map)
  function map([key, handler]) {
    const [method, path] = key.split('|')
    router[method](path, async function (ctx, next) {
      ctx.response.body = await handler(ctx.request, ctx.query)
      next(path)
    })
  }
}

module.exports = { start, expose }
