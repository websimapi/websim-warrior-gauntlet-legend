import * as THREE from 'three';

// --- Shader Definitions ---
const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader = `
    uniform sampler2D uTexture;
    uniform vec3 uHairColor;
    uniform vec3 uSkinColor;
    uniform vec3 uTrimColor;
    uniform vec3 uArmorColor;
    varying vec2 vUv;

    // Greyscale ranges (0.0 to 1.0)
    const float ARMOR_MIN = 30.0 / 255.0;
    const float ARMOR_MAX = 70.0 / 255.0;
    const float HAIR_MIN = 80.0 / 255.0;
    const float HAIR_MAX = 120.0 / 255.0;
    const float SKIN_MIN = 130.0 / 255.0;
    const float SKIN_MAX = 170.0 / 255.0;
    const float TRIM_MIN = 190.0 / 255.0;
    const float TRIM_MAX = 230.0 / 255.0;

    void main() {
        vec4 texColor = texture2D(uTexture, vUv);

        if (texColor.a < 0.5) {
            discard; // Make background transparent
        }

        float brightness = texColor.r; // Greyscale, so R, G, and B are the same.

        vec3 finalColor = texColor.rgb;

        if (brightness >= HAIR_MIN && brightness <= HAIR_MAX) {
            float factor = (brightness - HAIR_MIN) / (HAIR_MAX - HAIR_MIN);
            finalColor = uHairColor * factor;
        } else if (brightness >= SKIN_MIN && brightness <= SKIN_MAX) {
            float factor = (brightness - SKIN_MIN) / (SKIN_MAX - SKIN_MIN);
            finalColor = uSkinColor * factor;
        } else if (brightness >= TRIM_MIN && brightness <= TRIM_MAX) {
            float factor = (brightness - TRIM_MIN) / (TRIM_MAX - TRIM_MIN);
            finalColor = uTrimColor * factor;
        } else if (brightness >= ARMOR_MIN && brightness <= ARMOR_MAX) {
            float factor = (brightness - ARMOR_MIN) / (ARMOR_MAX - ARMOR_MIN);
            finalColor = uArmorColor * factor;
        }

        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

// --- Scene Setup ---
const canvas = document.getElementById('warrior-canvas');
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
camera.position.z = 1;

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0); // Set clear color to transparent

// --- Color Inputs ---
const hairColorInput = document.getElementById('hair-color');
const skinColorInput = document.getElementById('skin-color');
const trimColorInput = document.getElementById('trim-color');
const armorColorInput = document.getElementById('armor-color');

// --- Texture and Material ---
const textureLoader = new THREE.TextureLoader();
textureLoader.load('warrior.png', (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    
    // Set canvas size based on texture aspect ratio
    const aspect = texture.image.width / texture.image.height;
    const container = document.getElementById('container');
    const availableHeight = window.innerHeight - 200; // a guess for controls height
    const canvasHeight = Math.min(availableHeight, 800);
    const canvasWidth = canvasHeight * aspect;
    renderer.setSize(canvasWidth, canvasHeight);

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        uniforms: {
            uTexture: { value: texture },
            uHairColor: { value: new THREE.Color(hairColorInput.value) },
            uSkinColor: { value: new THREE.Color(skinColorInput.value) },
            uTrimColor: { value: new THREE.Color(trimColorInput.value) },
            uArmorColor: { value: new THREE.Color(armorColorInput.value) },
        },
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // --- Event Listeners ---
    hairColorInput.addEventListener('input', (event) => {
        material.uniforms.uHairColor.value.set(event.target.value);
    });
    skinColorInput.addEventListener('input', (event) => {
        material.uniforms.uSkinColor.value.set(event.target.value);
    });
    trimColorInput.addEventListener('input', (event) => {
        material.uniforms.uTrimColor.value.set(event.target.value);
    });
    armorColorInput.addEventListener('input', (event) => {
        material.uniforms.uArmorColor.value.set(event.target.value);
    });

    // --- Render Loop ---
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();
});