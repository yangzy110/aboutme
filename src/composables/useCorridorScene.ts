import { ref } from "vue";
import * as THREE from "three";
import type { Painting, CorridorConfig } from "@/types/corridor";

/**
 * Three.js 走廊场景组合式函数
 */
export function useCorridorScene(
  config: CorridorConfig,
  paintingsData: Painting[],
) {
  const canvasRef = ref<HTMLCanvasElement>();
  const step = ref(0);
  const canAdvance = ref(true);
  const isAnimating = ref(false);

  let renderer: THREE.WebGLRenderer | null = null;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let animId = 0;
  let arrowMesh: THREE.Sprite;
  let targetCamZ = 0;
  let currentCamZ = 0;
  let time = 0;

  const {
    width: CORRIDOR_WIDTH,
    height: CORRIDOR_HEIGHT,
    length: CORRIDOR_LENGTH,
    segmentMove: SEGMENT_MOVE,
    maxStep,
  } = config;

  function createTextTexture(text: string, size = 256): THREE.CanvasTexture {
    const cvs = document.createElement("canvas");
    cvs.width = size;
    cvs.height = size;
    const ctx = cvs.getContext("2d")!;

    // 木质相框背景
    ctx.fillStyle = "#f5e6d0";
    ctx.fillRect(0, 0, size, size);

    // 内部暖色渐变
    const grad = ctx.createRadialGradient(
      size / 2,
      size / 2,
      10,
      size / 2,
      size / 2,
      size / 2,
    );
    grad.addColorStop(0, "rgba(255,245,230,0.9)");
    grad.addColorStop(1, "rgba(230,210,180,0.95)");
    ctx.fillStyle = grad;
    ctx.fillRect(8, 8, size - 16, size - 16);

    // 木质相框边
    ctx.strokeStyle = "rgba(140,100,60,0.85)";
    ctx.lineWidth = 7;
    ctx.strokeRect(4, 4, size - 8, size - 8);
    ctx.strokeStyle = "rgba(180,140,90,0.5)";
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, size - 24, size - 24);

    // 内侧金色细线
    ctx.strokeStyle = "rgba(210,180,120,0.4)";
    ctx.lineWidth = 1;
    ctx.strokeRect(16, 16, size - 32, size - 32);

    // emoji
    ctx.font = `${size * 0.45}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, size / 2, size / 2);

    const tex = new THREE.CanvasTexture(cvs);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  function createArrowTexture(): THREE.CanvasTexture {
    const size = 128;
    const cvs = document.createElement("canvas");
    cvs.width = size;
    cvs.height = size;
    const ctx = cvs.getContext("2d")!;

    ctx.clearRect(0, 0, size, size);
    ctx.shadowColor = "rgba(210,160,80,0.9)";
    ctx.shadowBlur = 20;
    ctx.fillStyle = "rgba(240,200,120,0.95)";

    ctx.beginPath();
    ctx.moveTo(size / 2, 15);
    ctx.lineTo(size - 20, size / 2);
    ctx.lineTo(size / 2 + 10, size / 2 - 5);
    ctx.lineTo(size / 2 + 10, size - 20);
    ctx.lineTo(size / 2 - 10, size - 20);
    ctx.lineTo(size / 2 - 10, size / 2 - 5);
    ctx.lineTo(20, size / 2);
    ctx.closePath();
    ctx.fill();

    const tex = new THREE.CanvasTexture(cvs);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  function init() {
    if (!canvasRef.value) return;

    const hw = CORRIDOR_WIDTH / 2;
    const hh = CORRIDOR_HEIGHT;

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xf5e6d0, 2, 24);

    camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.1,
      50,
    );
    camera.position.set(0, 1.2, 0);
    camera.lookAt(0, 1.2, -10);
    currentCamZ = 0;
    targetCamZ = 0;

    renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.value,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xf5e6d0);

    // 光源
    scene.add(new THREE.AmbientLight(0xffe8c8, 0.8));
    const sunLight = new THREE.DirectionalLight(0xffd59e, 0.6);
    sunLight.position.set(2, 4, -3);
    scene.add(sunLight);

    const pointLight = new THREE.PointLight(0xffcb8e, 1.2, 20);
    pointLight.position.set(0, 2.8, -2);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0xffc080, 0.8, 20);
    pointLight2.position.set(0, 2.8, -10);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xffb870, 0.5, 20);
    pointLight3.position.set(0, 2.8, -16);
    scene.add(pointLight3);

    // 地板
    const floorGeo = new THREE.PlaneGeometry(CORRIDOR_WIDTH, CORRIDOR_LENGTH);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xc8a882,
      roughness: 0.75,
      metalness: 0.05,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, -CORRIDOR_LENGTH / 2);
    scene.add(floor);

    // 天花板
    const ceilGeo = new THREE.PlaneGeometry(CORRIDOR_WIDTH, CORRIDOR_LENGTH);
    const ceilMat = new THREE.MeshStandardMaterial({
      color: 0xf0e0cc,
      roughness: 0.9,
    });
    const ceil = new THREE.Mesh(ceilGeo, ceilMat);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(0, hh, -CORRIDOR_LENGTH / 2);
    scene.add(ceil);

    // 墙壁
    const wallGeo = new THREE.PlaneGeometry(CORRIDOR_LENGTH, hh);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xe8d5b8,
      roughness: 0.85,
    });

    const leftWall = new THREE.Mesh(wallGeo, wallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-hw, hh / 2, -CORRIDOR_LENGTH / 2);
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(wallGeo, wallMat.clone());
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(hw, hh / 2, -CORRIDOR_LENGTH / 2);
    scene.add(rightWall);

    // 尽头墙
    const backGeo = new THREE.PlaneGeometry(CORRIDOR_WIDTH, hh);
    const backMat = new THREE.MeshStandardMaterial({
      color: 0xd4be9a,
      roughness: 0.9,
    });
    const backWall = new THREE.Mesh(backGeo, backMat);
    backWall.position.set(0, hh / 2, -CORRIDOR_LENGTH);
    scene.add(backWall);

    // 装饰线
    const stripGeo = new THREE.BoxGeometry(0.05, 0.05, CORRIDOR_LENGTH);
    const stripMat = new THREE.MeshBasicMaterial({
      color: 0xd4a050,
      transparent: true,
      opacity: 0.35,
    });
    const stripL = new THREE.Mesh(stripGeo, stripMat);
    stripL.position.set(-hw + 0.03, hh - 0.03, -CORRIDOR_LENGTH / 2);
    scene.add(stripL);
    const stripR = new THREE.Mesh(stripGeo, stripMat.clone());
    stripR.position.set(hw - 0.03, hh - 0.03, -CORRIDOR_LENGTH / 2);
    scene.add(stripR);

    // 画作
    for (const p of paintingsData) {
      const tex = createTextTexture(p.emoji);
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
      const geo = new THREE.PlaneGeometry(1.2, 1.2);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(p.x, p.y, p.z);
      mesh.rotation.y = p.side === "left" ? Math.PI / 2 : -Math.PI / 2;
      scene.add(mesh);
    }

    // 箭头精灵
    const arrowTex = createArrowTexture();
    const arrowMat = new THREE.SpriteMaterial({
      map: arrowTex,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    arrowMesh = new THREE.Sprite(arrowMat);
    arrowMesh.scale.set(1.2, 1.2, 1);
    arrowMesh.position.set(0, 1.5, -CORRIDOR_LENGTH + 1);
    scene.add(arrowMesh);

    tick();
  }

  function tick() {
    animId = requestAnimationFrame(tick);
    if (!renderer) return;

    time += 0.016;

    // 平滑移动
    currentCamZ += (targetCamZ - currentCamZ) * 0.04;
    camera.position.z = currentCamZ;
    camera.lookAt(0, 1.2, currentCamZ - 10);

    // 箭头动画
    const show = step.value < maxStep;
    if (arrowMesh) {
      arrowMesh.visible = show;
      if (show) {
        (arrowMesh.material as THREE.SpriteMaterial).opacity =
          0.5 + Math.sin(time * 2.5) * 0.3;
        arrowMesh.position.z =
          -CORRIDOR_LENGTH + 1 + Math.sin(time * 1.5) * 0.15;
      }
    }

    renderer.render(scene, camera);
  }

  function advance() {
    if (step.value >= maxStep || isAnimating.value) return;
    isAnimating.value = true;
    step.value++;
    targetCamZ -= SEGMENT_MOVE;

    const check = () => {
      if (Math.abs(currentCamZ - targetCamZ) < 0.1) {
        isAnimating.value = false;
        canAdvance.value = step.value < maxStep;
      } else {
        requestAnimationFrame(check);
      }
    };
    requestAnimationFrame(check);
  }

  function retreat() {
    if (step.value <= 0 || isAnimating.value) return;
    isAnimating.value = true;
    step.value--;
    targetCamZ += SEGMENT_MOVE;
    canAdvance.value = true;

    const check = () => {
      if (Math.abs(currentCamZ - targetCamZ) < 0.1) {
        isAnimating.value = false;
      } else {
        requestAnimationFrame(check);
      }
    };
    requestAnimationFrame(check);
  }

  function onResize() {
    if (!renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function cleanup() {
    cancelAnimationFrame(animId);
    window.removeEventListener("resize", onResize);
    renderer?.dispose();
    renderer?.forceContextLoss();
    renderer = null;
  }

  function setup() {
    init();
    window.addEventListener("resize", onResize);
  }

  return {
    canvasRef,
    step,
    canAdvance,
    maxStep,
    advance,
    retreat,
    setup,
    cleanup,
  };
}
