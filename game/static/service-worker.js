if (!self.define) {
  let e,
    s = {}
  const i = (i, n) => (
    (i = new URL(i + '.js', n).href),
    s[i] ||
      new Promise(s => {
        if ('document' in self) {
          const e = document.createElement('script')
          ;(e.src = i), (e.onload = s), document.head.appendChild(e)
        } else (e = i), importScripts(i), s()
      }).then(() => {
        let e = s[i]
        if (!e) throw new Error(`Module ${i} didn’t register its module`)
        return e
      })
  )
  self.define = (n, o) => {
    const r =
      e ||
      ('document' in self ? document.currentScript.src : '') ||
      location.href
    if (s[r]) return
    let d = {}
    const l = e => i(e, r),
      t = { module: { uri: r }, exports: d, require: l }
    s[r] = Promise.all(n.map(e => t[e] || l(e))).then(e => (o(...e), d))
  }
}
define(['./workbox-7cfec069'], function(e) {
  'use strict'
  self.addEventListener('message', e => {
    e.data && 'SKIP_WAITING' === e.data.type && self.skipWaiting()
  }),
    e.precacheAndRoute(
      [
        { url: 'assets/index-BKwLzXBm.js', revision: null },
        { url: 'assets/index-Dw594nwb.css', revision: null },
        { url: 'assets/workbox-window.prod.es5-D5gOYdM7.js', revision: null },
        { url: 'electron.js', revision: 'c34f856993fb6ebd6af5a101c396e744' },
        { url: 'index.html', revision: '76f50ca7c4705b6d83bd2e2d831a06e0' },
        { url: 'favicon.ico', revision: '445bb19d4a8fd46eb433dd43cbdce691' },
        { url: 'logo192.png', revision: '70746d790b8990639d1390337d77d81a' },
        { url: 'logo512.png', revision: 'b044ab46b3f33f0e2d313d961bf1f654' },
        {
          url: 'logoMaskable.png',
          revision: '23be58ccf16df9f43658aad3da30056d',
        },
        {
          url: 'manifest.webmanifest',
          revision: '5b85855136770344b0a2291be64a619f',
        },
      ],
      {}
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      new e.NavigationRoute(e.createHandlerBoundToURL('index.html'))
    )
})
//# sourceMappingURL=service-worker.js.map
