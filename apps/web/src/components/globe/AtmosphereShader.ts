import * as THREE from 'three';

export function createAtmosphereMaterial(glowColor = 0x00f0ff): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      glowColor: { value: new THREE.Color(glowColor) },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vPosition = mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      uniform vec3 glowColor;

      void main() {
        vec3 viewDir = normalize(-vPosition);
        // Fresnel rim effect
        float rim = 1.0 - max(0.0, dot(vNormal, viewDir));
        float intensity = pow(rim, 3.2);
        gl_FragColor = vec4(glowColor, intensity * 0.7);
      }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
  });
}
