import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export interface IutFivePillars3DProps {
  activeChapter: number;
  hoveredPillar: number;
  cameraOverride: number | null;
  onScrollProgressChange?: (prog: number, activeIdx: number) => void;
}

const PILLAR_PALETTES = [
  { hex: 0xe03c28, rgb: [1.8, 0.35, 0.2] },   // Pillar 1: Crimson Vermilion
  { hex: 0xf59e0b, rgb: [1.8, 0.95, 0.22] },  // Pillar 2: Warm Amber Gold
  { hex: 0x10b981, rgb: [0.22, 1.55, 0.85] }, // Pillar 3: EmeraldJade
  { hex: 0x38bdf8, rgb: [0.28, 1.35, 1.85] }, // Pillar 4: Celestial Cyan
  { hex: 0xa855f7, rgb: [1.35, 0.45, 1.85] }, // Pillar 5: BTM Royal Lavender
];

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function normalFromHeight(hc: HTMLCanvasElement, strength = 2.4): HTMLCanvasElement {
  const W = hc.width;
  const H = hc.height;
  const src = hc.getContext('2d')!.getImageData(0, 0, W, H).data;
  const out = makeCanvas(W, H);
  const ox = out.getContext('2d')!;
  const im = ox.createImageData(W, H);
  const d = im.data;
  const at = (x: number, y: number) =>
    src[(((y + H) % H) * W + ((x + W) % W)) * 4] / 255;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const gx = (at(x + 1, y) - at(x - 1, y)) * strength;
      const gy = (at(x, y + 1) - at(x, y - 1)) * strength;
      const nx = -gx;
      const ny = gy;
      const nz = 1;
      const il = 1 / Math.hypot(nx, ny, nz);
      const i = (y * W + x) * 4;
      d[i] = (nx * il * 0.5 + 0.5) * 255;
      d[i + 1] = (ny * il * 0.5 + 0.5) * 255;
      d[i + 2] = (nz * il * 0.5 + 0.5) * 255;
      d[i + 3] = 255;
    }
  }
  ox.putImageData(im, 0, 0);
  return out;
}

/**
 * Procedural IUT Red-Brick Texture + Height/Normal Map
 */
function generateRedBrickTextures() {
  const W = 512;
  const H = 512;
  const albedo = makeCanvas(W, H);
  const ax = albedo.getContext('2d')!;
  const height = makeCanvas(W, H);
  const hx = height.getContext('2d')!;
  const rnd = mulberry32(170061);

  // Mortar background
  ax.fillStyle = '#2b1815';
  ax.fillRect(0, 0, W, H);
  hx.fillStyle = '#383838';
  hx.fillRect(0, 0, W, H);

  const rows = 24;
  const cols = 8;
  const rowH = H / rows;
  const colW = W / cols;
  const mortar = 2.2;

  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (colW * 0.5);
    for (let c = -1; c <= cols; c++) {
      const bx = c * colW + offset;
      const by = r * rowH;
      const shade = 0.78 + rnd() * 0.36;
      const red = Math.min(255, Math.round(148 * shade + (rnd() - 0.5) * 22));
      const green = Math.min(255, Math.round(46 * shade + (rnd() - 0.5) * 12));
      const blue = Math.min(255, Math.round(36 * shade + (rnd() - 0.5) * 10));

      ax.fillStyle = `rgb(${red},${green},${blue})`;
      ax.fillRect(bx + mortar, by + mortar, colW - mortar * 2, rowH - mortar * 2);

      const hVal = Math.round(175 + (rnd() - 0.5) * 45);
      hx.fillStyle = `rgb(${hVal},${hVal},${hVal})`;
      hx.fillRect(bx + mortar, by + mortar, colW - mortar * 2, rowH - mortar * 2);

      // Subtle brick surface tooth
      for (let k = 0; k < 5; k++) {
        const sx = bx + mortar + rnd() * (colW - mortar * 2);
        const sy = by + mortar + rnd() * (rowH - mortar * 2);
        ax.fillStyle = rnd() > 0.5 ? 'rgba(0,0,0,0.18)' : 'rgba(255,190,160,0.08)';
        ax.fillRect(sx, sy, 3 + rnd() * 6, 1.5 + rnd() * 3);
      }
    }
  }

  // Weathering vertical streaks
  for (let i = 0; i < 65; i++) {
    const sx = rnd() * W;
    const top = rnd() * H * 0.5;
    const len = H * (0.25 + rnd() * 0.6);
    const g = ax.createLinearGradient(0, top, 0, top + len);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(0.4, 'rgba(12,4,4,0.22)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ax.fillStyle = g;
    ax.fillRect(sx, top, 1.5 + rnd() * 4, len);
  }

  return {
    map: albedo,
    normal: normalFromHeight(height, 2.5),
  };
}

/**
 * Procedural Water / Wet Slate Reflection Texture
 */
function generateWaterTextures() {
  const W = 512;
  const H = 512;
  const c = makeCanvas(W, H);
  const cx = c.getContext('2d')!;
  const h = makeCanvas(W, H);
  const hx = h.getContext('2d')!;
  const rnd = mulberry32(909);

  cx.fillStyle = '#070b10';
  cx.fillRect(0, 0, W, H);
  hx.fillStyle = '#808080';
  hx.fillRect(0, 0, W, H);

  // Subtle water ripples in height map
  for (let i = 0; i < 180; i++) {
    const x = rnd() * W;
    const y = rnd() * H;
    const rw = 18 + rnd() * 55;
    const rh = 2 + rnd() * 5;
    const g = hx.createRadialGradient(x, y, 0.5, x, y, rw);
    const bright = rnd() > 0.5;
    g.addColorStop(0, bright ? 'rgba(215,215,215,0.24)' : 'rgba(40,40,40,0.24)');
    g.addColorStop(1, 'rgba(128,128,128,0)');
    hx.save();
    hx.translate(x, y);
    hx.scale(1, rh / rw);
    hx.fillStyle = g;
    hx.beginPath();
    hx.arc(0, 0, rw, 0, Math.PI * 2);
    hx.fill();
    hx.restore();
  }

  return {
    map: c,
    normal: normalFromHeight(h, 1.8),
  };
}

/**
 * Procedural Lunar Disc Texture (Kage + IUT Night Moon)
 */
function generateMoonCanvas(): HTMLCanvasElement {
  const S = 512;
  const c = makeCanvas(S, S);
  const x = c.getContext('2d')!;
  const R = S / 2 - 2;
  const rnd = mulberry32(91);

  x.beginPath();
  x.arc(S / 2, S / 2, R, 0, Math.PI * 2);
  x.closePath();
  x.save();
  x.clip();

  const g = x.createRadialGradient(S * 0.44, S * 0.42, S * 0.05, S / 2, S / 2, R);
  g.addColorStop(0, 'rgb(245,235,228)');
  g.addColorStop(0.65, 'rgb(225,200,192)');
  g.addColorStop(1, 'rgb(195,160,152)');
  x.fillStyle = g;
  x.fillRect(0, 0, S, S);

  // Lunar maria basins
  const seas: [number, number, number, number][] = [
    [-0.45, -0.08, 0.42, 0.75],
    [-0.22, -0.35, 0.28, 0.85],
    [0.14, -0.28, 0.19, 0.8],
    [0.28, -0.06, 0.22, 0.78],
    [0.42, 0.12, 0.14, 0.7],
    [-0.25, 0.28, 0.18, 0.65],
  ];

  seas.forEach(([u, v, rad, dk]) => {
    for (let i = 0; i < 14; i++) {
      const a = rnd() * Math.PI * 2;
      const off = rnd() * rad * 0.6;
      const bx = S / 2 + (u + Math.cos(a) * off) * R;
      const by = S / 2 + (v + Math.sin(a) * off * 0.8) * R;
      const rr = rad * R * (0.3 + rnd() * 0.42);
      const bg = x.createRadialGradient(bx, by, rr * 0.15, bx, by, rr);
      bg.addColorStop(0, `rgba(90,45,42,${(dk * 0.16).toFixed(3)})`);
      bg.addColorStop(1, 'rgba(90,45,42,0)');
      x.fillStyle = bg;
      x.beginPath();
      x.arc(bx, by, rr, 0, Math.PI * 2);
      x.fill();
    }
  });

  x.restore();

  // Soft limb feather
  const fe = x.createRadialGradient(S / 2, S / 2, R - 3, S / 2, S / 2, R);
  fe.addColorStop(0, 'rgba(0,0,0,1)');
  fe.addColorStop(1, 'rgba(0,0,0,0)');
  x.globalCompositeOperation = 'destination-in';
  x.fillStyle = fe;
  x.fillRect(0, 0, S, S);
  x.globalCompositeOperation = 'source-over';

  return c;
}

function generateGlowCanvas(inner: string, mid: string): HTMLCanvasElement {
  const S = 256;
  const c = makeCanvas(S, S);
  const x = c.getContext('2d')!;
  const g = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, inner);
  g.addColorStop(0.32, mid);
  g.addColorStop(0.68, 'rgba(255,255,255,0.05)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, S, S);
  return c;
}

/**
 * Procedural Foreground Grass Silhouette (Kage near-plane grass bank)
 */
function generateGrassBankCanvas(seed: number): HTMLCanvasElement {
  const W = 1024;
  const H = 512;
  const c = makeCanvas(W, H);
  const x = c.getContext('2d')!;
  const rnd = mulberry32(seed);

  for (let i = 0; i < 4200; i++) {
    const bx = rnd() * W;
    const env = Math.sin((bx / W) * Math.PI);
    const by = H - rnd() * H * 0.42 * (0.35 + 0.65 * env);
    if (by > H) continue;
    const len = (22 + rnd() * 68) * (0.45 + 0.55 * env);
    const lean = (rnd() - 0.45) * 26;
    const tipX = bx + lean;
    const tipY = by - len;
    const w = 1.1 + rnd() * 2.1;

    const shade = 0.25 + rnd() * 0.75;
    const r = Math.round(14 + 28 * shade);
    const g = Math.round(22 + 46 * shade);
    const b = Math.round(18 + 32 * shade);

    x.fillStyle = `rgba(${r},${g},${b},0.92)`;
    x.beginPath();
    x.moveTo(bx - w, H);
    x.quadraticCurveTo(bx + lean * 0.35, by - len * 0.5, tipX, tipY);
    x.quadraticCurveTo(bx + lean * 0.45 + w, by - len * 0.5, bx + w, H);
    x.closePath();
    x.fill();
  }
  return c;
}

/**
 * Creates a single IUT Pointed-Arch Pillar Geometry
 */
function createPointedArchSlabGeometry(
  outerW: number,
  outerH: number,
  archHalfW: number,
  springY: number,
  apexY: number,
  depth: number
): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(-outerW / 2, 0);
  shape.lineTo(outerW / 2, 0);
  shape.lineTo(outerW / 2, outerH);
  shape.lineTo(-outerW / 2, outerH);
  shape.closePath();

  // Pointed Islamic Arch cutout hole
  const hole = new THREE.Path();
  hole.moveTo(-archHalfW, -0.1);
  hole.lineTo(-archHalfW, springY);
  // Left pointed arch curve to apex
  hole.quadraticCurveTo(-archHalfW * 0.92, springY + (apexY - springY) * 0.68, 0, apexY);
  // Right pointed arch curve from apex down to spring line
  hole.quadraticCurveTo(archHalfW * 0.92, springY + (apexY - springY) * 0.68, archHalfW, springY);
  hole.lineTo(archHalfW, -0.1);
  hole.closePath();

  shape.holes.push(hole);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.04,
    bevelThickness: 0.04,
    curveSegments: 32,
  });
  geo.translate(0, 0, -depth / 2);
  return geo;
}

/**
 * Creates the Inner Pointed-Arch Glowing Archivolt Band inside each Pillar
 */
function createInnerArchRimGeometry(
  archHalfW: number,
  rimThickness: number,
  springY: number,
  apexY: number,
  depth: number
): THREE.ExtrudeGeometry {
  const outerW = archHalfW + rimThickness;
  const outerApex = apexY + rimThickness * 1.15;

  const shape = new THREE.Shape();
  shape.moveTo(-outerW, 0);
  shape.lineTo(-outerW, springY);
  shape.quadraticCurveTo(-outerW * 0.92, springY + (outerApex - springY) * 0.68, 0, outerApex);
  shape.quadraticCurveTo(outerW * 0.92, springY + (outerApex - springY) * 0.68, outerW, springY);
  shape.lineTo(outerW, 0);
  shape.lineTo(archHalfW, 0);
  shape.lineTo(archHalfW, springY);
  shape.quadraticCurveTo(archHalfW * 0.92, springY + (apexY - springY) * 0.68, 0, apexY);
  shape.quadraticCurveTo(-archHalfW * 0.92, springY + (apexY - springY) * 0.68, -archHalfW, springY);
  shape.lineTo(-archHalfW, 0);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: depth * 0.92,
    bevelEnabled: false,
    steps: 1,
    curveSegments: 32,
  });
  geo.translate(0, 0, -(depth * 0.92) / 2);
  return geo;
}

export const IutFivePillars3D: React.FC<IutFivePillars3DProps> = ({
  activeChapter,
  hoveredPillar,
  cameraOverride,
  onScrollProgressChange,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef({
    activeChapter,
    hoveredPillar,
    cameraOverride,
    onScrollProgressChange,
  });

  useEffect(() => {
    stateRef.current = {
      activeChapter,
      hoveredPillar,
      cameraOverride,
      onScrollProgressChange,
    };
  }, [activeChapter, hoveredPillar, cameraOverride, onScrollProgressChange]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      try {
        const probeCanvas = document.createElement('canvas');
        const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const vpW = () => document.documentElement.clientWidth || window.innerWidth;
    const vpH = () => document.documentElement.clientHeight || window.innerHeight;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch {
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.setSize(vpW(), vpH(), true);
    renderer.setClearColor(0x06050b, 1);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.inset = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.zIndex = '0';
    renderer.domElement.style.pointerEvents = 'none';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06050b);
    scene.fog = new THREE.FogExp2(0x07060e, 0.0082);

    const pmremGenerator = new RoomEnvironment ? new THREE.PMREMGenerator(renderer) : null;
    if (pmremGenerator) {
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    }

    const camera = new THREE.PerspectiveCamera(40, vpW() / vpH(), 0.35, 260);
    scene.add(camera);

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const disposables: { dispose: () => void }[] = [];
    const makeTex = (
      canvasEl: HTMLCanvasElement,
      opts: { wrap?: THREE.Wrapping; repeat?: [number, number]; srgb?: boolean } = {}
    ) => {
      const t = new THREE.CanvasTexture(canvasEl);
      t.wrapS = t.wrapT = opts.wrap || THREE.ClampToEdgeWrapping;
      if (opts.repeat) t.repeat.set(opts.repeat[0], opts.repeat[1]);
      t.anisotropy = Math.min(8, maxAniso);
      t.colorSpace = opts.srgb === false ? THREE.NoColorSpace : THREE.SRGBColorSpace;
      t.needsUpdate = true;
      disposables.push(t);
      return t;
    };

    // 1. Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x886eb0, 0x0c0814, 0.58);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffb894, 1.75);
    dirLight.position.set(22, 30, 24);
    dirLight.target.position.set(0, 5, -15);
    scene.add(dirLight);
    scene.add(dirLight.target);
    if (!isSoftwareGl) {
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.set(1024, 1024);
      dirLight.shadow.camera.left = -26;
      dirLight.shadow.camera.right = 26;
      dirLight.shadow.camera.top = 26;
      dirLight.shadow.camera.bottom = -14;
      dirLight.shadow.camera.near = 2;
      dirLight.shadow.camera.far = 85;
      dirLight.shadow.bias = -0.0008;
    }

    const rimLight = new THREE.DirectionalLight(0x6366f1, 0.95);
    rimLight.position.set(-24, 20, -32);
    scene.add(rimLight);

    // 2. Reflective Lake Floor
    const waterTexData = generateWaterTextures();
    const waterMat = new THREE.MeshStandardMaterial({
      map: makeTex(waterTexData.map, { wrap: THREE.RepeatWrapping, repeat: [12, 12] }),
      normalMap: makeTex(waterTexData.normal, {
        wrap: THREE.RepeatWrapping,
        repeat: [16, 16],
        srgb: false,
      }),
      normalScale: new THREE.Vector2(0.28, 0.28),
      roughness: 0.14,
      metalness: 0.76,
      color: 0x181328,
    });
    disposables.push(waterMat);

    const lakeGeo = new THREE.PlaneGeometry(220, 220);
    disposables.push(lakeGeo);
    const lakeMesh = new THREE.Mesh(lakeGeo, waterMat);
    lakeMesh.rotation.x = -Math.PI / 2;
    lakeMesh.position.set(0, 0, -15);
    lakeMesh.receiveShadow = true;
    scene.add(lakeMesh);

    // 3. The Iconic IUT 5 Pillars Monument (at Z = -15)
    const MONUMENT_Z = -15;
    const monumentGroup = new THREE.Group();
    monumentGroup.position.set(0, 0, MONUMENT_Z);
    scene.add(monumentGroup);

    const brickTexData = generateRedBrickTextures();
    const brickMap = makeTex(brickTexData.map, { wrap: THREE.RepeatWrapping, repeat: [0.22, 0.22] });
    const brickNormal = makeTex(brickTexData.normal, {
      wrap: THREE.RepeatWrapping,
      repeat: [0.22, 0.22],
      srgb: false,
    });

    const outerW = 10.6;
    const outerH = 13.4;
    const archHalfW = 3.15;
    const springY = 6.2;
    const apexY = 10.7;
    const slabDepth = 0.95;
    const slabSpacing = 1.78;

    const slabGeo = createPointedArchSlabGeometry(
      outerW,
      outerH,
      archHalfW,
      springY,
      apexY,
      slabDepth
    );
    const rimGeo = createInnerArchRimGeometry(archHalfW, 0.28, springY, apexY, slabDepth);
    disposables.push(slabGeo, rimGeo);

    // Dark architectural recess fins between the 5 red-brick pillars (matching image_fbf0db8d.png)
    const recessMat = new THREE.MeshStandardMaterial({
      color: 0x1c1c24,
      roughness: 0.85,
      metalness: 0.15,
    });
    const recessWallGeo = new THREE.BoxGeometry(0.18, outerH - 0.15, slabSpacing - slabDepth + 0.08);
    const recessTopGeo = new THREE.BoxGeometry(outerW - 0.2, 0.18, slabSpacing - slabDepth + 0.08);
    disposables.push(recessMat, recessWallGeo, recessTopGeo);

    for (let g = 0; g < 4; g++) {
      const gapZ = (1.5 - g) * slabSpacing;
      const leftRecess = new THREE.Mesh(recessWallGeo, recessMat);
      leftRecess.position.set(-outerW / 2 + 0.18, outerH / 2, gapZ);
      monumentGroup.add(leftRecess);

      const rightRecess = new THREE.Mesh(recessWallGeo, recessMat);
      rightRecess.position.set(outerW / 2 - 0.18, outerH / 2, gapZ);
      monumentGroup.add(rightRecess);

      const topRecess = new THREE.Mesh(recessTopGeo, recessMat);
      topRecess.position.set(0, outerH - 0.18, gapZ);
      monumentGroup.add(topRecess);
    }

    interface PillarUnit {
      group: THREE.Group;
      slabMat: THREE.MeshStandardMaterial;
      rimMat: THREE.MeshStandardMaterial;
      light: THREE.PointLight;
      baseZ: number;
      index: number;
    }

    const pillars: PillarUnit[] = [];

    for (let i = 0; i < 5; i++) {
      const pGroup = new THREE.Group();
      const baseZ = (2 - i) * slabSpacing; // Pillar 0 in front (+3.56), Pillar 4 in back (-3.56)
      pGroup.position.set(0, 0, baseZ);

      const palette = PILLAR_PALETTES[i];

      const slabMat = new THREE.MeshStandardMaterial({
        map: brickMap,
        normalMap: brickNormal,
        normalScale: new THREE.Vector2(1.2, 1.2),
        color: new THREE.Color(0xc2382b),
        roughness: 0.72,
        metalness: 0.06,
        emissive: new THREE.Color(palette.hex),
        emissiveIntensity: 0.05,
      });

      const rimMat = new THREE.MeshStandardMaterial({
        map: brickMap,
        normalMap: brickNormal,
        normalScale: new THREE.Vector2(0.8, 0.8),
        color: new THREE.Color(0xece0d8),
        roughness: 0.42,
        metalness: 0.12,
        emissive: new THREE.Color(palette.hex),
        emissiveIntensity: 0.52,
      });

      disposables.push(slabMat, rimMat);

      const slabMesh = new THREE.Mesh(slabGeo, slabMat);
      slabMesh.castShadow = true;
      slabMesh.receiveShadow = true;
      pGroup.add(slabMesh);

      const rimMesh = new THREE.Mesh(rimGeo, rimMat);
      pGroup.add(rimMesh);

      // Point light tucked inside each pillar's arch
      const pLight = new THREE.PointLight(palette.hex, 2.5, 16, 1.6);
      pLight.position.set(0, 6.8, 0);
      pGroup.add(pLight);

      monumentGroup.add(pGroup);
      pillars.push({
        group: pGroup,
        slabMat,
        rimMat,
        light: pLight,
        baseZ,
        index: i,
      });
    }

    // Horizontal red-brick tie-beams connecting the 5 pillars (visible in the IUT photos)
    const tieBeamMat = new THREE.MeshStandardMaterial({
      map: brickMap,
      normalMap: brickNormal,
      color: 0x9e2f24,
      roughness: 0.82,
      metalness: 0.05,
    });
    const tieBeamGeo = new THREE.BoxGeometry(1.1, 0.55, slabSpacing * 4 + slabDepth);
    disposables.push(tieBeamMat, tieBeamGeo);

    [-4.2, 4.2].forEach((txPos) => {
      [3.2, 6.1].forEach((tyPos) => {
        const beam = new THREE.Mesh(tieBeamGeo, tieBeamMat);
        beam.position.set(txPos, tyPos, 0);
        monumentGroup.add(beam);
      });
    });

    // Water-level brick plinth & arched walkway bridge (from image_9b1a7a45.png)
    const plinthGeo = new THREE.BoxGeometry(11.4, 0.55, slabSpacing * 4 + slabDepth + 1.2);
    const plinthMesh = new THREE.Mesh(plinthGeo, tieBeamMat);
    plinthMesh.position.set(0, 0.22, 0);
    monumentGroup.add(plinthMesh);

    // Walkway extending forward/backward with low brick arched railings
    const walkwayDeckGeo = new THREE.BoxGeometry(5.6, 0.28, 22);
    const walkwayDeck = new THREE.Mesh(walkwayDeckGeo, tieBeamMat);
    walkwayDeck.position.set(0, 0.25, 4.5);
    monumentGroup.add(walkwayDeck);
    disposables.push(plinthGeo, walkwayDeckGeo);

    const railPillarGeo = new THREE.BoxGeometry(0.38, 1.35, 0.45);
    const railTopGeo = new THREE.BoxGeometry(0.42, 0.22, 16);
    disposables.push(railPillarGeo, railTopGeo);

    [-2.6, 2.6].forEach((rx) => {
      const topBar = new THREE.Mesh(railTopGeo, tieBeamMat);
      topBar.position.set(rx, 1.35, 6.2);
      monumentGroup.add(topBar);
      for (let zStep = -1; zStep <= 4; zStep++) {
        const post = new THREE.Mesh(railPillarGeo, tieBeamMat);
        post.position.set(rx, 0.72, 1.5 + zStep * 2.6);
        monumentGroup.add(post);
      }
    });

    // Warm reflection glow on the water right beneath the 5 Pillars
    const waterSpillGeo = new THREE.PlaneGeometry(26, 26);
    const waterSpillMat = new THREE.MeshBasicMaterial({
      map: makeTex(generateGlowCanvas('rgba(228,60,40,0.82)', 'rgba(130,45,160,0.28)')),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.52,
    });
    disposables.push(waterSpillGeo, waterSpillMat);
    const waterSpill = new THREE.Mesh(waterSpillGeo, waterSpillMat);
    waterSpill.rotation.x = -Math.PI / 2;
    waterSpill.position.set(0, 0.03, MONUMENT_Z + 1.5);
    scene.add(waterSpill);

    // 4. The Vermilion / Ivory Moon (from Kage & IUT Night Renders)
    const moonGroup = new THREE.Group();
    const moonGeo = new THREE.PlaneGeometry(11.5, 11.5);
    const moonMat = new THREE.MeshBasicMaterial({
      map: makeTex(generateMoonCanvas()),
      color: new THREE.Color(1.0, 0.42, 0.36),
      transparent: true,
      depthWrite: false,
      fog: false,
    });
    const moonDisc = new THREE.Mesh(moonGeo, moonMat);
    moonGroup.add(moonDisc);

    const haloGeo = new THREE.PlaneGeometry(42, 42);
    const haloMat = new THREE.MeshBasicMaterial({
      map: makeTex(generateGlowCanvas('rgba(235,80,65,0.68)', 'rgba(125,50,155,0.22)')),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
      opacity: 0.55,
    });
    const moonHalo = new THREE.Mesh(haloGeo, haloMat);
    moonHalo.position.z = -0.2;
    moonGroup.add(moonHalo);
    moonGroup.position.set(10.5, 22.0, -56);
    scene.add(moonGroup);
    disposables.push(moonGeo, moonMat, haloGeo, haloMat);

    // 5. Subtle low-waterline "B T M" Wordmark in the Hero Foreground (positioned low so it never blocks the 5 Pillars)
    const WORD_Z = 4.5;
    const wordGroup = new THREE.Group();
    wordGroup.position.set(-4.5, 0.85, WORD_Z);
    scene.add(wordGroup);

    const wordLetters = ['B', 'T', 'M'];
    const glyphMeshes: THREE.Mesh[] = [];
    wordLetters.forEach((ch, idx) => {
      const cw = 320;
      const chh = 360;
      const c = makeCanvas(cw, chh);
      const x = c.getContext('2d')!;
      x.font = '700 260px "Plus Jakarta Sans", system-ui, sans-serif';
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      const grad = x.createLinearGradient(0, 30, 0, chh - 30);
      grad.addColorStop(0, 'rgba(236, 240, 238, 0.35)');
      grad.addColorStop(0.55, 'rgba(202, 212, 208, 0.25)');
      grad.addColorStop(1, 'rgba(130, 145, 140, 0.12)');
      x.fillStyle = grad;
      x.fillText(ch, cw / 2, chh / 2);

      const gGeo = new THREE.PlaneGeometry(2.2, 2.5);
      const gMat = new THREE.MeshBasicMaterial({
        map: makeTex(c),
        transparent: true,
        depthWrite: false,
        fog: true,
        opacity: 0.45,
      });
      disposables.push(gGeo, gMat);
      const mesh = new THREE.Mesh(gGeo, gMat);
      mesh.position.set((idx - 1) * 3.1, 0, 0);
      mesh.renderOrder = 12;
      wordGroup.add(mesh);
      glyphMeshes.push(mesh);
    });

    // 6. Kage Foreground Grass Banks (tucked along the bottom edge so the 5 Pillars & lake reflection remain completely open)
    const grassGeo = new THREE.PlaneGeometry(18, 3.6);
    const grassMatL = new THREE.MeshBasicMaterial({
      map: makeTex(generateGrassBankCanvas(101)),
      transparent: true,
      depthWrite: false,
      opacity: 0.72,
    });
    const grassMatR = new THREE.MeshBasicMaterial({
      map: makeTex(generateGrassBankCanvas(202)),
      transparent: true,
      depthWrite: false,
      opacity: 0.68,
    });
    disposables.push(grassGeo, grassMatL, grassMatR);

    const grassL = new THREE.Mesh(grassGeo, grassMatL);
    grassL.position.set(-6.5, -0.6, 8.5);
    grassL.renderOrder = 15;
    scene.add(grassL);

    const grassR = new THREE.Mesh(grassGeo, grassMatR);
    grassR.position.set(8.5, -0.7, 7.5);
    grassR.renderOrder = 14;
    scene.add(grassR);

    // 7. Atmospheric Floating Embers / Fireflies & Water Ripples
    const emberCount = 220;
    const emberPos = new Float32Array(emberCount * 3);
    const emberSeed = new Float32Array(emberCount);
    const rnd = mulberry32(77);
    for (let i = 0; i < emberCount; i++) {
      emberPos[i * 3] = (rnd() - 0.5) * 42;
      emberPos[i * 3 + 1] = 0.4 + rnd() * 15;
      emberPos[i * 3 + 2] = -36 + rnd() * 44;
      emberSeed[i] = rnd();
    }
    const emberGeo = new THREE.BufferGeometry();
    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPos, 3));
    const emberMat = new THREE.PointsMaterial({
      map: makeTex(generateGlowCanvas('rgba(255,190,140,1)', 'rgba(224,60,40,0.4)')),
      size: 0.38,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.78,
    });
    disposables.push(emberGeo, emberMat);
    const embers = new THREE.Points(emberGeo, emberMat);
    scene.add(embers);

    // 8. 6 Camera Waypoints — Wide comfortable distance showing all 5 Pillars on open, then smoothly orbiting in a round 360° path on scroll
    const CAM_WAYPOINTS = [
      // 0: Hero (Initial Open) — Wide three-quarter oblique view (like image_fbf0db8d.png) where all 5 pillars, side gaps, pointed arch, and water reflection are clearly visible
      { p: new THREE.Vector3(20.5, 6.8, 12.5), t: new THREE.Vector3(-2.0, 5.2, MONUMENT_Z), fov: 40 },
      // 1: 01. Batches — Smoothly orbits across the front to the front-left oblique perspective showing all 5 pillars & bridge
      { p: new THREE.Vector3(-16.5, 6.4, 12.0), t: new THREE.Vector3(0.0, 5.4, MONUMENT_Z), fov: 40 },
      // 2: 02. Global Map — Continues round orbit to the left-side profile showing all 5 separated red-brick pillars in full depth
      { p: new THREE.Vector3(-26.5, 5.8, -2.5), t: new THREE.Vector3(0.0, 5.5, MONUMENT_Z), fov: 40 },
      // 3: 03. Overview — Orbits around the back-left three-quarter angle looking through the 5 illuminated pointed arches
      { p: new THREE.Vector3(-21.0, 6.6, -37.5), t: new THREE.Vector3(0.0, 5.5, MONUMENT_Z), fov: 40 },
      // 4: 04. Insights — Orbits to the back-right elevated perspective across the 5 pillars and lake reflection
      { p: new THREE.Vector3(21.5, 7.6, -37.0), t: new THREE.Vector3(0.0, 5.3, MONUMENT_Z), fov: 40 },
      // 5: 05. About — Completes the round circular orbit back to the front-right oblique sanctuary vista
      { p: new THREE.Vector3(14.5, 6.2, 14.0), t: new THREE.Vector3(0.0, 5.4, MONUMENT_Z), fov: 40 },
    ];

    const curveP = new THREE.CatmullRomCurve3(
      CAM_WAYPOINTS.map((w) => w.p),
      false,
      'catmullrom',
      0.45
    );
    const curveT = new THREE.CatmullRomCurve3(
      CAM_WAYPOINTS.map((w) => w.t),
      false,
      'catmullrom',
      0.45
    );

    const rig = {
      scrollProg: 0,
      smoothProg: 0,
      mx: 0,
      my: 0,
      tmx: 0,
      tmy: 0,
    };

    const computeScrollProgress = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - vpH());
      const raw = THREE.MathUtils.clamp(window.scrollY / maxScroll, 0, 1);
      return raw * (CAM_WAYPOINTS.length - 1);
    };

    const onScroll = () => {
      rig.scrollProg = computeScrollProgress();
      const idx = Math.round(rig.scrollProg);
      if (stateRef.current.onScrollProgressChange) {
        stateRef.current.onScrollProgressChange(rig.scrollProg, idx);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      rig.tmx = (e.clientX / vpW()) * 2 - 1;
      rig.tmy = -((e.clientY / vpH()) * 2 - 1);
    };

    const onResize = () => {
      const w = vpW();
      const h = vpH();
      renderer.setSize(w, h, true);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rig.scrollProg = computeScrollProgress();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    onScroll();

    const _camPos = new THREE.Vector3();
    const _camTarget = new THREE.Vector3();
    const _tempColor = new THREE.Color();

    let frameId = 0;
    let disposed = false;
    let prevTime = performance.now();
    let elapsed = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min((now - prevTime) / 1000, 0.05);
      prevTime = now;
      elapsed += dt;

      const override = stateRef.current.cameraOverride;
      const targetProg =
        override !== null && override >= 0 && override < CAM_WAYPOINTS.length
          ? override
          : rig.scrollProg;

      rig.smoothProg = THREE.MathUtils.damp(rig.smoothProg, targetProg, 4.2, dt);
      rig.mx = THREE.MathUtils.damp(rig.mx, rig.tmx, 3.0, dt);
      rig.my = THREE.MathUtils.damp(rig.my, rig.tmy, 3.0, dt);

      const u = THREE.MathUtils.clamp(rig.smoothProg / (CAM_WAYPOINTS.length - 1), 0, 1);
      curveP.getPoint(u, _camPos);
      curveT.getPoint(u, _camTarget);

      // Keep camera on a true round orbital path at a comfortable distance (~33 units) around the 5 Pillars
      const narrowFactor = THREE.MathUtils.clamp((1.4 - vpW() / vpH()) / 0.9, 0, 1);
      const orbitRadius = 33.0 + narrowFactor * 6.5;
      const dx = _camPos.x;
      const dz = _camPos.z - MONUMENT_Z;
      const currentDist = Math.hypot(dx, dz) || 1;
      _camPos.x = (dx / currentDist) * orbitRadius;
      _camPos.z = MONUMENT_Z + (dz / currentDist) * orbitRadius;
      _camPos.y += narrowFactor * 1.1;

      // Subtle mouse parallax
      _camPos.x += rig.mx * 0.85;
      _camPos.y += rig.my * 0.42;
      _camTarget.x -= rig.mx * 0.25;
      _camTarget.y -= rig.my * 0.15;

      camera.position.copy(_camPos);
      camera.lookAt(_camTarget);

      // Animate the 5 Pillars dynamically based on scroll & hover
      const hovPillar = stateRef.current.hoveredPillar;
      const scrollPhase = rig.smoothProg; // 0 .. 5

      // Dynamic spacing & subtle rotation of the 5 Pillars so all 5 slabs read clearly on open and while orbiting
      const fanSpread = 1.06 + Math.sin(u * Math.PI) * 0.22;
      monumentGroup.rotation.y = -0.14 + Math.sin(u * Math.PI * 2) * 0.12;

      pillars.forEach((p, idx) => {
        // Focus weight for this pillar: either hovered chip or corresponding scroll chapter (1..5)
        const chapterFocus = 1 - Math.min(1, Math.abs(scrollPhase - (idx + 0.65)) * 0.95);
        const isHovered = hovPillar === idx;
        const highlight = isHovered ? 1.0 : chapterFocus;

        // Subtle architectural stepping / breathing of the 5 pillars as you scroll
        const targetZ = p.baseZ * fanSpread + (isHovered ? 0.35 : 0);
        const targetY =
          Math.sin(elapsed * 1.1 + idx * 0.7) * 0.06 +
          highlight * 0.38 +
          Math.sin(u * Math.PI) * (idx - 2) * 0.14;
        const targetRotY = Math.sin(u * Math.PI) * (idx - 2) * 0.035;

        p.group.position.z = THREE.MathUtils.damp(p.group.position.z, targetZ, 5, dt);
        p.group.position.y = THREE.MathUtils.damp(p.group.position.y, targetY, 5, dt);
        p.group.rotation.y = THREE.MathUtils.damp(p.group.rotation.y, targetRotY, 5, dt);

        // Inner arch color & emissive intensity (inspired by Image 3 & 4 rainbow/night arch lighting)
        const rainbowBlend = THREE.MathUtils.smoothstep(scrollPhase, 0.35, 2.2);
        const pal = PILLAR_PALETTES[idx];
        _tempColor.setHex(0xe03c28).lerp(new THREE.Color(pal.hex), rainbowBlend);

        p.rimMat.emissive.copy(_tempColor);
        p.rimMat.emissiveIntensity = 0.35 + highlight * 1.25 + rainbowBlend * 0.55;
        p.slabMat.emissive.copy(_tempColor);
        p.slabMat.emissiveIntensity = 0.03 + highlight * 0.22;
        p.light.color.copy(_tempColor);
        p.light.intensity = 1.6 + highlight * 3.8 + rainbowBlend * 1.4;
      });

      // Moon tracks slightly with scroll so it crowns the arch in low-angle chapters
      const moonTargetX = THREE.MathUtils.lerp(11.5, 1.2, THREE.MathUtils.smoothstep(u, 0.15, 0.55));
      const moonTargetY = THREE.MathUtils.lerp(21.5, 17.5, THREE.MathUtils.smoothstep(u, 0.15, 0.55));
      moonGroup.position.x = THREE.MathUtils.damp(moonGroup.position.x, moonTargetX, 3.5, dt);
      moonGroup.position.y = THREE.MathUtils.damp(moonGroup.position.y, moonTargetY, 3.5, dt);
      moonGroup.lookAt(camera.position);

      // Fade out foreground 3D "BTM" wordmark and near grass as camera moves past Hero into the monument
      const heroFade = 1 - THREE.MathUtils.smoothstep(rig.smoothProg, 0.05, 0.85);
      wordGroup.visible = heroFade > 0.01;
      glyphMeshes.forEach((m, i) => {
        const mat = m.material as THREE.MeshBasicMaterial;
        mat.opacity = heroFade * 0.9;
        m.position.y = -(1 - heroFade) * (1.2 + i * 0.2);
      });

      grassMatL.opacity = heroFade * 0.9;
      grassMatR.opacity = heroFade * 0.88;
      grassL.visible = heroFade > 0.01;
      grassR.visible = heroFade > 0.01;

      // Drift embers upward
      const posAttr = emberGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < emberCount; i++) {
        let py = posAttr.getY(i) + (0.22 + emberSeed[i] * 0.35) * dt;
        if (py > 15) py = 0.3;
        posAttr.setY(i, py);
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} aria-hidden="true" className="fixed inset-0 z-0 pointer-events-none" />;
};
