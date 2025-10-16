import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Material type for meshes with vertex colors
// 'basic' = MeshBasicMaterial (ignores lighting, shows raw vertex colors)
// 'standard' = MeshStandardMaterial (affected by lighting)
// 'phong' = MeshPhongMaterial (classic lighting model)
let materialType = 'basic';

// Store references to meshes with vertex colors for material switching
const vertexColorMeshes = [];

// Scene setup
const scene = new THREE.Scene();

// Set a simple background color
scene.background = new THREE.Color(0x222222);

// Enhanced lighting setup for better visibility
console.log('Setting up enhanced lighting for better model visibility');

// Use a narrower field of view (like a telephoto lens) to make objects appear larger from a distance
const camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.1, 2000); // Reduced FOV from 45 to 20
// Position the camera at a greater distance
camera.position.set(0, 1.0, 60); // Doubled from 30 to 60

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Debug flags
const SHOW_LIGHT_HELPERS = false; // Set to true to show light helpers
const SHOW_GRID = false; // Set to true to show grid

// Add grid helper only if enabled
if (SHOW_GRID) {
  const gridHelper = new THREE.GridHelper(10, 10);
  scene.add(gridHelper);
}

// Lighting - Enhanced for better visibility

// Hemisphere light (sky and ground colors)
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
scene.add(hemiLight);

// Main directional light (like the sun)
const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
mainLight.position.set(3, 5, 2);
mainLight.castShadow = true;
scene.add(mainLight);

// Fill light from opposite direction
const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
fillLight.position.set(-3, 2, -2);
scene.add(fillLight);

// Rim light for edge highlighting
const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
rimLight.position.set(0, 3, -5);
scene.add(rimLight);

// Ambient light to ensure no part is completely dark
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Point light for additional highlights
const pointLight = new THREE.PointLight(0xffffff, 1.0);
pointLight.position.set(0, 2, 0);
scene.add(pointLight);

// Special spotlight for eyes
const eyeLight = new THREE.SpotLight(0xffffff, 1.5);
eyeLight.position.set(0, 1, 2);
eyeLight.angle = Math.PI / 6;
eyeLight.penumbra = 0.2;
eyeLight.decay = 2;
eyeLight.distance = 10;
scene.add(eyeLight);

// Add a subtle colored light for artistic effect
const colorLight = new THREE.PointLight(0x6495ED, 0.5); // Cornflower blue
colorLight.position.set(-2, 0, -1);
scene.add(colorLight);

// Add light helpers if enabled
if (SHOW_LIGHT_HELPERS) {
  // Create helpers for each light
  const mainLightHelper = new THREE.DirectionalLightHelper(mainLight, 1);
  scene.add(mainLightHelper);
  
  const fillLightHelper = new THREE.DirectionalLightHelper(fillLight, 1);
  scene.add(fillLightHelper);
  
  const rimLightHelper = new THREE.DirectionalLightHelper(rimLight, 1);
  scene.add(rimLightHelper);
  
  const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2);
  scene.add(pointLightHelper);
  
  const spotLightHelper = new THREE.SpotLightHelper(eyeLight);
  scene.add(spotLightHelper);
  
  const colorLightHelper = new THREE.PointLightHelper(colorLight, 0.2);
  scene.add(colorLightHelper);
}

// Controls - orbit around the head
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = false;
controls.minDistance = 30.0; // Keep the camera from getting too close with the narrow FOV
controls.maxDistance = 90; // Maximum reasonable distance with the narrow FOV
controls.target.set(0, 0, 0); // Set target to origin where the head will be
controls.autoRotate = false; // Disable automatic rotation since we're using mouse control
controls.autoRotateSpeed = 0.5; // Keep this in case user enables it later

// Get DOM elements
const loadingElement = document.getElementById('loading');
const progressElement = document.getElementById('progress');

// Loading manager for better error handling and feedback
const loadingManager = new THREE.LoadingManager();
loadingManager.onStart = function(url, itemsLoaded, itemsTotal) {
  console.log('Started loading: ' + url + '\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
  loadingElement.style.display = 'block';
};

loadingManager.onLoad = function() {
  console.log('Loading complete!');
  loadingElement.style.display = 'none';
};

loadingManager.onProgress = function(url, itemsLoaded, itemsTotal) {
  const percent = Math.round((itemsLoaded / itemsTotal) * 100);
  console.log('Loading file: ' + url + '\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
  progressElement.textContent = percent + '%';
};

loadingManager.onError = function(url) {
  console.log('There was an error loading ' + url);
  loadingElement.textContent = 'Error loading model!';
  loadingElement.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
};

// Debug scene state before loading
console.log('Scene before loading model:', scene);

// Helper function to check if a material is properly set up for vertex colors
function checkMaterialForVertexColors(material, meshName) {
  console.log(`Material check for ${meshName}:`);
  
  // Check if the material has vertex colors enabled
  console.log(`- vertexColors enabled: ${material.vertexColors}`);
  
  // In Three.js, vertexColors should be true (boolean) for vertex colors to work
  // In older versions it might be THREE.VertexColors instead of true
  if (material.vertexColors !== true) {
    console.warn(`  WARNING: material.vertexColors is not set to true. Setting it now.`);
    material.vertexColors = true;
  }
  
  // Check if the material has a color property that might override vertex colors
  if (material.color) {
    console.log(`- material.color: ${material.color.getHexString()}`);
    if (material.color.r !== 1 || material.color.g !== 1 || material.color.b !== 1) {
      console.warn(`  WARNING: Material color is not white (1,1,1), which may tint vertex colors`);
      console.log(`  Setting material color to white to ensure vertex colors display correctly`);
      material.color.setRGB(1, 1, 1);
    }
  }
  
  // Check material type
  console.log(`- material type: ${material.type}`);
  if (material.type !== 'MeshStandardMaterial' && material.type !== 'MeshPhysicalMaterial') {
    console.warn(`  WARNING: Material is not MeshStandardMaterial or MeshPhysicalMaterial, vertex colors may not work as expected`);
  }
  
  // Check if there are maps that might override vertex colors
  if (material.map) {
    console.warn(`  WARNING: Material has a color map which may override vertex colors`);
  }
  
  // Check transparency settings
  console.log(`- transparent: ${material.transparent}, opacity: ${material.opacity}`);
  
  // Force material update
  material.needsUpdate = true;
}

// Load the vertex-painted head
const loader = new GLTFLoader(loadingManager);

// Use Google Drive URL for hosting on GitHub Pages
const modelPaths = [
  // Replace this with your actual Google Drive direct download URL
  // Format: https://drive.google.com/uc?export=download&id=YOUR_FILE_ID
  'https://drive.google.com/uc?export=download&id=1Wyp-S89ZAACNxwVjKCDGMXbk4ssskR5d'
];

console.log('Loading re-exported model...');

// Log information about GLTF vs GLB format
console.log('INFO: Trying both GLTF and GLB formats. GLTF is a text-based format that may handle vertex colors better in some cases.');
console.log('INFO: If you only have a GLB file, you can convert it to GLTF in Blender by choosing File > Export > glTF 2.0 (.glb/.gltf) and selecting the GLTF format.');

// Function to try loading the model with different paths
let currentPathIndex = 0;

function tryLoadModel(pathIndex) {
  if (pathIndex >= modelPaths.length) {
    console.error('Failed to load model after trying all paths');
    loadingElement.textContent = 'Error: Could not load model after trying all paths';
    loadingElement.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
    
    // Show advice about GLB vs GLTF
    console.warn('SUGGESTION: If you are having issues with vertex colors, try converting your model from GLB to GLTF format in Blender.');
    console.warn('SUGGESTION: When exporting from Blender, make sure to check "Include > Vertex Colors" in the export settings.');
    return;
  }
  
  const path = modelPaths[pathIndex];
  console.log(`Trying to load model from path: ${path}`);
  
  loader.load(
    path,
    // Success callback
    (gltf) => {
      console.log('Model loaded successfully:', gltf);
      
      const model = gltf.scene;
      
      // Center the model
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center); // Center the model at origin
      
      // Set a name for the model to easily reference it later
      model.name = 'gigahead';
      
      // First pass: Fix all meshes to use DoubleSide rendering and preserve vertex colors
      console.log('Applying fixes to all meshes in the re-exported model');
      model.traverse((obj) => {
        if (obj.isMesh) {
          console.log(`Processing mesh: ${obj.name}`);
          
          // Fix for missing faces
          obj.material.side = THREE.DoubleSide;
          
          // Check if this is an eye mesh
          const isEye = obj.name.toLowerCase().includes('eye');
          
          // CRITICAL FIX FOR VERTEX COLORS
          if (obj.geometry.attributes.color) {
            console.log(`Mesh ${obj.name} has vertex colors - creating specialized material`);
            
            if (isEye) {
              // For eyes with vertex colors, use a material that can show reflections
              const eyeMaterial = new THREE.MeshStandardMaterial({
                vertexColors: true,     // Enable vertex colors
                roughness: 0.1,          // Glossy for eyes
                metalness: 0.2,          // Slight metalness for reflections
                side: THREE.DoubleSide,  // Render both sides
                transparent: false       // No transparency
              });
              
              obj.material = eyeMaterial;
              console.log(`Applied specialized eye material with vertex colors to ${obj.name}`);
            } else {
              // Create material based on current materialType setting
              const vertexColorMaterial = createVertexColorMaterial(materialType);
              
              // Store reference to this mesh for material switching
              vertexColorMeshes.push(obj);
              
              // Apply the new material
              obj.material = vertexColorMaterial;
              console.log(`Applied MeshBasicMaterial with vertex colors to ${obj.name}`);
            }
          } else if (isEye) {
            // For eyes without vertex colors
            const eyeMaterial = new THREE.MeshStandardMaterial({
              color: 0xffffff,         // White
              roughness: 0.1,          // Glossy
              metalness: 0.2,          // Slight metalness
              side: THREE.DoubleSide,  // Render both sides
              transparent: false       // No transparency
            });
            
            obj.material = eyeMaterial;
            console.log(`Applied specialized eye material to ${obj.name}`);
          }
          
          // Make sure materials are visible
          obj.material.transparent = true;
          obj.material.opacity = 1.0;
          obj.material.needsUpdate = true;
        }
      });
      
      // Check if any meshes have vertex colors before processing
      let hasVertexColors = false;
      model.traverse((object) => {
        if (object.isMesh && object.geometry.attributes.color) {
          hasVertexColors = true;
          console.log('Found mesh with vertex colors:', object.name);
          console.log('Color attribute:', object.geometry.attributes.color);
        }
      });
      
      if (!hasVertexColors) {
        console.warn('WARNING: No vertex colors found in any mesh! Check your Blender export settings.');
      } else {
        console.log('Vertex colors found in model. Processing materials to display them...');
      }
      
      // Log all meshes in the model for debugging
      console.log('All meshes in model:', []);
      model.traverse((object) => {
        if (object.isMesh) console.log(object.name);
      });
      
      model.traverse((child) => {
        if (child.isMesh) {
          console.log('Processing mesh:', child.name);
          
          // Store original material for reference
          const origMaterial = child.material;
          console.log('Original material:', origMaterial);
          
          // Check if this mesh has vertex colors in its geometry
          const hasVertexColors = !!child.geometry.attributes.color;
          
          if (hasVertexColors) {
            console.log(`Mesh ${child.name} has vertex colors in geometry!`);
            
            // CRITICAL FIX: Create a new material specifically designed for vertex colors
            // This ensures we don't have any conflicting settings from the original material
            const vertexColorMaterial = new THREE.MeshStandardMaterial({
              vertexColors: true,     // Enable vertex colors
              roughness: 0.6,         // Medium roughness works best for vertex colors
              metalness: 0.0,         // No metalness to show colors accurately
              flatShading: false,     // Smooth shading for better appearance
              side: THREE.DoubleSide  // Render both sides
            });
            
            // Log information about the format and vertex colors
            const formatType = modelPaths[currentPathIndex].toLowerCase().endsWith('.gltf') ? 'GLTF' : 'GLB';
            console.log(`Using ${formatType} format with vertex colors. If colors don't appear correctly, try the other format.`);
            
            // Set the material color to white to ensure vertex colors show properly
            vertexColorMaterial.color.set(0xffffff);
            
            // IMPORTANT: Try with transparency enabled as suggested
            vertexColorMaterial.transparent = true;
            vertexColorMaterial.opacity = 1.0;
            // Try different blending modes
            vertexColorMaterial.blending = THREE.NormalBlending; // Default blending
            // Other options to try if needed:
            // vertexColorMaterial.blending = THREE.AdditiveBlending;
            // vertexColorMaterial.blending = THREE.MultiplyBlending;
            console.log('Setting transparent = true with NormalBlending for vertex color material');
            
            // Copy any important properties from the original material
            if (origMaterial.normalMap) vertexColorMaterial.normalMap = origMaterial.normalMap;
            if (origMaterial.aoMap) vertexColorMaterial.aoMap = origMaterial.aoMap;
            
            // Apply the new material
            child.material = vertexColorMaterial;
            console.log('Applied new vertex color material to', child.name);
          } else {
            console.log(`Mesh ${child.name} does NOT have vertex colors`);
            
            // Check if this is an eye mesh
            const isEye = child.name.toLowerCase().includes('eye');
            
            if (isEye) {
              console.log('Found eye mesh:', child.name);
              // Special handling for eye material
              
              // Create a new material specifically for eyes
              const eyeMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,         // White base color
                roughness: 0.1,          // Very glossy
                metalness: 0.2,          // Slight metalness for reflections
                side: THREE.DoubleSide,  // Render both sides
                transparent: true,       // Enable transparency
                opacity: 1.0             // Fully opaque
              });
              
              // Copy any textures from the original material
              if (origMaterial.map) eyeMaterial.map = origMaterial.map;
              if (origMaterial.normalMap) eyeMaterial.normalMap = origMaterial.normalMap;
              
              // Apply the new material
              child.material = eyeMaterial;
              console.log('Applied specialized eye material to', child.name);
              
              // Ensure the eye is visible by adjusting its position if needed
              // This is a common fix for eyes that appear to be missing
              child.renderOrder = 2; // Render eyes after other objects
            }
          }
          
          // Run the material check helper
          checkMaterialForVertexColors(child.material, child.name);
          
          // Try with transparency enabled as suggested
          child.material.transparent = true;
          child.material.opacity = 1.0;
          console.log(`Setting transparent = true for ${child.name} material`);
          
          // Ensure the material is updated
          child.material.needsUpdate = true;
          
          // Log final material properties for debugging
          console.log('Final material settings for', child.name, ':', {
            vertexColors: child.material.vertexColors,
            roughness: child.material.roughness,
            metalness: child.material.metalness,
            side: child.material.side
          });
        }
      });
      
      scene.add(model);
      
      // Position camera to look at the model
      const boundingBox = new THREE.Box3().setFromObject(model);
      const size = boundingBox.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      camera.position.set(0, maxDim / 2, maxDim * 2);
      camera.lookAt(0, 0, 0);
    },
    // Progress callback
    (xhr) => {
      const percent = Math.round((xhr.loaded / xhr.total) * 100);
      console.log(percent + '% loaded');
      progressElement.textContent = percent + '%';
    },
    // Error callback
    (err) => {
      console.error(`Error loading model from ${path}:`, err);
      // Try the next path
      tryLoadModel(pathIndex + 1);
    }
  );
}

// Start trying to load the model with the first path
tryLoadModel(0);

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Mouse movement variables for head rotation
let targetX = 0;
let targetY = 0;

// Mouse movement listener
document.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth) * 2 - 1;
  const y = -(e.clientY / window.innerHeight) * 2 + 1;
  targetX = x * 0.5;
  targetY = y * 0.3;
});

// Function to create a material for vertex colors based on type
function createVertexColorMaterial(type) {
  const commonProps = {
    vertexColors: true,
    side: THREE.DoubleSide,
    transparent: false
  };
  
  switch (type) {
    case 'basic':
      return new THREE.MeshBasicMaterial(commonProps);
    case 'phong':
      return new THREE.MeshPhongMaterial({
        ...commonProps,
        shininess: 30,
        specular: 0x222222
      });
    case 'standard':
    default:
      return new THREE.MeshStandardMaterial({
        ...commonProps,
        roughness: 0.6,
        metalness: 0.0
      });
  }
}

// Create two mandalas - one that follows the camera and one that stays with the head
let mandala;
let cameraMandala;
function createMandala() {
  // Create a group to hold all mandala elements that stay with the head
  mandala = new THREE.Group();
  scene.add(mandala);
  
  // Create a group for elements that follow the camera
  cameraMandala = new THREE.Group();
  scene.add(cameraMandala);
  
  // Create multiple rings with different sizes and rotations
  const colors = [
    0x00ffff, // Cyan
    0xff00ff, // Magenta
    0xffff00, // Yellow
    0x00ff00, // Green
    0xff8800, // Orange
    0x8800ff, // Purple
    0x0088ff, // Light Blue
    0xff0088  // Pink
  ];
  
  // Create rings for the head-attached mandala (with much larger radius for more spacing)
  const headRingConfigs = [
    { radius: 4.0, thickness: 0.04, segments: 70, color: colors[3], rotX: Math.PI / 6, rotY: Math.PI / 3, rotZ: 0 },
    { radius: 3.5, thickness: 0.05, segments: 60, color: colors[6], rotX: Math.PI / 8, rotY: 0, rotZ: Math.PI / 8 },
    { radius: 3.0, thickness: 0.04, segments: 50, color: colors[0], rotX: Math.PI / 3, rotY: Math.PI / 5, rotZ: 0 }
  ];
  
  // Create rings for the outer mandala with thicker lines, more interesting patterns, and much larger radius
  const cameraRingConfigs = [
    { radius: 6.0, thickness: 0.15, segments: 100, color: colors[0], rotX: 0, rotY: 0, rotZ: 0 },
    { radius: 6.5, thickness: 0.12, segments: 90, color: colors[1], rotX: Math.PI / 4, rotY: 0, rotZ: 0 },
    { radius: 7.0, thickness: 0.18, segments: 80, color: colors[2], rotX: 0, rotY: Math.PI / 4, rotZ: 0 },
    { radius: 7.5, thickness: 0.10, segments: 120, color: colors[4], rotX: Math.PI / 5, rotY: 0, rotZ: Math.PI / 5 },
    { radius: 8.0, thickness: 0.16, segments: 130, color: colors[5], rotX: 0, rotY: Math.PI / 7, rotZ: 0 },
    { radius: 8.5, thickness: 0.14, segments: 110, color: colors[7], rotX: 0, rotY: Math.PI / 9, rotZ: Math.PI / 6 },
    { radius: 9.0, thickness: 0.12, segments: 140, color: colors[1], rotX: Math.PI / 9, rotY: 0, rotZ: Math.PI / 7 },
    // Add some additional rings with different patterns
    { radius: 7.2, thickness: 0.08, segments: 6, color: colors[3], rotX: Math.PI / 3, rotY: Math.PI / 6, rotZ: 0 }, // Hexagon
    { radius: 8.2, thickness: 0.10, segments: 3, color: colors[6], rotX: 0, rotY: Math.PI / 4, rotZ: 0 }, // Triangle
    { radius: 6.2, thickness: 0.09, segments: 5, color: colors[2], rotX: Math.PI / 6, rotY: 0, rotZ: 0 } // Pentagon
  ];
  
  // Create rings for the head-attached mandala
  headRingConfigs.forEach(config => {
    const geometry = new THREE.TorusGeometry(
      config.radius, 
      config.thickness, 
      16, 
      config.segments
    );
    
    // Create a glowing material for better visual effect
    const material = new THREE.MeshBasicMaterial({
      color: config.color,
      transparent: true,
      opacity: 0.7,
      emissive: config.color,
      emissiveIntensity: 0.5
    });
    
    const ring = new THREE.Mesh(geometry, material);
    ring.rotation.set(config.rotX, config.rotY, config.rotZ);
    mandala.add(ring);
    
    // Add a slightly larger, more transparent ring for glow effect
    const glowGeometry = new THREE.TorusGeometry(
      config.radius, 
      config.thickness * 1.5, 
      16, 
      config.segments
    );
    
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: config.color,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    
    const glowRing = new THREE.Mesh(glowGeometry, glowMaterial);
    glowRing.rotation.set(config.rotX, config.rotY, config.rotZ);
    mandala.add(glowRing);
  });
  
  // Create rings for the camera-following mandala
  cameraRingConfigs.forEach(config => {
    const geometry = new THREE.TorusGeometry(
      config.radius, 
      config.thickness, 
      16, 
      config.segments
    );
    
    // Create a glowing material for better visual effect
    const material = new THREE.MeshBasicMaterial({
      color: config.color,
      transparent: true,
      opacity: 0.6, // Slightly more transparent
      emissive: config.color,
      emissiveIntensity: 0.5
    });
    
    const ring = new THREE.Mesh(geometry, material);
    ring.rotation.set(config.rotX, config.rotY, config.rotZ);
    cameraMandala.add(ring);
    
    // Add a slightly larger, more transparent ring for glow effect
    const glowGeometry = new THREE.TorusGeometry(
      config.radius, 
      config.thickness * 1.8, // Even larger glow for camera mandala
      16, 
      config.segments
    );
    
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: config.color,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide
    });
    
    const glowRing = new THREE.Mesh(glowGeometry, glowMaterial);
    glowRing.rotation.set(config.rotX, config.rotY, config.rotZ);
    cameraMandala.add(glowRing);
  });
  
  // Add some elliptical rings for variety to the camera mandala
  for (let i = 0; i < 5; i++) { // More elliptical rings
    const ellipticalRing = new THREE.TorusGeometry(7.0 + i * 0.8, 0.10, 16, 100); // Thicker and larger
    const material = new THREE.MeshBasicMaterial({
      color: colors[i % colors.length],
      transparent: true,
      opacity: 0.7 // Slightly more opaque
    });
    
    const ring = new THREE.Mesh(ellipticalRing, material);
    // Scale to make it elliptical
    ring.scale.x = 1.5 + i * 0.1; // Varying elliptical shapes
    ring.rotation.set(Math.PI / 3 * i, Math.PI / 5 * i, 0);
    cameraMandala.add(ring);
  }
  
  // Add some spiral patterns
  const spiralPoints = [];
  const spiralRadius = 8.0; // Larger spiral
  const spiralTurns = 3; // More turns
  const spiralSegments = 120; // More segments
  
  for (let i = 0; i <= spiralSegments; i++) {
    const t = i / spiralSegments;
    const angle = spiralTurns * Math.PI * 2 * t;
    const radius = spiralRadius * (0.5 + t * 0.5);
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    spiralPoints.push(new THREE.Vector3(x, y, 0));
  }
  
  // Create spiral curve
  const spiralCurve = new THREE.CatmullRomCurve3(spiralPoints);
  const spiralGeometry = new THREE.TubeGeometry(spiralCurve, 100, 0.08, 8, false);
  
  // Create spiral mesh
  const spiralMaterial = new THREE.MeshBasicMaterial({
    color: colors[4],
    transparent: true,
    opacity: 0.7
  });
  
  const spiral = new THREE.Mesh(spiralGeometry, spiralMaterial);
  cameraMandala.add(spiral);
  
  // Add some decorative lines
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const lineGeometry = new THREE.BoxGeometry(0.08, 8.0, 0.08); // Thicker and longer lines
    const lineMaterial = new THREE.MeshBasicMaterial({
      color: colors[i % colors.length],
      transparent: true,
      opacity: 0.5
    });
    
    const line = new THREE.Mesh(lineGeometry, lineMaterial);
    line.position.set(Math.cos(angle) * 7.5, Math.sin(angle) * 7.5, 0); // Position further out
    line.rotation.z = angle + Math.PI / 2;
    cameraMandala.add(line);
  }
  
  // Create decorative elements
  // First layer of orbs - outer (camera mandala)
  for (let i = 0; i < 24; i++) {
    // Create small orbs around the rings
    const orbGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const orbMaterial = new THREE.MeshBasicMaterial({
      color: colors[i % colors.length],
      transparent: true,
      opacity: 0.8
    });
    
    const orb = new THREE.Mesh(orbGeometry, orbMaterial);
    const angle = (i / 24) * Math.PI * 2;
    orb.position.set(
      Math.cos(angle) * 3.2,
      Math.sin(angle) * 3.2,
      0
    );
    cameraMandala.add(orb);
  }
  
  // Second layer of orbs - middle (camera mandala)
  for (let i = 0; i < 18; i++) {
    const orbGeometry = new THREE.SphereGeometry(0.06, 16, 16);
    const orbMaterial = new THREE.MeshBasicMaterial({
      color: colors[(i + 3) % colors.length],
      transparent: true,
      opacity: 0.8
    });
    
    const orb = new THREE.Mesh(orbGeometry, orbMaterial);
    const angle = (i / 18) * Math.PI * 2;
    orb.position.set(
      Math.cos(angle) * 2.5,
      Math.sin(angle) * 2.5,
      0
    );
    cameraMandala.add(orb);
  }
  
  // Third layer of orbs - inner (head mandala)
  for (let i = 0; i < 12; i++) {
    const orbGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    const orbMaterial = new THREE.MeshBasicMaterial({
      color: colors[(i + 6) % colors.length],
      transparent: true,
      opacity: 0.8
    });
    
    const orb = new THREE.Mesh(orbGeometry, orbMaterial);
    const angle = (i / 12) * Math.PI * 2;
    orb.position.set(
      Math.cos(angle) * 1.8,
      Math.sin(angle) * 1.8,
      0
    );
    mandala.add(orb);
  }
  
  // Create spokes connecting the rings
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    
    // Outer spokes (camera mandala)
    const spokeGeometry1 = new THREE.CylinderGeometry(0.01, 0.01, 0.7, 8);
    const spokeMaterial1 = new THREE.MeshBasicMaterial({
      color: colors[(i + 2) % colors.length],
      transparent: true,
      opacity: 0.5
    });
    
    const spoke1 = new THREE.Mesh(spokeGeometry1, spokeMaterial1);
    spoke1.position.set(
      Math.cos(angle) * 2.85,
      Math.sin(angle) * 2.85,
      0
    );
    spoke1.rotation.z = angle + Math.PI / 2;
    cameraMandala.add(spoke1);
    
    // Only add middle spokes for every other position (camera mandala)
    if (i % 2 === 0) {
      // Middle spokes
      const spokeGeometry2 = new THREE.CylinderGeometry(0.008, 0.008, 0.7, 8);
      const spokeMaterial2 = new THREE.MeshBasicMaterial({
        color: colors[(i + 4) % colors.length],
        transparent: true,
        opacity: 0.5
      });
      
      const spoke2 = new THREE.Mesh(spokeGeometry2, spokeMaterial2);
      spoke2.position.set(
        Math.cos(angle) * 2.15,
        Math.sin(angle) * 2.15,
        0
      );
      spoke2.rotation.z = angle + Math.PI / 2;
      cameraMandala.add(spoke2);
    }
    
    // Only add inner spokes for every third position (head mandala)
    if (i % 3 === 0) {
      // Inner spokes
      const spokeGeometry3 = new THREE.CylinderGeometry(0.006, 0.006, 0.4, 8);
      const spokeMaterial3 = new THREE.MeshBasicMaterial({
        color: colors[(i + 6) % colors.length],
        transparent: true,
        opacity: 0.5
      });
      
      const spoke3 = new THREE.Mesh(spokeGeometry3, spokeMaterial3);
      spoke3.position.set(
        Math.cos(angle) * 1.6,
        Math.sin(angle) * 1.6,
        0
      );
      spoke3.rotation.z = angle + Math.PI / 2;
      mandala.add(spoke3);
    }
  }
  
  // Add some decorative arcs (camera mandala)
  for (let i = 0; i < 8; i++) {
    const arcGeometry = new THREE.TorusGeometry(0.5, 0.01, 8, 20, Math.PI);
    const arcMaterial = new THREE.MeshBasicMaterial({
      color: colors[i % colors.length],
      transparent: true,
      opacity: 0.7
    });
    
    const arc = new THREE.Mesh(arcGeometry, arcMaterial);
    const angle = (i / 8) * Math.PI * 2;
    arc.position.set(
      Math.cos(angle) * 3.5,
      Math.sin(angle) * 3.5,
      0
    );
    arc.rotation.z = angle;
    cameraMandala.add(arc);
  }
  
  // Add point lights for glow effect
  const colors3D = [
    new THREE.Color(0x00ffff),
    new THREE.Color(0xff00ff),
    new THREE.Color(0xffff00),
    new THREE.Color(0x00ff00)
  ];
  
  // Add lights to head mandala
  for (let i = 0; i < 2; i++) {
    const angle = (i / 2) * Math.PI * 2;
    const light = new THREE.PointLight(colors[i], 0.8, 3);
    light.position.set(
      Math.cos(angle) * 1.5,
      Math.sin(angle) * 1.5,
      0.5
    );
    mandala.add(light);
  }
  
  // Add lights to camera mandala
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const light = new THREE.PointLight(colors[i + 2], 0.6, 5);
    light.position.set(
      Math.cos(angle) * 2.5,
      Math.sin(angle) * 2.5,
      0.5
    );
    cameraMandala.add(light);
  }
}

// Create the mandala once the model is loaded
loadingManager.onLoad = function() {
  console.log('Loading complete!');
  loadingElement.style.display = 'none';
  createMandala();
};

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  // Time variable for animations
  const time = Date.now() * 0.001;
  
  const head = scene.getObjectByName('gigahead'); // or whichever your mesh name is
  if (head) {
    // Make the head face forward (toward the camera)
    // with slight mouse-controlled rotation
    
    // Base rotation to face camera
    const baseRotationY = Math.PI; // Face forward
    
    // Add mouse influence for subtle movement
    head.rotation.y = baseRotationY + targetX * 0.3;
    head.rotation.x = targetY * 0.3;
    
    // Limit head rotation to avoid unnatural angles
    head.rotation.x = THREE.MathUtils.clamp(head.rotation.x, -0.3, 0.3);
    head.rotation.z = THREE.MathUtils.clamp(head.rotation.z, -0.1, 0.1);
    
    // Update the inner mandala position to follow the head exactly
    if (mandala) {
      // Position the inner mandala at the same position as the head
      mandala.position.copy(head.position);
      
      // Use time-based rotation for the mandala
      mandala.rotation.y = Math.sin(time * 0.2) * 0.1;
      
      // Rotate each ring differently using time-based rotation
      mandala.children.forEach((child, index) => {
        if (child instanceof THREE.Mesh) {
          // Different rotation patterns based on index
          if (index % 3 === 0) {
            child.rotation.x = Math.sin(time * 0.3 + index * 0.1) * 0.2;
            child.rotation.z = Math.cos(time * 0.2 + index * 0.1) * 0.2;
          } else if (index % 3 === 1) {
            child.rotation.y = Math.sin(time * 0.25 + index * 0.1) * 0.2;
            child.rotation.z = Math.cos(time * 0.15 + index * 0.1) * 0.2;
          } else {
            child.rotation.x = Math.sin(time * 0.2 + index * 0.1) * 0.15;
            child.rotation.y = Math.cos(time * 0.3 + index * 0.1) * 0.15;
          }
        }
      });
      
      // Make the mandala pulse
      const pulseFactor = Math.sin(time * 0.5) * 0.05 + 1;
      mandala.scale.set(pulseFactor, pulseFactor, pulseFactor);
    }
    
    // Attach the outer mandala to the head
    if (cameraMandala) {
      // Position the outer mandala at the same position as the head
      cameraMandala.position.copy(head.position);
      
      // Add a subtle oscillation to the mandala position
      cameraMandala.position.y += Math.sin(time * 0.5) * 0.1;
      cameraMandala.position.x += Math.cos(time * 0.3) * 0.05;
      
      // For rotation, we want to follow the head rotation but more slowly
      // First, reset rotation to avoid accumulation
      cameraMandala.rotation.set(0, 0, 0);
      
      // Then add a slowed-down version of the head rotation
      // Use a very small influence factor to make it rotate much slower
      const headInfluence = 0.1; // Very small influence for slower rotation
      cameraMandala.rotation.y = head.rotation.y * headInfluence;
      cameraMandala.rotation.x = head.rotation.x * headInfluence;
      
      // Add time-based rotation for additional effect
      cameraMandala.rotation.z = time * 0.03; // Slower continuous rotation
      
      // Rotate each ring differently using time-based rotation with more interesting patterns
      cameraMandala.children.forEach((child, index) => {
        if (child instanceof THREE.Mesh) {
          // Different rotation patterns based on geometry type
          if (child.geometry instanceof THREE.TorusGeometry) {
            // For rings, create wave-like rotations
            const segments = child.geometry.parameters.tubularSegments;
            
            // Different rotation patterns based on number of segments
            if (segments < 10) { // For the polygon shapes (triangle, pentagon, hexagon)
              // Make polygons rotate faster
              child.rotation.z = time * 0.5;
              child.rotation.x = Math.sin(time * 0.3) * 0.5;
              child.rotation.y = Math.cos(time * 0.2) * 0.5;
            } else { // For circular rings
              // Gentle wave-like motion
              const baseSpeed = 0.1 + (index % 7) * 0.03;
              child.rotation.x = Math.sin(time * 0.1 + index * 0.1) * 0.3;
              child.rotation.y = Math.cos(time * 0.15 + index * 0.1) * 0.3;
              child.rotation.z = time * baseSpeed;
            }
          } else if (child.geometry instanceof THREE.TubeGeometry) {
            // For the spiral, create a spinning effect
            child.rotation.z = time * 0.2;
          } else if (child.geometry instanceof THREE.BoxGeometry) {
            // For the decorative lines, create a wave effect
            const angle = (index / 12) * Math.PI * 2;
            child.position.z = Math.sin(time * 0.5 + angle) * 0.2;
          } else {
            // For other geometries (orbs, etc)
            const baseSpeed = 0.1 + (index % 5) * 0.05;
            child.rotation.x = Math.sin(time * 0.2 + index) * 0.3;
            child.rotation.y = Math.cos(time * 0.3 + index) * 0.3;
            child.rotation.z = time * baseSpeed;
          }
        }
      });
      
      // Make the camera mandala pulse slightly
      const cameraPulseFactor = Math.sin(time * 0.3) * 0.03 + 1;
      cameraMandala.scale.set(cameraPulseFactor, cameraPulseFactor, cameraPulseFactor);
    }
  } else {
    // If head is not found, log it once
    if (!window.headNotFoundLogged) {
      console.log('Head model not found in scene. Available objects:', scene.children);
      window.headNotFoundLogged = true;
    }
  }

  controls.update();
  renderer.render(scene, camera);
}
animate();
