export default `
varying vec2 vUv;
varying vec3 vNormal;
void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
	vNormal = normalize(normalMatrix * normal);
	vUv = uv;
}
`;
