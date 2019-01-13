export const km2u = km => km / 100000;

export const u2km = u => u * 100000;

export const clamp = (value, min, max) => Math.max(Math.min(value, max), min);

export const u2mi = u => u * 62137.119;

export const u2people = u => u * 59651636.364; // based on a person being about 5'6"

export const u2bananas = u => u * 562429700; // 7 in banana

export const u2ggb = u => u * 36530.89856; // golden gate bridges
