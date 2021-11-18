import GL from '@devzolo/node-native-gl';

export function clamp(v: number) {
  if (v > 360) v = 0;
  else if (v < 0) v = 360;
  return v;
}

export function setColorEx(color: number) {
  GL.color4f(
    ((color >> 24) & 0xff) / 255.0,
    ((color >> 16) & 0xff) / 255.0,
    ((color >> 8) & 0xff) / 255.0,
    (color & 0xff) / 255.0,
  );
}
