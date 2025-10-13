let gameStarted = false;
let gameOver = false;
let score = 0;
let stack = [];
let boxHeight = 1;
let speed = 0.15;
let camera;
let scene;
let renderer;
let currentLayer;
let animationFrameId;

init();

function init() {
  scene = new THREE.Scene();

  let width = window.innerWidth / window.innerHeight;
  camera = new THREE.OrthographicCamera(-width * 5, width * 5, 5, -5, 0.1, 100);
  camera.position.set(4, 4, 4);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("game").appendChild(renderer.domElement);

  addLayer(0, 0, 10, 10);
  addLayer(-10, 0, 10, 10, 'x');

  render();

  document.getElementById("start-button").addEventListener("click", startGame);
  window.addEventListener("mousedown", eventHandler);
  window.addEventListener("keydown", e => {
    if (e.key === " ") eventHandler();
  });
}

function addLayer(x, z, width, depth, direction) {
  let y = boxHeight * stack.length;
  let layer = generateBox(x, y, z, width, depth, direction);
  stack.push(layer);
}

function generateBox(x, y, z, width, depth, direction) {
  let geometry = new THREE.BoxGeometry(width, boxHeight, depth);
  let color = new THREE.Color(`hsl(${30 + stack.length * 4}, 80%, 60%)`);
  let material = new THREE.MeshLambertMaterial({ color });
  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  scene.add(mesh);
  return { threejs: mesh, width, depth, direction };
}

function startGame() {
  document.querySelector(".game-ready").classList.add("hidden");
  document.querySelector(".game-over").classList.add("hidden");
  document.getElementById("score").style.transform = "translateY(0)";
  gameStarted = true;
  gameOver = false;
  score = 0;
  stack = [];
  scene.clear();

  // Add light again after clear
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(10, 20, 10);
  scene.add(light);

  addLayer(0, 0, 10, 10);
  addLayer(-10, 0, 10, 10, 'x');

  render();
}

function eventHandler() {
  if (!gameStarted) return;
  if (gameOver) {
    startGame();
    return;
  }

  const topLayer = stack[stack.length - 1];
  const previousLayer = stack[stack.length - 2];

  const direction = topLayer.direction;
  const delta = topLayer.threejs.position[direction] - previousLayer.threejs.position[direction];
  const overlap = direction === "x"
    ? previousLayer.width - Math.abs(delta)
    : previousLayer.depth - Math.abs(delta);

  if (overlap > 0) {
    score++;
    document.getElementById("score").textContent = score;

    const newWidth = direction === "x" ? overlap : previousLayer.width;
    const newDepth = direction === "z" ? overlap : previousLayer.depth;

    const x = direction === "x"
      ? previousLayer.threejs.position.x + delta / 2
      : previousLayer.threejs.position.x;
    const z = direction === "z"
      ? previousLayer.threejs.position.z + delta / 2
      : previousLayer.threejs.position.z;

    topLayer.width = newWidth;
    topLayer.depth = newDepth;

    topLayer.threejs.scale[direction] = overlap / (direction === "x" ? previousLayer.width : previousLayer.depth);
    topLayer.threejs.position[direction] = x || z;

    const nextX = direction === "x" ? 0 : -10;
    const nextZ = direction === "z" ? 0 : -10;
    const nextDir = direction === "x" ? "z" : "x";
    addLayer(nextX, nextZ, newWidth, newDepth, nextDir);
  } else {
    endGame();
  }
}

function endGame() {
  gameOver = true;
  cancelAnimationFrame(animationFrameId);
  document.querySelector(".game-over").classList.remove("hidden");
}

function render() {
  const topLayer = stack[stack.length - 1];
  const previousLayer = stack[stack.length - 2];

  if (topLayer && !gameOver) {
    topLayer.threejs.position[topLayer.direction] += speed;
    if (topLayer.threejs.position[topLayer.direction] > 10 || topLayer.threejs.position[topLayer.direction] < -10) {
      speed = -speed;
    }
  }

  renderer.render(scene, camera);
  animationFrameId = requestAnimationFrame(render);
}

window.addEventListener("resize", () => {
  let width = window.innerWidth / window.innerHeight;
  camera.left = -width * 5;
  camera.right = width * 5;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
