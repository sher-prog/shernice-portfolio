// ─────────────────────────────────────────────────────────────
//  Depth-displaced 3D version of the illustration (raw WebGL2, no library).
//
//  Layers, back to front:  back hair → eyeball backdrop → iris → face → front hair.
//  Every layer is a grid mesh pushed forward by a depth map, then the whole
//  thing is rotated a few degrees (yaw/pitch) around the neck. The iris is a
//  separate sprite that slides behind the lids of the face layer, so eyes can
//  look at the cursor without touching the art.
// ─────────────────────────────────────────────────────────────
import cfg from './character.json'

export const ASSETS = {
  back: 'layers/back.webp',
  face: 'layers/face.webp',
  front: 'layers/front.webp',
  eyeBackdrop: 'layers/eye_backdrop.webp',
  eyeIris: 'layers/eye_iris.webp',
  depth: 'layers/depth.png',
}

// Tunables ────────────────────────────────────────────────────
const TUNE = {
  maxYaw: 0.07,       // head barely turns; the eyes do the work 
  maxPitch: 0.035,
  depthScale: 0.2,    // how far the face bulges forward (image widths)
  gazeX: 62,          // iris travel, in full-res source pixels
  gazeY: 26,
  pad: 0.06,          // canvas margin around the image so rotation never clips
  idleAfterMs: 3000,  // pointer quiet this long → eyes wander on their own
}

const SRC_W = 3584
const SRC_H = 4800

export function loadAssets(onProgress) {
  const entries = Object.entries(ASSETS)
  let done = 0
  return Promise.all(
    entries.map(
      ([key, url]) =>
        new Promise((resolve) => {
          const img = new Image()
          const finish = (ok) => {
            done += 1
            onProgress?.(done / entries.length)
            resolve([key, ok ? img : null])
          }
          img.onload = () => finish(true)
          img.onerror = () => finish(false)
          img.src = url
        }),
    ),
  ).then((pairs) => Object.fromEntries(pairs))
}

const VERT = `#version 300 es
precision highp float;
in vec2 aUV;
uniform vec4 uRect;
uniform sampler2D uDepth;
uniform vec3 uChan;
uniform float uZBase, uZScale, uAspect, uPad;
uniform vec2 uView;
uniform vec3 uPivot;
out vec2 vUV;
void main() {
  vec2 iuv = mix(uRect.xy, uRect.zw, aUV);
  float d = dot(textureLod(uDepth, iuv, 0.0).rgb, uChan);
  vec3 p = vec3(iuv.x - 0.5, (0.5 - iuv.y) / uAspect, uZBase + d * uZScale);
  vec3 q = p - uPivot;
  float cy = cos(uView.x), sy = sin(uView.x), cp = cos(uView.y), sp = sin(uView.y);
  vec3 r = vec3(q.x * cy + q.z * sy, q.y, -q.x * sy + q.z * cy);
  r = vec3(r.x, r.y * cp - r.z * sp, r.y * sp + r.z * cp);
  r += uPivot;
  float k = 2.0 / (1.0 + 2.0 * uPad);
  gl_Position = vec4(r.x * k, r.y * k * uAspect, 0.0, 1.0);
  vUV = aUV;
}`

const FRAG = `#version 300 es
precision mediump float;
in vec2 vUV;
uniform sampler2D uTex;
uniform vec2 uOff;
out vec4 o;
void main() { o = texture(uTex, vUV + uOff); }`

function compile(gl, type, src) {
  const s = gl.createShader(type)
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s))
  return s
}

function makeGrid(gl, nx, ny) {
  const uv = new Float32Array((nx + 1) * (ny + 1) * 2)
  let k = 0
  for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) { uv[k++] = i / nx; uv[k++] = j / ny }
  const idx = new Uint16Array(nx * ny * 6)
  k = 0
  for (let j = 0; j < ny; j++)
    for (let i = 0; i < nx; i++) {
      const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1
      idx.set([a, c, b, b, c, d], k); k += 6
    }
  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)
  const vb = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vb)
  gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
  const ib = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW)
  gl.bindVertexArray(null)
  return { vao, count: idx.length }
}

function texture(gl, img, { premultiply = true, mips = true } = {}) {
  const t = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, t)
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, premultiply)
  gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
  if (mips) gl.generateMipmap(gl.TEXTURE_2D)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mips ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  return t
}

/**
 * @returns null if WebGL2 isn't available (caller shows the flat image instead).
 */
export function createCharacter(canvas, imgs, opts) {
  try {
    return build(canvas, imgs, opts)
  } catch (e) {
    console.warn('[character3d] setup failed', e)
    return null
  }
}

function build(canvas, imgs, { motion = true } = {}) {
  if (Object.values(imgs).some((i) => !i)) return null
  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false })
  if (!gl) return null

  let prog
  try {
    prog = gl.createProgram()
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG))
    gl.bindAttribLocation(prog, 0, 'aUV')
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog))
  } catch (e) {
    console.warn('[character3d] shader failed', e)
    return null
  }
  gl.useProgram(prog)
  const U = (n) => gl.getUniformLocation(prog, n)
  const u = {
    rect: U('uRect'), depth: U('uDepth'), chan: U('uChan'), zBase: U('uZBase'), zScale: U('uZScale'),
    aspect: U('uAspect'), pad: U('uPad'), view: U('uView'), pivot: U('uPivot'), tex: U('uTex'), off: U('uOff'),
  }

  const gridFull = makeGrid(gl, 84, 112)
  const gridEye = makeGrid(gl, 40, 12)
  const T = {
    back: texture(gl, imgs.back), face: texture(gl, imgs.face), front: texture(gl, imgs.front),
    eyeBackdrop: texture(gl, imgs.eyeBackdrop), eyeIris: texture(gl, imgs.eyeIris),
    depth: texture(gl, imgs.depth, { premultiply: false, mips: false }),
  }
  gl.activeTexture(gl.TEXTURE1)
  gl.bindTexture(gl.TEXTURE_2D, T.depth)
  gl.uniform1i(u.depth, 1)
  gl.uniform1i(u.tex, 0)
  gl.activeTexture(gl.TEXTURE0)

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
  gl.disable(gl.DEPTH_TEST)

  const eye = cfg.eyeRect
  const eyeW = (eye[2] - eye[0]) * SRC_W
  const eyeH = (eye[3] - eye[1]) * SRC_H
  const zs = TUNE.depthScale
  const FULL = [0, 0, 1, 1]
  // [texture, grid, rect, depth channel, zBase, zScale]
  const layers = [
    [T.back, gridFull, FULL, [1, 0, 0], -0.04, zs * 1.2],
    [T.eyeBackdrop, gridEye, eye, [0, 1, 0], 0, zs],
    [T.eyeIris, gridEye, eye, [0, 1, 0], 0, zs, true],
    [T.face, gridFull, FULL, [0, 1, 0], 0, zs],
    [T.front, gridFull, FULL, [0, 0, 1], 0.025, zs * 0.12],
  ]

  const st = { yaw: 0, pitch: 0, gx: 0, gy: 0 }       // what is drawn
  const tg = { yaw: 0, pitch: 0, gx: 0, gy: 0 }       // where it is heading
  let scrollYaw = 0
  let pointer = null
  let lastMove = -1e9
  let idle = { gx: 0, gy: 0, until: 0 }
  let raf = 0
  let alive = true
  let lastT = performance.now()
  let sizeKey = ''

  const resize = () => {
    const dpr = window.devicePixelRatio || 1
    const sf = Math.min(dpr * 1.4, 2.2)
    const w = Math.max(2, Math.round(canvas.clientWidth * sf))
    const h = Math.max(2, Math.round(canvas.clientHeight * sf))
    const key = w + 'x' + h
    if (key === sizeKey) return
    sizeKey = key
    canvas.width = w
    canvas.height = h
    gl.viewport(0, 0, w, h)
  }

  const draw = () => {
    resize()
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.uniform1f(u.aspect, cfg.aspect)
    gl.uniform1f(u.pad, TUNE.pad)
    gl.uniform2f(u.view, st.yaw + scrollYaw, st.pitch)
    gl.uniform3f(u.pivot, 0, (0.5 - 0.52) / cfg.aspect, 0.04)
    for (const [tex, grid, rect, chan, zb, zsc, isIris] of layers) {
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.uniform4f(u.rect, rect[0], rect[1], rect[2], rect[3])
      gl.uniform3f(u.chan, chan[0], chan[1], chan[2])
      gl.uniform1f(u.zBase, zb)
      gl.uniform1f(u.zScale, zsc)
      // gaze: sprite content slides by this much (texture-space, opposite sign to sampling offset)
      if (isIris) gl.uniform2f(u.off, -(st.gx * TUNE.gazeX) / eyeW, -(st.gy * TUNE.gazeY) / eyeH)
      else gl.uniform2f(u.off, 0, 0)
      gl.bindVertexArray(grid.vao)
      gl.drawElements(gl.TRIANGLES, grid.count, gl.UNSIGNED_SHORT, 0)
    }
    gl.bindVertexArray(null)
  }

  // Where the eyes are on screen (canvas has a transform + padding applied by the camera rig).
  const eyeScreen = () => {
    const r = canvas.getBoundingClientRect()
    const p = TUNE.pad
    const u0 = (cfg.irisL[0] + cfg.irisR[0]) / 2
    const v0 = (cfg.irisL[1] + cfg.irisR[1]) / 2
    return { x: r.left + r.width * ((u0 + p) / (1 + 2 * p)), y: r.top + r.height * ((v0 + p) / (1 + 2 * p)) }
  }

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
  const damp = (cur, target, k, dt) => cur + (target - cur) * (1 - Math.exp(-k * dt))

  const frame = (now) => {
    if (!alive) return
    raf = requestAnimationFrame(frame)
    if (document.hidden) { lastT = now; return }
    const dt = Math.min(0.05, (now - lastT) / 1000)
    lastT = now
    const t = now / 1000

    const vw = window.innerWidth, vh = window.innerHeight
    const active = pointer && now - lastMove < TUNE.idleAfterMs
    if (active) {
      const mx = clamp((pointer.x / vw - 0.5) * 2, -1, 1)
      const my = clamp((pointer.y / vh - 0.5) * 2, -1, 1)
      tg.yaw = mx * TUNE.maxYaw
      tg.pitch = my * TUNE.maxPitch
      const e = eyeScreen()
      const reach = Math.min(vw, vh) * 0.2
      let dx = (pointer.x - e.x) / reach
      let dy = (pointer.y - e.y) / reach
      const len = Math.hypot(dx, dy)
      if (len > 1) { dx /= len; dy /= len }
      tg.gx = Math.sign(dx) * Math.pow(Math.abs(dx), 0.7)
      tg.gy = Math.sign(dy) * Math.pow(Math.abs(dy), 0.7)
    } else if (motion) {
      // idle: slow breathing sway, eyes drift between a few resting glances (mostly toward the text column)
      tg.yaw = 0.05 * Math.sin(t * 0.55)
      tg.pitch = 0.02 * Math.sin(t * 0.42 + 1.3)
      if (now > idle.until) {
        const glances = [[0.15, 0.05], [0.95, 0.1], [-0.95, 0.05], [0.7, -0.5], [-0.7, 0.4], [0, 0.6], [0, 0]]
        const g = glances[Math.floor(Math.random() * glances.length)]
        idle = { gx: g[0], gy: g[1], until: now + 900 + Math.random() * 1800 }
      }
      tg.gx = idle.gx
      tg.gy = idle.gy
    } else {
      tg.yaw = tg.pitch = tg.gx = tg.gy = 0
    }

    st.yaw = damp(st.yaw, tg.yaw, 4.5, dt)
    st.pitch = damp(st.pitch, tg.pitch, 4.5, dt)
    st.gx = damp(st.gx, tg.gx, 16, dt)
    st.gy = damp(st.gy, tg.gy, 16, dt)
    draw()
  }

  const onMove = (e) => {
    pointer = { x: e.clientX, y: e.clientY }
    lastMove = performance.now()
  }
  window.addEventListener('pointermove', onMove, { passive: true })

  let lost = false
  const onLost = (e) => { e.preventDefault(); lost = true; cancelAnimationFrame(raf); api.onLost?.() }
  canvas.addEventListener('webglcontextlost', onLost)

  draw()
  raf = requestAnimationFrame(frame)

  const api = {
    /** Scroll position nudges the head a few degrees (-1..1). */
    setScroll(v) { scrollYaw = motion ? clamp(v, -1, 1) * 0.06 : 0 },
    onLost: null,
    get lost() { return lost },
    destroy() {
      alive = false
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('webglcontextlost', onLost)
      const ext = gl.getExtension('WEBGL_lose_context')
      ext?.loseContext()
    },
  }
  return api
}
