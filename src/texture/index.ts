import GL from '@devzolo/node-native-gl';
import GLU from '@devzolo/node-native-glu';
import GLUT from '@devzolo/node-native-glut';
import path from 'path';
import { Texture } from '~/util/Texture';

let texture1: Texture;
let texture2: Texture;
let texture3: Texture;

async function initialize() {
  GL.enable(GL.TEXTURE_2D);
  GL.shadeModel(GL.SMOOTH);
  GL.clearColor(0.0, 0.0, 0.0, 1.0);
  GL.clearDepth(1.0);
  GL.hint(GL.PERSPECTIVE_CORRECTION_HINT, GL.NICEST);
  GL.blendFunc(GL.SRC_COLOR, GL.ONE_MINUS_SRC_ALPHA);
  GL.enable(GL.BLEND);
  texture1 = await Texture.load(path.join(__dirname, '..', 'assets', 'textures', 'bloco.jpg'));
  texture2 = await Texture.load(path.join(__dirname, '..', 'assets', 'textures', 'grille.png'));
  texture3 = await Texture.load(path.join(__dirname, '..', 'assets', 'textures', 'font.bmp'));
}

function onReSize(width: number, height: number) {
  GL.viewport(0, 0, width, height);
  GL.matrixMode(GL.PROJECTION);
  GL.loadIdentity();
  GLU.perspective(45.0, width / height, 0.1, 100.0);
  GL.matrixMode(GL.MODELVIEW);
  GL.loadIdentity();
}

let rot = 0;

function drawnQuad(textureid) {
  GL.bindTexture(GL.TEXTURE_2D, textureid);

  GL.begin(GL.QUADS);
  {
    GL.texCoord2f(0.0, 0.0);
    GL.vertex2f(-1.0, -1.0);
    GL.texCoord2f(1.0, 0.0);
    GL.vertex2f(1.0, -1.0);
    GL.texCoord2f(1.0, 1.0);
    GL.vertex2f(1.0, 1.0);
    GL.texCoord2f(0.0, 1.0);
    GL.vertex2f(-1.0, 1.0);
  }
  GL.end();
}

function onDrawCene() {
  GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
  GL.loadIdentity();
  GL.translatef(0.0, 0.0, -4.0);

  GL.pushMatrix();
  {
    GL.rotatef(++rot, 0.0, 1.0, 0.0);

    GL.translatef(0.0, 0.0, -1.0);
    GL.color4f(1.0, 1.0, 1.0, 1.0);
    drawnQuad(texture1?.id ?? 0);

    GL.disable(GL.BLEND);
    GL.translatef(0.0, 0.0, 1.0);
    GL.color4f(1.0, 1.0, 1.0, 1.0);
    drawnQuad(texture2?.id ?? 0);
    GL.enable(GL.BLEND);

    GL.translatef(0.0, 0.0, 1.0);
    GL.color4f(1.0, 1.0, 1.0, 1.0);
    drawnQuad(texture3?.id ?? 0);
  }
  GL.popMatrix();

  GLUT.swapBuffers();
}

async function main() {
  GLUT.init();
  GLUT.initDisplayMode(GLUT.DOUBLE | GLUT.DEPTH | GLUT.RGBA | GLUT.MULTISAMPLE);
  GLUT.initWindowPosition(50, 50);
  GLUT.initWindowSize(800, 600);
  GLUT.createWindow('Textura transparente');
  GLUT.reshapeFunc(onReSize);
  GLUT.displayFunc(onDrawCene);
  GLUT.idleFunc(onDrawCene);
  await initialize();
  GLUT.mainLoop();
}
main();
