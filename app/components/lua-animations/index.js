import warpStarfield from './warp-starfield.lua?raw';
import flowField from './flow-field.lua?raw';
import harmonograph from './harmonograph.lua?raw';
import torus from './torus.lua?raw';
import fireworks from './fireworks.lua?raw';

// The banner animations, in round-robin order. Each entry is a Lua script that
// drives the canvas through the API RandomCanvasAnimation exposes.
export const LUA_ANIMATIONS = [
  { name: 'warp-starfield', source: warpStarfield },
  { name: 'flow-field',     source: flowField },
  { name: 'harmonograph',   source: harmonograph },
  { name: 'torus',          source: torus },
  { name: 'fireworks',      source: fireworks },
];

// Lookup for a whitelabel that pins one animation instead of round-robining.
export const LUA_ANIMATIONS_BY_NAME = Object.fromEntries(
  LUA_ANIMATIONS.map((a) => [a.name, a])
);
