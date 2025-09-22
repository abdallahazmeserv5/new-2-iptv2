'use client'
import React, { useEffect } from 'react'

export const initializeSnapPixel = (snapPixelId) => {
  if (!snapPixelId) return
  ;(function (e, t, n) {
    if (e.snaptr) return
    var a = (e.snaptr = function () {
      a.handleRequest ? a.handleRequest.apply(a, arguments) : a.queue.push(arguments)
    })
    a.queue = []
    var s = 'script'
    var r = t.createElement(s)
    r.async = true
    r.src = n
    var u = t.getElementsByTagName(s)[0]
    u.parentNode.insertBefore(r, u)
  })(window, document, 'https://sc-static.net/scevent.min.js')

  window.snaptr('init', snapPixelId, {})
  window.snaptr('track', 'PAGE_VIEW')
}

// React component that auto-initializesa
export default function PixelScript() {
  useEffect(() => {
    initializeSnapPixel('a1d1c493-987e-400e-b189-21707e47918e')
  }, [])

  return null
}
