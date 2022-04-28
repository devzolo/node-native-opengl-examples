import GL from '@devzolo/node-native-gl';
import { setColorEx } from './utils';

export function drawCube(x: number, y: number, z: number) {
  GL.translatef(x, y, z);
  GL.begin(GL.QUADS);
  {
    // Front Face
    setColorEx(0x0000ffff);
    GL.texCoord2f(0.0, 0.0);
    GL.vertex3f(-1.0, -1.0, 1.0);
    setColorEx(0x00ffffff);
    GL.texCoord2f(1.0, 0.0);
    GL.vertex3f(1.0, -1.0, 1.0);
    setColorEx(0x0000ffff);
    GL.texCoord2f(1.0, 1.0);
    GL.vertex3f(1.0, 1.0, 1.0);
    setColorEx(0x00ffffff);
    GL.texCoord2f(0.0, 1.0);
    GL.vertex3f(-1.0, 1.0, 1.0);
    // Back Face
    setColorEx(0x0000ffff);
    GL.texCoord2f(1.0, 0.0);
    GL.vertex3f(-1.0, -1.0, 0.0);
    setColorEx(0x00ffffff);
    GL.texCoord2f(1.0, 1.0);
    GL.vertex3f(-1.0, 1.0, 0.0);
    setColorEx(0x0000ffff);
    GL.texCoord2f(0.0, 1.0);
    GL.vertex3f(1.0, 1.0, 0.0);
    setColorEx(0x00ffffff);
    GL.texCoord2f(0.0, 0.0);
    GL.vertex3f(1.0, -1.0, 0.0);

    // Top Face
    setColorEx(0x0000ffff);
    GL.texCoord2f(0.0, 1.0);
    GL.vertex3f(-1.0, 1.0, 0.0);
    setColorEx(0x00ffffff);
    GL.texCoord2f(0.0, 0.0);
    GL.vertex3f(-1.0, 1.0, 1.0);
    setColorEx(0x0000ffff);
    GL.texCoord2f(1.0, 0.0);
    GL.vertex3f(1.0, 1.0, 1.0);
    setColorEx(0x00ffffff);
    GL.texCoord2f(1.0, 1.0);
    GL.vertex3f(1.0, 1.0, 0.0);
    // Bottom Face
    setColorEx(0x0000ffff);
    GL.texCoord2f(1.0, 1.0);
    GL.vertex3f(-1.0, -1.0, 0.0);
    setColorEx(0x00ffffff);
    GL.texCoord2f(0.0, 1.0);
    GL.vertex3f(1.0, -1.0, 0.0);
    setColorEx(0x0000ffff);
    GL.texCoord2f(0.0, 0.0);
    GL.vertex3f(1.0, -1.0, 1.0);
    setColorEx(0x00ffffff);
    GL.texCoord2f(1.0, 0.0);
    GL.vertex3f(-1.0, -1.0, 1.0);
    // Right face
    setColorEx(0x0000ffff);
    GL.texCoord2f(1.0, 0.0);
    GL.vertex3f(1.0, -1.0, 0.0);
    setColorEx(0x00ffffff);
    GL.texCoord2f(1.0, 1.0);
    GL.vertex3f(1.0, 1.0, 0.0);
    setColorEx(0x0000ffff);
    GL.texCoord2f(0.0, 1.0);
    GL.vertex3f(1.0, 1.0, 1.0);
    setColorEx(0x00ffffff);
    GL.texCoord2f(0.0, 0.0);
    GL.vertex3f(1.0, -1.0, 1.0);
    // Left Face
    setColorEx(0x0000ffff);
    GL.texCoord2f(0.0, 0.0);
    GL.vertex3f(-1.0, -1.0, 0.0);
    setColorEx(0x00ffffff);
    GL.texCoord2f(1.0, 0.0);
    GL.vertex3f(-1.0, -1.0, 1.0);
    setColorEx(0x0000ffff);
    GL.texCoord2f(1.0, 1.0);
    GL.vertex3f(-1.0, 1.0, 1.0);
    setColorEx(0x00ffffff);
    GL.texCoord2f(0.0, 1.0);
    GL.vertex3f(-1.0, 1.0, 0.0);
  }
  GL.end();
}

export function drawNode(x: number, y: number, altura: number) {
  GL.translatef(x, y, 0.0);
  GL.begin(GL.QUADS);
  {
    // Front Face
    setColorEx(0xff0000ff);
    GL.texCoord2f(0.0, 0.0);
    GL.vertex3f(-1.0, -1.0, altura);
    setColorEx(0xffff00ff);
    GL.texCoord2f(1.0, 0.0);
    GL.vertex3f(1.0, -1.0, altura);
    setColorEx(0xff0000ff);
    GL.texCoord2f(1.0, 1.0);
    GL.vertex3f(1.0, 1.0, altura);
    setColorEx(0xffff00ff);
    GL.texCoord2f(0.0, 1.0);
    GL.vertex3f(-1.0, 1.0, altura);
    // Back Face
    setColorEx(0xff0000ff);
    GL.texCoord2f(1.0, 0.0);
    GL.vertex3f(-1.0, -1.0, 0.0);
    setColorEx(0xffff00ff);
    GL.texCoord2f(1.0, 1.0);
    GL.vertex3f(-1.0, 1.0, 0.0);
    setColorEx(0xff0000ff);
    GL.texCoord2f(0.0, 1.0);
    GL.vertex3f(1.0, 1.0, 0.0);
    setColorEx(0xffff00ff);
    GL.texCoord2f(0.0, 0.0);
    GL.vertex3f(1.0, -1.0, 0.0);

    // Top Face
    setColorEx(0xff0000ff);
    GL.texCoord2f(0.0, 1.0);
    GL.vertex3f(-1.0, 1.0, 0.0);
    setColorEx(0xffff00ff);
    GL.texCoord2f(0.0, 0.0);
    GL.vertex3f(-1.0, 1.0, altura);
    setColorEx(0xff0000ff);
    GL.texCoord2f(1.0, 0.0);
    GL.vertex3f(1.0, 1.0, altura);
    setColorEx(0xffff00ff);
    GL.texCoord2f(1.0, 1.0);
    GL.vertex3f(1.0, 1.0, 0.0);
    // Bottom Face
    setColorEx(0xff0000ff);
    GL.texCoord2f(1.0, 1.0);
    GL.vertex3f(-1.0, -1.0, 0.0);
    setColorEx(0xffff00ff);
    GL.texCoord2f(0.0, 1.0);
    GL.vertex3f(1.0, -1.0, 0.0);
    setColorEx(0xff0000ff);
    GL.texCoord2f(0.0, 0.0);
    GL.vertex3f(1.0, -1.0, altura);
    setColorEx(0xffff00ff);
    GL.texCoord2f(1.0, 0.0);
    GL.vertex3f(-1.0, -1.0, altura);
    // Right face
    setColorEx(0xff0000ff);
    GL.texCoord2f(1.0, 0.0);
    GL.vertex3f(1.0, -1.0, 0.0);
    setColorEx(0xffff00ff);
    GL.texCoord2f(1.0, 1.0);
    GL.vertex3f(1.0, 1.0, 0.0);
    setColorEx(0xff0000ff);
    GL.texCoord2f(0.0, 1.0);
    GL.vertex3f(1.0, 1.0, altura);
    setColorEx(0xffff00ff);
    GL.texCoord2f(0.0, 0.0);
    GL.vertex3f(1.0, -1.0, altura);
    // Left Face
    setColorEx(0xffff00ff);
    GL.texCoord2f(0.0, 0.0);
    GL.vertex3f(-1.0, -1.0, 0.0);
    setColorEx(0xffff00ff);
    GL.texCoord2f(1.0, 0.0);
    GL.vertex3f(-1.0, -1.0, altura);
    setColorEx(0xff0000ff);
    GL.texCoord2f(1.0, 1.0);
    GL.vertex3f(-1.0, 1.0, altura);
    setColorEx(0xffff00ff);
    GL.texCoord2f(0.0, 1.0);
    GL.vertex3f(-1.0, 1.0, 0.0);
  }
  GL.end();
}

let drawBackgroundList!: number;

export function drawBackground() {
  const NUM_LINES = 200000.0;
  const NUM_LINESDIV2 = NUM_LINES / 2;

  if (!drawBackgroundList) {
    drawBackgroundList = GL.genLists(1);
    GL.newList(drawBackgroundList, GL.COMPILE);

    GL.disable(GL.TEXTURE_2D);
    GL.color4f(0.0, 1.0, 0.0, 0.0);
    GL.begin(GL.LINES);
    {
      for (let i = 0.0; i <= NUM_LINES; i += 2.0) {
        GL.vertex3f(-NUM_LINESDIV2 + i, NUM_LINESDIV2, 0.0);
        GL.vertex3f(-NUM_LINESDIV2 + i, -NUM_LINESDIV2, 0.0);

        GL.vertex3f(NUM_LINESDIV2, -NUM_LINESDIV2 + i, 0.0);
        GL.vertex3f(-NUM_LINESDIV2, -NUM_LINESDIV2 + i, 0.0);
      }
    }
    GL.end();
    GL.enable(GL.TEXTURE_2D);
    GL.color4f(1.0, 1.0, 1.0, 1.0);

    GL.endList();
  }
  GL.callList(drawBackgroundList);
}
