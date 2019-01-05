export const km2u = km => km / 100000;

export const u2km = u => u * 100000;

export const clamp = (value, min, max) => Math.max(Math.min(value, max), min);
