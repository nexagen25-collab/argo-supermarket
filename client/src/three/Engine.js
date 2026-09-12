import * as THREE from 'three';

const STORE = {
  width: 60,   // x
  depth: 44,   // z
  height: 6.5
};

const AISLE_SPACING = 5.4;

const COLLIDERS = [];

export class StoreEngine {
  constructor({ canvas, minimap, products, onGrab, onOpenCart }) {
    this.canvas = canvas;
    this.minimap = minimap;
    this.onGrab = onGrab;
    this.onOpenCart = onOpenCart;
    this.products = products;

    this.keydown = new Set();
    this.vel = new THREE.Vector3();
    this.targets = {}; // product id -> mesh
    this.yaw = 0;
    this.pitch = 0;
    this.hoverMesh = null;
    this.raycaster = new THREE.Raycaster();

    this._buildRenderer();
    this._buildScene();
    this._buildStore();
    this._buildLights();
    this._buildAisles();
    this._buildSpores();
    this._buildLiving();
    this._bindEvents();

    this._clock = new THREE.Clock();
    this._raf = null;
    this._loop = this._loop.bind(this);
    this._raf = requestAnimationFrame(this._loop);

    window.addEventListener('resize', this._onResize);
  }

  /* ---------------- setup ---------------- */

  _buildRenderer() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
  }

  _buildScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a1f14);
    this.scene.fog = new THREE.Fog(0x0a1f14, 15, 100);
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 200);
    this.camera.position.set(STORE.width * 0.5, 2.2, STORE.depth * 0.9);
    this.yaw = Math.PI; // face into the store

    this.sky = new THREE.Mesh(
      new THREE.PlaneGeometry(STORE.width * 2, STORE.depth * 2),
      new THREE.MeshBasicMaterial({ color: 0x1d6b3f, fog: false })
    );
    this.sky.position.set(STORE.width / 2, STORE.height * 4.2, STORE.depth / 2);
    this.sky.rotation.x = Math.PI / 2;
    this.scene.add(this.sky);
  }

  _buildStore() {
    const matWall = new THREE.MeshStandardMaterial({ color: 0x1f3d2a, roughness: 0.9 });
    const matCeil = new THREE.MeshStandardMaterial({ color: 0x123022, roughness: 0.95 });
    const matFloor = new THREE.MeshStandardMaterial({
      color: 0x2f5d36,
      roughness: 0.9,
      metalness: 0.02
    });

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(STORE.width, STORE.depth), matFloor);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(STORE.width / 2, 0, STORE.depth / 2);
    floor.receiveShadow = true;
    this.scene.add(floor);

    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(STORE.width, STORE.depth), matCeil);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(STORE.width / 2, STORE.height, STORE.depth / 2);
    this.scene.add(ceil);

    const wallGeo = new THREE.BoxGeometry(1, STORE.height, 1);

    const north = new THREE.Mesh(wallGeo, matWall);
    north.scale.set(STORE.width, 1, 0.6);
    north.position.set(STORE.width / 2, STORE.height / 2, -0.3);
    this.scene.add(north);

    const south = north.clone();
    south.position.set(STORE.width / 2, STORE.height / 2, STORE.depth + 0.3);
    this.scene.add(south);

    const west = new THREE.Mesh(wallGeo, matWall);
    west.scale.set(0.6, 1, STORE.depth);
    west.position.set(-0.3, STORE.height / 2, STORE.depth / 2);
    this.scene.add(west);

    const east = west.clone();
    east.position.set(STORE.width + 0.3, STORE.height / 2, STORE.depth / 2);
    this.scene.add(east);

    // Aisle "parking" lines on the floor
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x7fae79 });
    for (let a = 1; a <= 8; a++) {
      const z = zOfAisle(a);
      const lane = new THREE.Mesh(new THREE.PlaneGeometry(STORE.width - 2, 0.14), lineMat);
      lane.rotation.x = -Math.PI / 2;
      lane.position.set(STORE.width / 2, 0.02, z);
      this.scene.add(lane);
    }

    // checkout counter near the front (south)
    const counter = new THREE.Mesh(new THREE.BoxGeometry(14, 1.1, 2.2), new THREE.MeshStandardMaterial({ color: 0x31523a, roughness: 0.8 }));
    counter.position.set(STORE.width / 2, 0.55, STORE.depth - 3.2);
    this.scene.add(counter);
    const register = new THREE.Mesh(new THREE.BoxGeometry(2, 0.7, 1.4), new THREE.MeshStandardMaterial({ color: 0x4e7d4e, roughness: 0.5 }));
    register.position.set(STORE.width / 2 - 2.5, 1.35, STORE.depth - 3.2);
    this.scene.add(register);

    COLLIDERS.push({ x: [0, STORE.width], z: [-0.6, 0.05] });
    COLLIDERS.push({ x: [0, STORE.width], z: [STORE.depth - 0.05, STORE.depth + 0.6] });
    COLLIDERS.push({ x: [-0.6, 0.05], z: [0, STORE.depth] });
    COLLIDERS.push({ x: [STORE.width - 0.05, STORE.width + 0.6], z: [0, STORE.depth] });
  }

  _buildLights() {
    const hemi = new THREE.HemisphereLight(0x8ff0b8, 0x14341f, 1.35);
    this.scene.add(hemi);

    const canopy = new THREE.PointLight(0x74e887, 15, 30);
    canopy.position.set(STORE.width / 2, 5, STORE.depth / 2);
    this.scene.add(canopy);

    const warm = new THREE.PointLight(0xffe0a3, 22, 32);
    warm.position.set(STORE.width / 2, 5.2, STORE.depth - 3.5);
    this.scene.add(warm);

    // luminous canopy strips down the aisles
    const stripMat = new THREE.MeshBasicMaterial({ color: 0xdfffe8 });
    for (let a = 1; a <= 8; a += 2) {
      const z = zOfAisle(a);
      const strip = new THREE.Mesh(new THREE.PlaneGeometry(STORE.width - 6, 0.5), stripMat);
      strip.position.set(STORE.width / 2, STORE.height - 0.12, z);
      this.scene.add(strip);
      const light = new THREE.PointLight(0xd9f7e2, 22, 26);
      light.position.set(STORE.width / 2, STORE.height - 0.8, z);
      this.scene.add(light);
    }
  }

  _buildAisles() {
    this.aisleMeshes = [];
    this.productMeshes = [];

    // group products by aisle then shelf
    const byAisle = new Map();
    for (const p of this.products) {
      if (!byAisle.has(p.aisle)) byAisle.set(p.aisle, []);
      byAisle.get(p.aisle).push(p);
    }

    for (let a = 1; a <= 8; a++) {
      const z = zOfAisle(a);
      // two shelving runs on either side of the lane
      for (const side of [-1, 1]) {
        const shelfZ = z + side * 1.5;
        const run = this._buildShelfRun(a, shelfZ, byAisle.get(a) || []);
        this.aisleMeshes.push(run);
        COLLIDERS.push({ x: [0, STORE.width], z: [shelfZ - 1.0, shelfZ + 1.0] });
      }
    }

    // entrance banner
    const banner = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 3),
      new THREE.MeshStandardMaterial({ color: 0x58b368, emissive: 0x0f7a3c, emissiveIntensity: 0.35 })
    );
    banner.position.set(STORE.width / 2, 4.4, STORE.depth + 0.05);
    banner.rotation.y = Math.PI;
    this.banner = banner;
    this.scene.add(banner);
  }

  _buildShelfRun(aisleNum, z, products) {
    const group = new THREE.Group();
    const shelfMeta = {
      frame: new THREE.MeshStandardMaterial({ color: 0xa8b9a2, roughness: 0.75, metalness: 0.08 }),
      board: new THREE.MeshStandardMaterial({ color: 0xcfe0c8, roughness: 0.7 })
    };

    const LEN = 6.4;
    const SHELF_H = 0.65;
    const SHELF_W = 1.7;
    const SHELVES = 3;

    // end frames
    for (const x of [2.2, STORE.width - 2.2]) {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.25, STORE.height - 1.2, SHELF_W), shelfMeta.frame);
      frame.position.set(x, (STORE.height - 1.2) / 2, z);
      group.add(frame);
    }

    // shelf boards + product slots
    for (let s = 0; s < SHELVES; s++) {
      const y = 0.75 + s * SHELF_H;
      const board = new THREE.Mesh(new THREE.BoxGeometry(LEN, 0.12, SHELF_W), shelfMeta.board);
      board.position.set(STORE.width / 2, y, z);
      group.add(board);

      // back panel
      const back = new THREE.Mesh(new THREE.BoxGeometry(LEN, SHELF_H, 0.1), shelfMeta.board);
      back.position.set(STORE.width / 2, y + SHELF_H / 2 - 0.06, z - (SHELF_W / 2 - 0.05));
      group.add(back);
    }

    // products from this aisle sit on shelf levels
    const slots = products.slice(0, 6);
    const perShelf = 2;
    const levelY = [0.75 + 0.18, 0.75 + SHELF_H * 1 + 0.18, 0.75 + SHELF_H * 2 + 0.18];
    slots.forEach((p, idx) => {
      const shelfI = Math.floor(idx / perShelf);
      const posI = idx % perShelf;
      const y = levelY[shelfI] || levelY[2];
      const x = STORE.width / 2 - 2.4 + posI * 4.8;
      const mesh = this._buildProduct(p, x, y, z);
      group.add(mesh);
      this.targets[p.id] = mesh;
      this.productMeshes.push(mesh);
    });

    group.position.y = 0;
    this.scene.add(group);
    return group;
  }

  _buildProduct(p, x, y, z) {
    const g = new THREE.Group();
    const color = new THREE.Color(p.color || '#E8DCC8');

    const box = new THREE.Mesh(
      new THREE.BoxGeometry(0.82, 0.58, 0.44),
      new THREE.MeshStandardMaterial({ color: new THREE.Color(p.color || '#E8DCC8'), roughness: 0.5 })
    );
    box.position.y = 0.29;
    g.add(box);

    // emoji face — canvas texture
    const label = this._makeLabel(p.emoji, p.name, p.price);
    const labelMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.62, 0.34),
      new THREE.MeshBasicMaterial({ map: label, transparent: true, depthWrite: false })
    );
    labelMesh.position.set(0, 0.3, 0.225);
    g.add(labelMesh);

    g.position.set(x, y, z);

    const collider = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.9, 0.9),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    collider.position.y = 0.35;
    collider.userData = { product: p, hit: true };
    g.add(collider);

    return g;
  }

  _makeLabel(emoji, name, price) {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 128;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 256, 128);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '64px serif';
    ctx.fillText(emoji, 128, 46);
    ctx.font = '700 22px system-ui, sans-serif';
    ctx.fillStyle = '#0d1117';
    ctx.fillText(`₹${Number(price).toLocaleString('en-IN')}`, 128, 88);
    ctx.font = '600 16px system-ui, sans-serif';
    ctx.fillText(name.slice(0, 14), 128, 108);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }

  _makeGlowTexture() {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.6)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(c);
    return tex;
  }

  _buildSpores() {
    const count = 380;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    this.sporeSeeds = new Float32Array(count);
    this.sporeSpeeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = Math.random() * STORE.width;
      pos[i * 3 + 1] = Math.random() * (STORE.height + 2);
      pos[i * 3 + 2] = Math.random() * STORE.depth;
      this.sporeSeeds[i] = Math.random() * Math.PI * 2;
      this.sporeSpeeds[i] = 0.25 + Math.random() * 0.5;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      map: this._makeGlowTexture(),
      color: 0x9fe8a8,
      size: 0.45,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    this.spores = new THREE.Points(geo, mat);
    this.sporeMat = mat;
    this.scene.add(this.spores);
  }

  _buildLiving() {
    this.living = [];

    const tuft = (x, z, s, hue) => {
      const g = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({ color: hue, roughness: 0.85, side: THREE.DoubleSide });
      for (let i = 0; i < 3; i++) {
        const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.55 * s, 1.15 * s), mat);
        leaf.rotation.y = (i / 3) * Math.PI;
        leaf.rotation.z = (Math.random() - 0.5) * 0.25;
        leaf.position.y = 0.45 * s;
        g.add(leaf);
      }
      g.position.set(x, 0, z);
      this.scene.add(g);
      this.living.push({ mesh: g, seed: Math.random() * Math.PI * 2, speed: 1.2 + Math.random() * 0.9, axis: 'z', amp: 0.06 });
    };

    // undergrowth along the north wall, corners, and side walls
    for (let x = 1.5; x < STORE.width; x += 5) tuft(x, -0.1, 1, 0x2e7d32);
    tuft(1.2, STORE.depth - 1.5, 1.2, 0x388e3c);
    tuft(STORE.width - 1.2, STORE.depth - 1.5, 1.2, 0x43a047);
    for (let z = 6; z < STORE.depth; z += 8) tuft(-0.1, z, 1, 0x2e7d32);
    for (let z = 6; z < STORE.depth; z += 8) tuft(STORE.width + 0.1, z, 1, 0x2e7d32);

    const vine = (x, z) => {
      const g = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({ color: 0x1b5e20, roughness: 0.8 });
      for (let i = 0; i < 5; i++) {
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 5), mat);
        leaf.position.set(Math.sin(i * 1.7) * 0.06, -(0.12 + i * 0.22), Math.cos(i * 1.3) * 0.06);
        g.add(leaf);
      }
      g.position.set(x, STORE.height - 0.3, z);
      this.scene.add(g);
      this.living.push({ mesh: g, seed: Math.random() * Math.PI * 2, speed: 0.9 + Math.random() * 0.6, axis: 'x', amp: 0.045 });
    };
    for (let x = 1.5; x < STORE.width; x += 6.5) vine(x, 1.6);
    vine(STORE.width - 3, STORE.depth - 2.2);

    // glowing canopy orbs
    const orbCols = [0x58e07f, 0xe8f7a0, 0x7ce8a0, 0xb6f0c8, 0x9ae86a, 0x6fe89c];
    this.canopyOrbs = [];
    for (let i = 0; i < 6; i++) {
      const col = orbCols[i % orbCols.length];
      const m = new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.5, roughness: 0.4 });
      const o = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), m);
      o.position.set(((i + 1) * STORE.width) / 7, STORE.height - 0.55, 3 + (i % 3) * 9);
      this.scene.add(o);
      this.canopyOrbs.push(o);
    }
  }

  /* ---------------- input ---------------- */

  _bindEvents() {
    this._onKeyDown = (e) => { this.keydown.add(e.key.toLowerCase()); if (e.key.toLowerCase() === 'e') this.onGrabToggleCart(); };
    this._onKeyUp = (e) => this.keydown.delete(e.key.toLowerCase());
    this._onMouseMove = (e) => {
      if (this.dragging) {
        this.yaw -= e.movementX * 0.003;
        this.pitch -= e.movementY * 0.003;
        this.pitch = Math.max(-1.3, Math.min(1.3, this.pitch));
      } else {
        this._hover(e);
      }
    };
    this._onMouseDown = (e) => { this.dragging = true; this.canvas.style.cursor = 'grabbing'; };
    this._onMouseUp = (e) => { this.dragging = false; this.canvas.style.cursor = 'grab'; this._tryGrab(e); };
    this._onTouchStart = (e) => { this.dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY }; this.dragging = true; };
    this._onTouchMove = (e) => {
      if (!this.dragStart) return;
      const dx = e.touches[0].clientX - this.dragStart.x;
      const dy = e.touches[0].clientY - this.dragStart.y;
      this.dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      this.yaw -= dx * 0.005;
      this.pitch -= dy * 0.005;
      this.pitch = Math.max(-1.3, Math.min(1.3, this.pitch));
    };
    this._onTouchEnd = (e) => {
      this.dragging = false;
      if (e.changedTouches[0]) this._tryGrabCoord(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      this.dragStart = null;
    };
    this._onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    };

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    this.canvas.addEventListener('mousemove', this._onMouseMove);
    this.canvas.addEventListener('mousedown', this._onMouseDown);
    window.addEventListener('mouseup', this._onMouseUp);
    this.canvas.addEventListener('touchstart', this._onTouchStart, { passive: true });
    this.canvas.addEventListener('touchmove', this._onTouchMove, { passive: true });
    this.canvas.addEventListener('touchend', this._onTouchEnd);
  }

  onGrabToggleCart() {
    if (this.onOpenCart) this.onOpenCart();
  }

  _hover(e) {
    this.raycaster.setFromCamera(this._ndc(e.clientX, e.clientY), this.camera);
    const hit = this.raycaster.intersectObjects(this.productMeshes, true).find((h) => h.object.userData.hit);
    if (hit) {
      this.canvas.style.cursor = 'pointer';
      this.hoverMesh = hit.object.parent;
      this.hoverMesh?.children.forEach((c) => { if (c.material && c.material.emissive) c.material.emissive.setHex(0x222222); });
    } else {
      if (this.hoverMesh) {
        this.hoverMesh.children.forEach((c) => { if (c.material && c.material.emissive) c.material.emissive.setHex(0x000000); });
        this.hoverMesh = null;
      }
      this.canvas.style.cursor = 'grab';
    }
  }

  _tryGrab(e) {
    this._tryGrabCoord(e.clientX, e.clientY);
  }

  _tryGrabCoord(x, y) {
    this.raycaster.setFromCamera(this._ndc(x, y), this.camera);
    const hit = this.raycaster.intersectObjects(this.productMeshes, true).find((h) => h.object.userData.hit);
    if (hit && hit.object.userData.product) {
      const p = hit.object.userData.product;
      this.onGrab(p);
    }
  }

  _ndc(x, y) {
    return new THREE.Vector2((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1);
  }

  /* ---------------- movement ---------------- */

  _move(dt) {
    const speed = 7.5;
    const moved = new THREE.Vector3();
    const ortho = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    const look = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw));

    if (this.keydown.has('w')) moved.add(look);
    if (this.keydown.has('s')) moved.sub(look);
    if (this.keydown.has('d')) moved.add(ortho);
    if (this.keydown.has('a')) moved.sub(ortho);

    if (moved.lengthSq() > 0) {
      moved.normalize().multiplyScalar(speed * dt);
      this._applyMove(moved);
    } else {
      this.vel.lerp(new THREE.Vector3(), 0.2);
    }
  }

  _applyMove(move) {
    const next = this.camera.position.clone().add(move);
    next.y = 2.2;
    const r = 0.85;
    if (this._collides(next, r)) return;
    this.camera.position.copy(next);
  }

  _collides(p, r) {
    for (const box of COLLIDERS) {
      const [x0, x1] = box.x;
      const [z0, z1] = box.z;
      if (p.x + r > x0 && p.x - r < x1 && p.z + r > z0 && p.z - r < z1) return true;
    }
    if (p.x < r || p.x > STORE.width - r || p.z < r || p.z > STORE.depth - r) return true;
    return false;
  }

  /* ---------------- loop / minimap ---------------- */

  _loop() {
    const dt = Math.min(this._clock.getDelta(), 0.05);
    this._move(dt);

    // always face the store on entry — camera yaw controls
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;

    const time = this._clock.elapsedTime;

    // living spores drift upward and sway
    if (this.spores) {
      const pos = this.spores.geometry.attributes.position;
      const arr = pos.array;
      for (let i = 0; i < pos.count; i++) {
        arr[i * 3 + 1] += this.sporeSpeeds[i] * dt;
        arr[i * 3] += Math.sin(time * 0.4 + this.sporeSeeds[i]) * dt * 0.12;
        arr[i * 3 + 2] += Math.cos(time * 0.35 + this.sporeSeeds[i]) * dt * 0.12;
        if (arr[i * 3 + 1] > 9) {
          arr[i * 3 + 1] = 0.05;
          arr[i * 3] = Math.random() * STORE.width;
          arr[i * 3 + 2] = Math.random() * STORE.depth;
        }
      }
      pos.needsUpdate = true;
      this.sporeMat.opacity = 0.7 + Math.sin(time * 0.8) * 0.15;
    }

    // undergrowth and vines sway
    if (this.living) {
      for (const l of this.living) {
        l.mesh.rotation[l.axis] = Math.sin(time * l.speed + l.seed) * l.amp;
      }
    }

    // canopy orbs pulse
    if (this.canopyOrbs) {
      for (let i = 0; i < this.canopyOrbs.length; i++) {
        this.canopyOrbs[i].material.emissiveIntensity = 0.45 + 0.35 * (0.5 + 0.5 * Math.sin(time * 1.1 + i));
      }
    }

    // banner breathes
    if (this.banner) {
      this.banner.material.emissiveIntensity = 0.35 + 0.15 * Math.sin(time * 1.2);
    }

    // gentle living-world camera drift
    this.camera.position.y = 2.2 + Math.sin(time * 1.5) * 0.02;

    this.renderer.render(this.scene, this.camera);
    this._drawMinimap();
    this._raf = requestAnimationFrame(this._loop);
  }

  _drawMinimap() {
    if (!this.minimap) return;
    const ctx = this.minimap.getContext('2d');
    const w = this.minimap.width || 120;
    const h = this.minimap.height || 100;
    ctx.clearRect(0, 0, w, h);
    const sx = w / STORE.width;
    const sz = h / STORE.depth;
    ctx.fillStyle = 'rgba(12,30,20,0.72)';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(126,236,156,0.6)';
    ctx.strokeRect(0, 0, w, h);
    for (let a = 1; a <= 8; a++) {
      const z = zOfAisle(a) * sz;
      ctx.fillStyle = 'rgba(126,236,156,0.55)';
      ctx.fillRect(0, z - 1, w, 2);
    }
    const px = this.camera.position.x * sx;
    const pz = this.camera.position.z * sz;
    ctx.fillStyle = '#ffd28a';
    ctx.beginPath();
    ctx.arc(px, pz, 3.4, 0, Math.PI * 2);
    ctx.fill();
  }

  dispose() {
    cancelAnimationFrame(this._raf);
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    this.canvas.removeEventListener('mousemove', this._onMouseMove);
    this.canvas.removeEventListener('mousedown', this._onMouseDown);
    window.removeEventListener('mouseup', this._onMouseUp);
    this.canvas.removeEventListener('touchstart', this._onTouchStart);
    this.canvas.removeEventListener('touchmove', this._onTouchMove);
    this.canvas.removeEventListener('touchend', this._onTouchEnd);
    this.renderer.dispose();
  }
}

function zOfAisle(n) {
  // aisles spread from back (small z) to front, leaving room for checkout
  return 4.5 + n * AISLE_SPACING;
}