/**
 * Procedural 3D pets rendered with three.js. Loaded lazily (dynamic import) so
 * the 3D engine never blocks the study pages. No external model files: every
 * animal is built from smooth primitives with soft "velvet" fur materials.
 */
import * as THREE from "three";
import type { PetSpecies } from "@/lib/types";
import type { Coat, Emotion, PetAction } from "./pets";

type EyeMode = "open" | "happy" | "closed";
type MouthMode = "smile" | "frown" | "open" | "o" | "flat";

interface Pose {
  bounceAmp: number;
  bounceFreq: number;
  tailSpeed: number;
  tailAmp: number;
  ear: number; // -1 droop .. 1 perked
  tilt: number;
  pitch: number;
  eyeOpen: number;
  blush: number;
  sway: number;
  slump: number; // 0..1 body lowered
}

const POSES: Record<Emotion, Pose & { eyes: EyeMode; mouth: MouthMode }> = {
  happy: { bounceAmp: 0.03, bounceFreq: 1.6, tailSpeed: 6, tailAmp: 0.45, ear: 0.2, tilt: 0.1, pitch: 0, eyeOpen: 1, blush: 0.45, sway: 0.04, slump: 0, eyes: "open", mouth: "smile" },
  excited: { bounceAmp: 0.09, bounceFreq: 2.6, tailSpeed: 15, tailAmp: 0.75, ear: 0.6, tilt: 0, pitch: -0.08, eyeOpen: 1.15, blush: 0.7, sway: 0.03, slump: 0, eyes: "open", mouth: "open" },
  curious: { bounceAmp: 0.008, bounceFreq: 1, tailSpeed: 2.5, tailAmp: 0.3, ear: 0.7, tilt: 0.32, pitch: -0.05, eyeOpen: 1.12, blush: 0.15, sway: 0.02, slump: 0, eyes: "open", mouth: "flat" },
  sleepy: { bounceAmp: 0.0, bounceFreq: 0.8, tailSpeed: 0.8, tailAmp: 0.12, ear: -0.35, tilt: 0.12, pitch: 0.18, eyeOpen: 0.35, blush: 0.2, sway: 0.05, slump: 0.25, eyes: "open", mouth: "flat" },
  sad: { bounceAmp: 0, bounceFreq: 1, tailSpeed: 0.8, tailAmp: 0.08, ear: -1, tilt: -0.1, pitch: 0.28, eyeOpen: 0.78, blush: 0, sway: 0.01, slump: 0.35, eyes: "open", mouth: "frown" },
  surprised: { bounceAmp: 0, bounceFreq: 1, tailSpeed: 1, tailAmp: 0.15, ear: 1, tilt: 0, pitch: -0.14, eyeOpen: 1.38, blush: 0.1, sway: 0, slump: 0, eyes: "open", mouth: "o" },
  relaxed: { bounceAmp: 0.006, bounceFreq: 0.9, tailSpeed: 1.8, tailAmp: 0.3, ear: 0, tilt: 0.08, pitch: 0.04, eyeOpen: 0.82, blush: 0.3, sway: 0.05, slump: 0.08, eyes: "open", mouth: "smile" },
  loved: { bounceAmp: 0.045, bounceFreq: 2, tailSpeed: 11, tailAmp: 0.7, ear: 0.1, tilt: 0.2, pitch: -0.04, eyeOpen: 1, blush: 1, sway: 0.09, slump: 0, eyes: "happy", mouth: "smile" },
};

const ACTION_DUR: Record<PetAction, number> = {
  jump: 0.75,
  hop: 0.95,
  spin: 1.1,
  stretch: 2.3,
  groom: 2.6,
  earTwitch: 0.55,
  lookAround: 2.6,
  wiggle: 1.3,
  tailChase: 1.5,
  pounce: 1.25,
  nod: 0.8,
  walk: 1.6,
};

interface Rig {
  root: THREE.Group;
  body: THREE.Group;
  head: THREE.Group;
  ears: THREE.Group[];
  earBase: { x: number; z: number }[];
  tail: THREE.Group[];
  tailBase: number[];
  frontLegs: THREE.Group[];
  eyesOpen: THREE.Group[];
  eyesHappy: THREE.Object3D[];
  eyesClosed: THREE.Object3D[];
  mouth: Record<MouthMode, THREE.Object3D>;
  cheeks: THREE.MeshStandardMaterial;
  shadow: THREE.Mesh;
  species: PetSpecies;
}

const ease = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

function luminance(hex: string) {
  const c = new THREE.Color(hex);
  return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
}

function fur(color: string, dark: boolean) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.82,
    metalness: 0,
    sheen: 1,
    sheenRoughness: 0.45,
    sheenColor: new THREE.Color(dark ? "#9fb0ff" : "#fff1e4"),
  });
}

function sphere(mat: THREE.Material, r = 1, seg = 40) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.round(seg * 0.75)), mat);
  return m;
}

function place<T extends THREE.Object3D>(o: T, x: number, y: number, z: number, s?: [number, number, number]): T {
  o.position.set(x, y, z);
  if (s) o.scale.set(...s);
  return o;
}

function shadowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(64, 64, 4, 64, 64, 62);
  grd.addColorStop(0, "rgba(0,0,0,0.42)");
  grd.addColorStop(0.55, "rgba(0,0,0,0.16)");
  grd.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildRig(species: PetSpecies, coat: Coat, dark: boolean): Rig {
  const mBody = fur(coat.body, dark);
  const mBelly = fur(coat.belly, dark);
  const mDetail = fur(coat.detail, dark);
  const mAccent = new THREE.MeshStandardMaterial({ color: coat.accent, roughness: 0.45 });
  const mEye = new THREE.MeshStandardMaterial({ color: "#17110f", roughness: 0.08, metalness: 0.1 });
  const mShine = new THREE.MeshBasicMaterial({ color: "#ffffff" });
  const mLine = new THREE.MeshStandardMaterial({ color: luminance(coat.body) < 0.25 ? "#f3e6dc" : "#3a2622", roughness: 0.6 });
  const mMouth = new THREE.MeshStandardMaterial({ color: "#5c2327", roughness: 0.5 });
  const mTongue = new THREE.MeshStandardMaterial({ color: "#f07c8c", roughness: 0.5 });
  const cheeks = new THREE.MeshStandardMaterial({ color: "#ff7f98", roughness: 0.9, transparent: true, opacity: 0.4, depthWrite: false });

  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  const dims = {
    cat: { body: [0.6, 0.6, 0.56], head: [1.04, 0.9, 0.92], headY: 1.3 },
    dog: { body: [0.62, 0.62, 0.6], head: [1, 0.94, 0.95], headY: 1.32 },
    rabbit: { body: [0.66, 0.63, 0.6], head: [0.95, 0.9, 0.9], headY: 1.28 },
    fox: { body: [0.55, 0.6, 0.54], head: [1.02, 0.88, 0.9], headY: 1.3 },
  }[species];

  // Torso, chest, haunches, feet
  body.add(place(sphere(mBody), 0, 0.62, 0, dims.body as [number, number, number]));
  body.add(place(sphere(mBelly), 0, 0.6, dims.body[2] - 0.24, [0.38, 0.44, 0.27]));
  for (const s of [-1, 1]) {
    body.add(place(sphere(mBody), s * 0.38, 0.3, 0.02, [0.26, 0.25, 0.34]));
    body.add(place(sphere(species === "rabbit" ? mBelly : mDetail), s * 0.4, 0.07, 0.24, [0.13, 0.075, 0.22]));
  }
  // Front legs pivot at the shoulder so paws can lift (grooming) or dangle (dragging)
  const frontLegs: THREE.Group[] = [];
  for (const s of [-1, 1]) {
    const leg = new THREE.Group();
    leg.position.set(s * 0.2, 0.55, 0.3);
    const limb = new THREE.Mesh(new THREE.CapsuleGeometry(0.095, 0.32, 8, 20), mBody);
    limb.position.set(0, -0.26, 0.05);
    leg.add(limb);
    leg.add(place(sphere(species === "fox" || species === "dog" ? mDetail : mBelly, 0.11), 0, -0.48, 0.1, [1, 0.72, 1.1]));
    body.add(leg);
    frontLegs.push(leg);
  }

  // Head
  const head = new THREE.Group();
  head.position.set(0, dims.headY, 0.1);
  body.add(head);
  head.add(place(sphere(mBody, 0.5), 0, 0, 0, dims.head as [number, number, number]));

  // Muzzle + nose
  const snout = {
    cat: { pos: [0, -0.12, 0.38], s: [0.17, 0.12, 0.12], nose: [0, -0.06, 0.5], noseR: 0.034, mouthZ: 0.49 },
    rabbit: { pos: [0, -0.12, 0.37], s: [0.16, 0.12, 0.12], nose: [0, -0.06, 0.49], noseR: 0.032, mouthZ: 0.48 },
    dog: { pos: [0, -0.12, 0.4], s: [0.21, 0.16, 0.2], nose: [0, -0.05, 0.6], noseR: 0.065, mouthZ: 0.57 },
    fox: { pos: [0, -0.12, 0.42], s: [0.16, 0.12, 0.27], nose: [0, -0.08, 0.7], noseR: 0.048, mouthZ: 0.62 },
  }[species];
  head.add(place(sphere(mBelly), snout.pos[0], snout.pos[1], snout.pos[2], snout.s as [number, number, number]));
  head.add(place(sphere(mAccent, snout.noseR), snout.nose[0], snout.nose[1], snout.nose[2], [1.35, 0.85, 0.9]));

  // Eyes (three modes)
  const eyesOpen: THREE.Group[] = [];
  const eyesHappy: THREE.Object3D[] = [];
  const eyesClosed: THREE.Object3D[] = [];
  const eyeX = species === "dog" ? 0.18 : 0.175;
  const eyeY = species === "fox" ? 0.04 : 0.05;
  const arcGeo = new THREE.TorusGeometry(0.058, 0.013, 10, 24, Math.PI);
  for (const s of [-1, 1]) {
    const g = new THREE.Group();
    g.position.set(s * eyeX, eyeY, 0.41);
    g.rotation.y = s * 0.36;
    const eye = place(sphere(mEye, 0.072), 0, 0, 0, [species === "fox" ? 0.92 : 1, 1.08, 0.55]);
    g.add(eye);
    g.add(place(sphere(mShine, 0.022, 16), 0.022, 0.03, 0.04));
    g.add(place(sphere(mShine, 0.01, 12), -0.02, -0.025, 0.04));
    head.add(g);
    eyesOpen.push(g);

    const happy = new THREE.Mesh(arcGeo, mLine);
    happy.position.set(s * eyeX, eyeY - 0.025, 0.43);
    happy.rotation.y = s * 0.36;
    head.add(happy);
    eyesHappy.push(happy);

    const closed = new THREE.Mesh(arcGeo, mLine);
    closed.position.set(s * eyeX, eyeY + 0.02, 0.43);
    closed.rotation.set(0, s * 0.36, Math.PI);
    head.add(closed);
    eyesClosed.push(closed);
  }

  // Cheeks
  for (const s of [-1, 1]) {
    const c = place(sphere(cheeks, 1, 20), s * 0.3, -0.09, 0.35, [0.075, 0.045, 0.02]);
    c.rotation.y = s * 0.7;
    head.add(c);
  }

  // Whiskers (cat, rabbit)
  if (species === "cat" || species === "rabbit") {
    const wGeo = new THREE.CylinderGeometry(0.0045, 0.0045, 0.3, 6);
    const wMat = new THREE.MeshBasicMaterial({ color: dark ? "#e9ddd4" : "#7a5e52", transparent: true, opacity: 0.55 });
    for (const s of [-1, 1])
      for (const k of [0, 1]) {
        const w = new THREE.Mesh(wGeo, wMat);
        w.position.set(s * 0.27, -0.1 - k * 0.04, 0.39);
        w.rotation.set(0, s * -0.4, Math.PI / 2 + s * (k ? -0.12 : 0.08));
        head.add(w);
      }
  }

  // Mouth variants
  const mouthY = snout.nose[1] - 0.075;
  const mouth = {} as Record<MouthMode, THREE.Object3D>;
  const smileGeo = new THREE.TorusGeometry(0.045, 0.011, 8, 20, Math.PI);
  const smile = new THREE.Group();
  for (const s of [-1, 1]) {
    const a = new THREE.Mesh(smileGeo, mLine);
    a.position.set(s * 0.042, 0, 0);
    a.rotation.z = Math.PI;
    smile.add(a);
  }
  mouth.smile = place(smile, 0, mouthY + 0.02, snout.mouthZ);
  const frown = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.011, 8, 20, Math.PI), mLine);
  mouth.frown = place(frown, 0, mouthY - 0.03, snout.mouthZ);
  const open = new THREE.Group();
  open.add(place(sphere(mMouth, 0.06, 24), 0, 0, 0, [1.1, 0.85, 0.4]));
  open.add(place(sphere(mTongue, 0.04, 20), 0, -0.025, 0.012, [1, 0.6, 0.4]));
  mouth.open = place(open, 0, mouthY - 0.02, snout.mouthZ - 0.01);
  mouth.o = place(sphere(mMouth, 0.03, 20), 0, mouthY - 0.02, snout.mouthZ - 0.005, [1, 1.2, 0.4]);
  const flat = new THREE.Mesh(new THREE.CapsuleGeometry(0.009, 0.05, 4, 8), mLine);
  flat.rotation.z = Math.PI / 2;
  mouth.flat = place(flat, 0, mouthY - 0.005, snout.mouthZ);
  Object.values(mouth).forEach((m) => head.add(m));

  // Ears (pivot at the base)
  const ears: THREE.Group[] = [];
  const earBase: { x: number; z: number }[] = [];
  for (const s of [-1, 1]) {
    const ear = new THREE.Group();
    if (species === "cat") {
      ear.position.set(s * 0.28, 0.33, -0.02);
      const o = place(new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.3, 28), mBody), 0, 0.12, 0, [1, 1, 0.55]);
      const i = place(new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.2, 24), mAccent), 0, 0.09, 0.045, [1, 1, 0.3]);
      ear.add(o, i);
      earBase.push({ x: 0, z: -s * 0.34 });
    } else if (species === "fox") {
      ear.position.set(s * 0.27, 0.33, -0.04);
      const o = place(new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.42, 28), mBody), 0, 0.17, 0, [1, 1, 0.5]);
      const i = place(new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.28, 24), mBelly), 0, 0.12, 0.05, [1, 1, 0.3]);
      const tip = place(new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.13, 24), mDetail), 0, 0.33, 0.004, [1, 1, 0.55]);
      ear.add(o, i, tip);
      earBase.push({ x: 0, z: -s * 0.3 });
    } else if (species === "rabbit") {
      ear.position.set(s * 0.15, 0.36, -0.05);
      const o = place(new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.5, 10, 24), mBody), 0, 0.33, 0, [1, 1, 0.55]);
      const i = place(new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.4, 8, 20), mAccent), 0, 0.33, 0.04, [1, 1, 0.3]);
      ear.add(o, i);
      earBase.push({ x: 0.05, z: -s * 0.14 });
    } else {
      ear.position.set(s * 0.4, 0.2, -0.02);
      const o = place(sphere(mDetail), 0, -0.2, 0.02, [0.12, 0.27, 0.19]);
      ear.add(o);
      earBase.push({ x: 0, z: s * 0.18 });
    }
    head.add(ear);
    ears.push(ear);
  }

  // Tail chain
  const tail: THREE.Group[] = [];
  const tailBase: number[] = [];
  const tailRoot = new THREE.Group();
  tailRoot.position.set(0, 0.32, -0.45);
  body.add(tailRoot);
  let parent: THREE.Object3D = tailRoot;
  const spec =
    species === "cat"
      ? { n: 7, len: 0.12, r: (i: number) => 0.055 - i * 0.002, base: -1.05, curve: -0.22, tipMat: mDetail }
      : species === "dog"
        ? { n: 4, len: 0.11, r: () => 0.065, base: -0.55, curve: -0.28, tipMat: mDetail }
        : species === "fox"
          ? { n: 5, len: 0.15, r: (i: number) => [0.1, 0.15, 0.18, 0.17, 0.13][i], base: -1.25, curve: -0.2, tipMat: mBelly }
          : { n: 1, len: 0.01, r: () => 0.15, base: 0, curve: 0, tipMat: mBelly };
  for (let i = 0; i < spec.n; i++) {
    const seg = new THREE.Group();
    seg.position.set(0, i === 0 ? 0 : spec.len, 0);
    const isTip = i === spec.n - 1;
    const mat = isTip ? spec.tipMat : mBody;
    const mesh =
      species === "fox" || species === "rabbit"
        ? place(sphere(mat, spec.r(i), 28), 0, spec.len / 2, 0, species === "fox" ? [1, 1.25, 1] : [1, 1, 1])
        : place(new THREE.Mesh(new THREE.CapsuleGeometry(spec.r(i), spec.len, 6, 16), mat), 0, spec.len / 2, 0);
    seg.add(mesh);
    parent.add(seg);
    parent = seg;
    tail.push(seg);
    tailBase.push(i === 0 ? spec.base : spec.curve);
  }
  if (species === "rabbit") tailRoot.position.set(0, 0.3, -0.55);

  // Soft contact shadow
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false, opacity: dark ? 0.9 : 0.6 }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.005;
  shadow.scale.set(0.75, 0.6, 1);

  return { root, body, head, ears, earBase, tail, tailBase, frontLegs, eyesOpen, eyesHappy, eyesClosed, mouth, cheeks, shadow, species };
}

function disposeTree(o: THREE.Object3D) {
  o.traverse((c) => {
    const m = c as THREE.Mesh;
    if (m.geometry) m.geometry.dispose();
    const mat = m.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
    else if (mat) {
      const map = (mat as THREE.MeshBasicMaterial).map;
      if (map) map.dispose();
      mat.dispose();
    }
  });
}

export interface PetEngineOptions {
  species: PetSpecies;
  coat: Coat;
  dark: boolean;
  reducedMotion?: boolean;
  /** Fixed yaw of the whole pet (3/4 view looks more 3D). */
  yaw?: number;
  /** >1 frames the pet tighter (portraits). */
  zoom?: number;
}

export class PetEngine {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  private rig!: Rig;
  private lights: { hemi: THREE.HemisphereLight; key: THREE.DirectionalLight; rim: THREE.DirectionalLight; fill: THREE.DirectionalLight };
  private opts: PetEngineOptions;
  private raf = 0;
  private last = 0;
  private time = 0;
  private emotion: Emotion = "happy";
  private pose: Pose = { ...POSES.happy };
  private eyeMode: EyeMode = "open";
  private mouthMode: MouthMode = "smile";
  private pendingFace: { eyes: EyeMode; mouth: MouthMode } | null = null;
  private blink = { next: 2, t: -1 };
  private action: { name: PetAction; t: number; dur: number; dir: number } | null = null;
  private look = { x: 0, y: 0, cx: 0, cy: 0 };
  private dragging = false;
  private dragVX = 0;
  private dragLean = 0;
  private sleeping = false;
  private sleepK = 0;
  private dragK = 0;
  private destroyed = false;
  private motion: number;

  constructor(canvas: HTMLCanvasElement, opts: PetEngineOptions) {
    this.opts = opts;
    this.motion = opts.reducedMotion ? 0.35 : 1;
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    const z = opts.zoom ?? 1;
    this.camera.position.set(0, 1.3, 5.8 / z);
    this.camera.lookAt(0, 1.1 - (z - 1) * 0.2, 0);

    const hemi = new THREE.HemisphereLight("#fff4ea", "#d9a27c", 1.35);
    const key = new THREE.DirectionalLight("#ffffff", 2.1);
    key.position.set(2.5, 4, 4);
    const rim = new THREE.DirectionalLight("#ffd2b4", 1.6);
    rim.position.set(-3, 2.5, -3);
    const fill = new THREE.DirectionalLight("#ffe7d8", 0.55);
    fill.position.set(-3.5, 1, 3);
    this.lights = { hemi, key, rim, fill };
    this.scene.add(hemi, key, rim, fill);
    this.applyTheme();
    this.build();
    this.resize(canvas.clientWidth || 140, canvas.clientHeight || 140);
  }

  private build() {
    if (this.rig) {
      this.scene.remove(this.rig.root, this.rig.shadow);
      disposeTree(this.rig.root);
      disposeTree(this.rig.shadow);
    }
    this.rig = buildRig(this.opts.species, this.opts.coat, this.opts.dark);
    this.rig.root.rotation.y = this.opts.yaw ?? 0.32;
    this.scene.add(this.rig.root, this.rig.shadow);
    this.applyFace(POSES[this.emotion].eyes, POSES[this.emotion].mouth);
  }

  private applyTheme() {
    const d = this.opts.dark;
    this.lights.hemi.color.set(d ? "#d7dcff" : "#fff4ea");
    this.lights.hemi.groundColor.set(d ? "#3b2b25" : "#d9a27c");
    this.lights.hemi.intensity = d ? 1.0 : 1.35;
    this.lights.key.intensity = d ? 1.8 : 2.1;
    this.lights.rim.color.set(d ? "#9db8ff" : "#ffd2b4");
    this.lights.rim.intensity = d ? 2.6 : 1.6;
    this.renderer.toneMappingExposure = d ? 1.12 : 1.05;
  }

  setPet(species: PetSpecies, coat: Coat) {
    if (species === this.opts.species && coat.id === this.opts.coat.id) return;
    this.opts = { ...this.opts, species, coat };
    this.build();
  }

  setTheme(dark: boolean) {
    if (dark === this.opts.dark) return;
    this.opts = { ...this.opts, dark };
    this.applyTheme();
    this.build();
  }

  setEmotion(e: Emotion) {
    if (e === this.emotion) return;
    this.emotion = e;
    const p = POSES[e];
    // swap facial features mid-blink so changes never "pop"
    this.pendingFace = { eyes: p.eyes, mouth: p.mouth };
    this.blink.t = 0;
  }

  play(action: PetAction, dir = 1) {
    if (this.motion < 1 && (action === "spin" || action === "tailChase")) action = "nod";
    this.action = { name: action, t: 0, dur: ACTION_DUR[action], dir };
  }

  /** x, y in -1..1 (relative to the pet), or null to look forward. */
  setLook(x: number | null, y = 0) {
    this.look.x = x == null ? 0 : clamp(x, -1, 1);
    this.look.y = x == null ? 0 : clamp(y, -1, 1);
  }

  setDragging(on: boolean, vx = 0) {
    this.dragging = on;
    this.dragVX = vx;
  }

  setSleeping(on: boolean) {
    this.sleeping = on;
  }

  resize(w: number, h: number) {
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  start() {
    const loop = (now: number) => {
      if (this.destroyed) return;
      this.raf = requestAnimationFrame(loop);
      if (document.hidden) {
        this.last = now;
        return;
      }
      const dt = Math.min(0.05, (now - (this.last || now)) / 1000);
      // When asleep, a lower frame rate is plenty and saves battery.
      if (this.sleeping && this.sleepK > 0.98 && now - this.last < 1000 / 24) return;
      this.last = now;
      this.tick(dt);
      this.renderer.render(this.scene, this.camera);
    };
    this.raf = requestAnimationFrame(loop);
  }

  renderStill() {
    this.tick(0.016);
    this.renderer.render(this.scene, this.camera);
  }

  private applyFace(eyes: EyeMode, mouth: MouthMode) {
    this.eyeMode = eyes;
    this.mouthMode = mouth;
    const r = this.rig;
    r.eyesOpen.forEach((o) => (o.visible = eyes === "open"));
    r.eyesHappy.forEach((o) => (o.visible = eyes === "happy"));
    r.eyesClosed.forEach((o) => (o.visible = eyes === "closed"));
    (Object.keys(r.mouth) as MouthMode[]).forEach((k) => (r.mouth[k].visible = k === mouth));
  }

  private tick(dt: number) {
    const r = this.rig;
    this.time += dt;
    const t = this.time;
    const M = this.motion;
    const target = POSES[this.emotion];
    const k = 1 - Math.exp(-dt * 5);
    (Object.keys(this.pose) as (keyof Pose)[]).forEach((key) => {
      this.pose[key] = lerp(this.pose[key], target[key], k);
    });
    const p = this.pose;
    this.sleepK = lerp(this.sleepK, this.sleeping ? 1 : 0, 1 - Math.exp(-dt * 2.5));
    this.dragK = lerp(this.dragK, this.dragging ? 1 : 0, 1 - Math.exp(-dt * 10));
    this.dragLean = lerp(this.dragLean, this.dragging ? clamp(-this.dragVX / 1400, -0.6, 0.6) : 0, 1 - Math.exp(-dt * 8));
    this.look.cx = lerp(this.look.cx, this.look.x, 1 - Math.exp(-dt * 6));
    this.look.cy = lerp(this.look.cy, this.look.y, 1 - Math.exp(-dt * 6));

    // Blink (also used to swap facial features)
    let blinkF = 1;
    if (this.blink.t >= 0) {
      this.blink.t += dt;
      const bt = this.blink.t / 0.16;
      blinkF = bt < 0.5 ? 1 - bt * 2 : Math.min(1, (bt - 0.5) * 2);
      if (bt >= 0.5 && this.pendingFace) {
        this.applyFace(this.pendingFace.eyes, this.pendingFace.mouth);
        this.pendingFace = null;
      }
      if (bt >= 1) {
        this.blink.t = -1;
        this.blink.next = 2 + Math.random() * 4.5;
      }
    } else {
      this.blink.next -= dt;
      if (this.blink.next <= 0) this.blink.t = 0;
    }

    // Sleeping forces closed eyes
    const wantEyes: EyeMode = this.sleepK > 0.5 ? "closed" : this.pendingFace?.eyes ?? POSES[this.emotion].eyes;
    if (this.sleepK > 0.5 && this.eyeMode !== "closed") this.applyFace("closed", "flat");
    else if (this.sleepK <= 0.5 && this.eyeMode === "closed" && !this.pendingFace) this.applyFace(wantEyes, POSES[this.emotion].mouth);

    // Action overrides
    let y = 0, spinY = 0, rollZ = 0, squash = 0, headPitch = 0, headYaw = 0, headTilt = 0, tailBoost = 0, pitchX = 0;
    const legs = [0, 0];
    const earExtra = [0, 0];
    let forceHappyEyes = false;
    const a = this.action;
    if (a) {
      a.t += dt;
      const q = clamp(a.t / a.dur, 0, 1);
      const s = Math.sin(Math.PI * q);
      switch (a.name) {
        case "jump":
          y = Math.max(0, Math.sin(Math.PI * clamp((q - 0.15) / 0.7, 0, 1))) * 0.42 * M;
          squash = q < 0.15 ? -0.14 * Math.sin((q / 0.15) * Math.PI) : q > 0.85 ? -0.1 * Math.sin(((q - 0.85) / 0.15) * Math.PI) : 0.05;
          legs[0] = legs[1] = -0.5 * s;
          break;
        case "hop":
          y = Math.abs(Math.sin(2 * Math.PI * q)) * 0.2 * M;
          squash = -0.05 * Math.cos(4 * Math.PI * q);
          earExtra[0] = earExtra[1] = 0.25 * Math.sin(4 * Math.PI * q);
          break;
        case "spin":
          spinY = 2 * Math.PI * ease(q) * a.dir;
          y = s * 0.12 * M;
          break;
        case "tailChase":
          spinY = 4 * Math.PI * ease(q) * a.dir;
          y = Math.abs(Math.sin(3 * Math.PI * q)) * 0.1 * M;
          tailBoost = 1;
          break;
        case "stretch":
          squash = -0.1 * s;
          headPitch = 0.28 * s;
          legs[0] = legs[1] = -0.75 * s;
          pitchX = 0.18 * s;
          break;
        case "groom":
          headPitch = 0.32 * s;
          headTilt = 0.38 * s;
          legs[1] = -1.9 * clamp(s * 1.4, 0, 1);
          headPitch += Math.sin(t * 11) * 0.05 * s;
          forceHappyEyes = q > 0.2 && q < 0.85;
          break;
        case "earTwitch":
          earExtra[0] = 0.55 * Math.sin(q * Math.PI * 3) * (1 - q);
          break;
        case "lookAround":
          headYaw = Math.sin(q * Math.PI * 2) * 0.85 * s;
          headPitch = -0.06 * s;
          break;
        case "wiggle":
          rollZ = Math.sin(q * Math.PI * 6) * 0.13 * (1 - q) * M;
          tailBoost = 1;
          forceHappyEyes = true;
          break;
        case "pounce":
          if (q < 0.45) {
            const c = Math.sin((q / 0.45) * Math.PI * 0.5);
            squash = -0.16 * c;
            headPitch = 0.2 * c;
            pitchX = 0.15 * c;
            tailBoost = 0.6;
          } else {
            const l = (q - 0.45) / 0.55;
            y = Math.sin(Math.PI * l) * 0.36 * M;
            pitchX = 0.15 * (1 - l) - 0.15 * Math.sin(Math.PI * l);
            legs[0] = legs[1] = -0.9 * Math.sin(Math.PI * l);
          }
          break;
        case "nod":
          headPitch = Math.sin(q * Math.PI * 4) * 0.16 * s;
          break;
        case "walk": {
          y = Math.abs(Math.sin(q * Math.PI * 6)) * 0.05 * M;
          legs[0] = Math.sin(q * Math.PI * 6) * 0.45 * s;
          legs[1] = -legs[0];
          spinY = a.dir * 0.6 * s;
          break;
        }
      }
      if (q >= 1) this.action = null;
    }

    const sk = this.sleepK;
    const dk = this.dragK;
    const breathe = Math.sin(t * (1.5 - sk * 0.6)) * (0.012 + sk * 0.012);
    const bounce = Math.abs(Math.sin(t * p.bounceFreq * Math.PI)) * p.bounceAmp * M * (1 - sk) * (1 - dk);

    // Root: jump/spin, dangling when dragged
    r.root.position.y = y + bounce + dk * (0.12 + Math.sin(t * 7) * 0.02);
    r.root.rotation.y = (this.opts.yaw ?? 0.32) * (1 - dk * 0.5) + spinY;
    r.root.rotation.z = rollZ + this.dragLean + Math.sin(t * 0.9) * p.sway * 0.3 * M * (1 - sk);
    r.root.rotation.x = pitchX;

    // Body: breathing, squash, slump/sleep
    const slump = Math.max(p.slump, sk * 0.9);
    r.body.scale.set(1 - squash * 0.5 + slump * 0.03, 1 + squash + breathe - slump * 0.14 + dk * 0.07, 1 + slump * 0.08);

    // Head: look-at + emotion pose + action + sleep
    const cur = this.look;
    const yawLook = cur.cx * 0.62 * (1 - sk) * (1 - dk * 0.5);
    const pitchLook = -cur.cy * 0.3 * (1 - sk);
    r.head.rotation.y = yawLook + headYaw - (this.opts.yaw ?? 0.32) * 0.55 * (1 - sk);
    r.head.rotation.x = pitchLook + p.pitch + headPitch + sk * 0.38 + dk * 0.08;
    r.head.rotation.z = p.tilt * (1 - sk) + headTilt + sk * 0.28 + Math.sin(t * 1.3) * p.sway * M;
    r.head.position.y = lerp(this.rig.species === "dog" ? 1.32 : this.rig.species === "rabbit" ? 1.28 : 1.3, 0.98, sk) - slump * 0.08;
    r.head.position.z = 0.1 + sk * 0.22;

    // Front legs: lift/dangle, stretch forward when asleep
    r.frontLegs.forEach((leg, i) => {
      const dangle = dk * (0.25 + Math.sin(t * 9 + i * 1.7) * 0.18);
      leg.rotation.x = legs[i] * M - sk * 1.25 + dangle;
      leg.rotation.z = (i === 0 ? 1 : -1) * dk * 0.15;
    });

    // Ears
    const flap = dk * Math.sin(t * 14) * 0.25;
    r.ears.forEach((ear, i) => {
      const side = i === 0 ? -1 : 1;
      const base = r.earBase[i];
      const e = lerp(p.ear, -0.6, sk);
      if (r.species === "dog") {
        ear.rotation.z = base.z + side * Math.max(0, e) * 0.45 + side * flap + side * earExtra[i];
        ear.rotation.x = -Math.max(0, -e) * 0.15;
      } else if (r.species === "rabbit") {
        ear.rotation.z = base.z - side * Math.max(0, -e) * 1.05 - side * earExtra[i] * 0.6 - flap * side;
        ear.rotation.x = base.x - Math.max(0, e) * 0.12 - Math.max(0, -e) * 0.35 + Math.sin(t * 2.1 + i) * 0.03;
      } else {
        ear.rotation.z = base.z - side * Math.max(0, -e) * 0.6 - side * earExtra[i] - flap * side * 0.5;
        ear.rotation.x = -Math.max(0, e) * 0.18 + Math.max(0, -e) * 0.35;
      }
    });

    // Eyes: openness and blink
    const open = (forceHappyEyes ? 0 : 1) * clamp(p.eyeOpen, 0.05, 1.5) * blinkF;
    r.eyesOpen.forEach((g) => {
      g.visible = this.eyeMode === "open" && !forceHappyEyes && sk <= 0.5;
      g.scale.set(1, Math.max(0.06, open), 1);
      // pupils drift toward the cursor a little
      g.position.x = (g.position.x > 0 ? 1 : -1) * (this.rig.species === "dog" ? 0.18 : 0.175) + cur.cx * 0.012;
    });
    r.eyesHappy.forEach((o) => (o.visible = (this.eyeMode === "happy" || forceHappyEyes) && sk <= 0.5));

    // Cheeks
    r.cheeks.opacity = clamp(p.blush, 0, 1) * 0.6;

    // Tail
    const ts = p.tailSpeed + tailBoost * 8 + dk * 6;
    const ta = (p.tailAmp + tailBoost * 0.3 + dk * 0.3) * M * (1 - sk * 0.85);
    r.tail.forEach((seg, i) => {
      const base = r.tailBase[i];
      if (r.species === "rabbit") {
        seg.rotation.z = Math.sin(t * ts) * 0.12 * ta;
        return;
      }
      seg.rotation.x = base * (1 - sk * 0.4) + (i === 0 ? sk * 0.6 : 0);
      seg.rotation.z = Math.sin(t * ts - i * 0.65) * ta * (0.35 + i * 0.12) + (i === 0 ? sk * 0.9 : 0);
    });

    // Shadow follows height
    const h = r.root.position.y;
    const sh = 1 - clamp(h / 0.7, 0, 0.6);
    r.shadow.scale.set(0.78 * sh + sk * 0.12, 0.62 * sh + sk * 0.06, 1);
    (r.shadow.material as THREE.MeshBasicMaterial).opacity = (this.opts.dark ? 0.9 : 0.6) * sh;
  }

  snapshot(): string {
    this.renderStill();
    return this.renderer.domElement.toDataURL("image/png");
  }

  dispose() {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    disposeTree(this.scene);
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}

/** Render a still portrait of each coat/species (used by the picker). */
export function renderPortraits(items: { key: string; species: PetSpecies; coat: Coat }[], dark: boolean, px = 220): Record<string, string> {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = px;
  const out: Record<string, string> = {};
  let engine: PetEngine | null = null;
  try {
    for (const it of items) {
      if (!engine) {
        engine = new PetEngine(canvas, { species: it.species, coat: it.coat, dark, yaw: 0.38, zoom: 1.3 });
        engine.resize(px, px);
      } else engine.setPet(it.species, it.coat);
      engine.setEmotion("happy");
      out[it.key] = engine.snapshot();
    }
  } finally {
    engine?.dispose();
  }
  return out;
}
