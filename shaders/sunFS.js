export default `
varying vec2 vUv;
varying vec3 vNormal;
uniform sampler2D texture;
uniform sampler2D colorShiftRamp;
uniform sampler2D colorRamp;
uniform float colorLookup;
uniform float time;

void main() {
	// double the sun texture coordinates to make it look more detailed
	vec2 uv = vUv * 2.0;

	// lookup in the texture
	vec3 colorIndex = texture2D(texture, uv).xyz;
	float lookupColor = colorIndex.x;

	// cycle the value and clamp it, we're going to use this for a second lookup
	float paletteSpeed = 0.2;
	lookupColor = fract(lookupColor - time * paletteSpeed);
	lookupColor = clamp(lookupColor, 0.2, 0.98);

	// find out what color level to use
	vec2 shiftUV = vec2(lookupColor, 0);
	vec3 shiftColor = texture2D(colorShiftRamp, shiftUV).xyz;

	// do some color grading
	shiftColor.xyz *= 0.6;
	shiftColor.x = pow(shiftColor.x, 2.);
	shiftColor.y = pow(shiftColor.y, 2.);
	shiftColor.z = pow(shiftColor.z, 2.);

	// shiftColor.xyz += vec3(0.6, 0.6, 0.6) * 1.4;
	shiftColor.xyz += vec3(0.6, 0.35, 0.21) * 2.2;

	// look up the color
	vec2 colorUV = vec2(0., colorLookup);
	vec4 spectralColor = texture2D(colorRamp, colorUV);

	// do some color grading
	spectralColor.x = pow(spectralColor.x, 2.);
	spectralColor.y = pow(spectralColor.y, 2.);
	spectralColor.z = pow(spectralColor.z, 2.);

	shiftColor.xyz *= spectralColor.xyz;
	
	// add a subtractive pass for detail
	vec2 uv2 = vec2(vUv.x + cos(time) * 0.001, vUv.y + sin(time) * 0.001);
	vec3 secondaryColor = texture2D(texture, uv2).xyz;

	// finally, give it an outer rim to blow out the edges
	float intensity = 1.15 - dot(vNormal, vec3(0.0, 0.0, 0.3));
	vec3 outerGlow = vec3(1.0, 0.8, 0.6) * pow(intensity, 6.0);

	vec3 desiredColor = shiftColor + outerGlow - secondaryColor;
	float darkness = 1.0 - clamp(length(desiredColor), 0., 1.);
	vec3 colorCorrection = vec3(0.7, 0.4, 0.01) * pow(darkness, 2.0) * secondaryColor;
	desiredColor += colorCorrection;

	gl_FragColor = vec4(desiredColor, 1.0);
}
`;
