import { Frog } from 'frog'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
// import { app as gallery } from './routes/gallery'
import { app as follow } from './routes/follow'
// import { pinata } from 'frog/hubs'
// import { vars } from './ui'
// import { neynar } from 'frog/hubs'

export const app = new Frog({
  title: 'koda.art mint frame'
  // Supply a Hub to enable frame verification.
  // hub: pinata() //neynar({ apiKey: 'NEYNAR_FROG_FM' })
  // ui: { vars }
})

app.route('/', follow)
// app.route('/', gallery)

const isCloudflareWorker = typeof caches !== 'undefined'
if (isCloudflareWorker) {
  const manifest = await import('__STATIC_CONTENT_MANIFEST')
  const serveStaticOptions = { manifest, root: './' }
  app.use('/*', serveStatic(serveStaticOptions))
  devtools(app, { assetsPath: '/frog', serveStatic, serveStaticOptions })
} else {
  devtools(app, { serveStatic })
}

export default app
