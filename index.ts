import { 
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  ACESFilmicToneMapping,
  sRGBEncoding,
  /* PMREMGenerator,
  UnsignedByteType, */
  TOUCH,
  Texture,
  EquirectangularReflectionMapping,
} from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Canvas
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
const canvas: any = document.querySelector('canvas.webgl');

//let envMap: Texture; 
let camera: PerspectiveCamera; 
let controls: OrbitControls; 
let renderer: WebGLRenderer;
let layerIndex = 0;

// Scene
const scene = new Scene();

const path = ['Model/lambo/scene2.glb',
  'Model/ferrari/scene2.glb',
  'Model/nissan2/scene2.glb',
  'Model/porsche2/scene2.glb',
  'Model/nissan1/scene2.glb',
];

/**
  * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const init = () => {
  /**
   * Camera
   */
  camera = new PerspectiveCamera(
    90,
    sizes.width / sizes.height,
    0.1,
    100,
  );

  camera.position.set(0, 0, 20);

  camera.layers.set(layerIndex);

  scene.add(camera);

  /**
   * Renderer
   */
  renderer = new WebGLRenderer({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    canvas,
    antialias: true,
  });
  renderer.setSize(sizes.width, sizes.height);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.outputEncoding = sRGBEncoding;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  /* const pmremGenerator = new PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader(); */

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  new RGBELoader()
    .load('textures/autoshop_01_2k.hdr', (texture: Texture) => {
      texture.mapping = EquirectangularReflectionMapping;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      //envMap = pmremGenerator.fromEquirectangular(texture).texture;

      /* scene.background = envMap;
      scene.environment = envMap; */
      scene.background = texture;
      scene.environment = texture;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      //texture.dispose();
      //pmremGenerator.dispose();

      // model
      const loader = new GLTFLoader();

      const loadModel = (url: string, layer: number) => loader
        .loadAsync(url)
        .then((gltf) => {
          gltf.scene.scale.set(5, 5, 5);
          gltf.scene.traverse((object) => {
            object.layers.set(layer);
          });

          scene.add(gltf.scene);
        });

      loadModel(path[0], 0)
        .then(() => $('.loader-wrapper').fadeOut('slow'))
        .then(() => loadModel(path[1], 1))
        .then(() => loadModel(path[2], 2))
        .then(() => loadModel(path[3], 3))
        .then(() => loadModel(path[4], 4))
        // eslint-disable-next-line no-console
        .catch((error) => console.log(error));
    });

  // Controls
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.autoRotate = true;
  controls.enablePan = false;
  controls.dampingFactor = 0.05;
  controls.maxDistance = 25;
  controls.minDistance = 15;
  controls.touches = {
    ONE: TOUCH.ROTATE,
    TWO: TOUCH.DOLLY_PAN,
  };
  controls.minPolarAngle = Math.PI / 3;
  controls.maxPolarAngle = Math.PI / 3;
};

$('.rightbutton').on('click', () => {
  
  layerIndex += 1;
  if (layerIndex > 4) {
    layerIndex = 4;
  } else {
    camera.layers.set(layerIndex);
  }
});

$('.leftbutton').on('click', () => {
  
  layerIndex -= 1;
  if (layerIndex < 0) {
    layerIndex = 0;
  } else {
    camera.layers.set(layerIndex);
  }
});

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Animate
 */
const tick = () => {
  requestAnimationFrame(tick);

  controls.update();

  renderer.render(scene, camera);

};
init();
tick();
