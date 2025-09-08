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
    varying vec2 vUv;

    // Greyscale ranges (0.0 to 1.0)
    const float HAIR_MIN = 150.0 / 255.0;
    const float HAIR_MAX = 170.0 / 255.0;
    const float SKIN_MIN = 200.0 / 255.0;
    const float SKIN_MAX = 220.0 / 255.0;
    const float TRIM_MIN = 230.0 / 255.0;
    const float TRIM_MAX = 250.0 / 255.0;

    void main() {
        vec4 texColor = texture2D(uTexture, vUv);
        float brightness = texColor.r; // Greyscale, so R, G, and B are the same.

        vec3 finalColor = texColor.rgb;

        if (brightness > HAIR_MIN && brightness < HAIR_MAX) {
            finalColor = uHairColor * (brightness + 0.2); // Add a little boost to pop
        } else if (brightness > SKIN_MIN && brightness < SKIN_MAX) {
            finalColor = uSkinColor * (brightness + 0.1);
        } else if (brightness > TRIM_MIN && brightness < TRIM_MAX) {
            finalColor = uTrimColor * (brightness + 0.3);
        }

        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

// --- Scene Setup ---
const canvas = document.getElementById('warrior-canvas');
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
camera.position.z = 1;

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });

// --- Color Inputs ---
const hairColorInput = document.getElementById('hair-color');
const skinColorInput = document.getElementById('skin-color');
const trimColorInput = document.getElementById('trim-color');

// --- Texture and Material ---
const textureLoader = new THREE.TextureLoader();
textureLoader.load('warrior.png', (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    
    // Set canvas size based on texture aspect ratio
    const aspect = texture.image.width / texture.image.height;
    const canvasHeight = Math.min(window.innerHeight * 0.7, 800);
    const canvasWidth = canvasHeight * aspect;
    renderer.setSize(canvasWidth, canvasHeight);

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            uTexture: { value: texture },
            uHairColor: { value: new THREE.Color(hairColorInput.value) },
            uSkinColor: { value: new THREE.Color(skinColorInput.value) },
            uTrimColor: { value: new THREE.Color(trimColorInput.value) },
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

    // --- Render Loop ---
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();
});

