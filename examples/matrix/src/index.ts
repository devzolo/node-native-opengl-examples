import GL from '@devzolo/node-native-gl';
import GLU from '@devzolo/node-native-glu';
import GLUT from '@devzolo/node-native-glut';
import { Benchmark } from '~/util';
import path from 'path';
import { Texture } from '~/util/Texture';

const WINDOW_WIDTH = 800;
const WINDOW_HEIGHT = 600;

const ESC = 27;

let base: number;
let texture = 0;
const map: number[][] = [];
const brmap: number[][] = [];
const nmap: number[][] = [];
const speedmap: number[][] = [];
let fMove = 0;
let Tick1 = 0;
let Tick2 = 0;

function BuildFont() {
  base = GL.genLists(256);
  let cx = 0;
  let cy = 0;
  for (let loop = 0.0; loop < 256; loop++) {
    cx = Math.round(loop % 16) / 16;
    cy = Math.round(loop / 16) / 16;
    GL.newList(base + loop, GL.COMPILE);
    {
      GL.begin(GL.TRIANGLE_STRIP);
      {
        GL.texCoord2f(cx, 1.0 - cy - 0.0625);
        GL.vertex3f(0.0, 0.0, 0.0);
        GL.texCoord2f(cx + 0.0625, 1.0 - cy - 0.0625);
        GL.vertex3f(1.0, 0.0, 0.0);
        GL.texCoord2f(cx, 1.0 - cy);
        GL.vertex3f(0.0, 1.0, 0.0);
        GL.texCoord2f(cx + 0.0625, 1.0 - cy);
        GL.vertex3f(1.0, 1.0, 0.0);
      }
      GL.end();
    }
    GL.endList();
  }
}

async function LoadGLTextures() {
  texture = await Texture.load(path.join(__dirname, 'Font.jpg')).then(texture => texture.id);
  console.log('LoadGLTextures', texture);
}

function LoadLevel() {
  for (let y = 0; y < 40; y++) {
    for (let x = 0; x < 50; x++) {
      const i = random(10);
      if (i < 2) {
        if (!map[x]) map[x] = [];
        map[x][y] = 0;
      } else {
        if (!map[x]) map[x] = [];
        map[x][y] = random(256);
      }
      if (!brmap[x]) brmap[x] = [];
      brmap[x][y] = 0.35 + random(51) / 100;
      if (!nmap[x]) nmap[x] = [];
      nmap[x][y] = random(5) - 2;
      if (!speedmap[x]) speedmap[x] = [];
      speedmap[x][0] = 1 + random(5);
      speedmap[x][1] = 0;
    }
  }
  Tick1 = Tick2 = Date.now();
}

async function Initialize() {
  BuildFont();
  await LoadGLTextures();
  LoadLevel();
}

function glSetChar(ch) {
  GL.callList(base + ch - 32);
}

function RenderScene() {
  GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

  GL.loadIdentity();
  GL.bindTexture(GL.TEXTURE_2D, texture);
  GL.color4f(0.0, 0.5, 0.0, 0.75);
  GL.translatef(-20.0, -20.0, -36.0 + fMove);

  for (let y = 0; y < 40; y++) {
    for (let x = 0; x < 50; x++) {
      if (brmap[x][y] < 0.75) {
        GL.color4f(0.0, 0.5, 0.0, brmap[x][y]);
      } else {
        GL.color4f(brmap[x][y] / 2, brmap[x][y], brmap[x][y] / 2, 0.75);
      }
      glSetChar(map[x][y]);
      GL.translatef(0.0, 0.0, 40.0);
      glSetChar(map[x][y]);
      GL.translatef(0.0, 0.0, 40);
      glSetChar(map[x][y]);
      GL.translatef(0.0, 0.0, 40);
      glSetChar(map[x][y]);
      GL.translatef(0.0, 0.0, 40);
      glSetChar(map[x][y]);
      GL.translatef(0.0, 0.0, 40);
      glSetChar(map[x][y]);
      GL.translatef(0.8, 0.0, -200.0);
    }
    GL.translatef(-40, 1.0, 0.0);
  }
  GLUT.swapBuffers();
}

function random(value: number) {
  return Math.ceil(Math.random() * value);
}

let DTick = 0;
function ProcessLevel() {
  Tick1 = Tick2;
  Tick2 = Date.now();
  DTick += Tick2 - Tick1;
  fMove -= 0.005 * (Tick2 - Tick1);

  if (fMove < -200.0) fMove = -120.0;

  if (DTick > 25) {
    DTick -= 25;
    for (let x = 0; x < 50; x++) {
      let m;
      speedmap[x][1]++;
      if (speedmap[x][1] > speedmap[x][0]) {
        speedmap[x][1] = 0;
        m = 1;
      } else m = 0;

      for (let y = 0; y < 40; y++) {
        if (m) {
          map[x][y] = map[x][y + 1];
          brmap[x][y] = brmap[x][y + 1];
          nmap[x][y] = nmap[x][y + 1];
        }
        brmap[x][y] += Number(nmap[x][y]) * 0.01;
        if (brmap[x][y] > 0.95 || brmap[x][y] < 0.05) nmap[x][y] = nmap[x][y] * -1;
      }
    }
    for (let x = 0; x < 50; x++) {
      let i = random(1000);
      if (i < 300) {
        map[x][40] = 0;
        if (random(10) < 2) speedmap[x][0] = 1 + random(5);
      } else {
        if (i == 300 && x < 40) {
          let f = random(5) - 2;
          brmap[x][40] = 1.0;
          nmap[x][40] = f;
          map[x++][40] = 'D'.charCodeAt(0);
          brmap[x][40] = 1.0;
          nmap[x][40] = f;
          map[x++][40] = 'E'.charCodeAt(0);
          brmap[x][40] = 1.0;
          nmap[x][40] = f;
          map[x++][40] = 'V'.charCodeAt(0);
          brmap[x][40] = 1.0;
          nmap[x][40] = f;
          map[x++][40] = 'Z'.charCodeAt(0);
          brmap[x][40] = 1.0;
          nmap[x][40] = f;
          map[x++][40] = 'O'.charCodeAt(0);
          brmap[x][40] = 1.0;
          nmap[x][40] = f;
          map[x++][40] = 'L'.charCodeAt(0);
          brmap[x][40] = 1.0;
          nmap[x][40] = f;
          map[x][40] = 'O'.charCodeAt(0);
        } else {
          map[x][40] = random(256);
          brmap[x][40] = 0.35 + random(51) / 100.0;
          nmap[x][40] = random(5) - 2;
        }
      }
    }
  }
  RenderScene();
}

function OnDrawCene() {
  ProcessLevel();
}

function OnReSize(width: number, height: number) {
  if (height === 0) height = 1;
  GL.enable(GL.TEXTURE_2D);
  GL.enable(GL.BLEND);
  GL.blendFunc(GL.SRC_ALPHA, GL.ONE);
  GL.cullFace(GL.BACK);
  GL.enable(GL.CULL_FACE);
  GL.viewport(0, 0, width, height);
  GL.matrixMode(GL.PROJECTION);
  GL.loadIdentity();
  GLU.perspective(45.0, width / height, 1.0, 1500.0);
  GL.matrixMode(GL.MODELVIEW);
  GL.loadIdentity();
}

function OnKeyPress(key: string, x: number, y: number) {
  switch (key.charCodeAt(0)) {
    case ESC:
      process.exit(0);
    default:
      break;
  }
}

const benchmarkFps = new Benchmark();
const benchmarkDisplay = new Benchmark();

let fps = 0;

async function main() {
  GLUT.init();
  GLUT.initDisplayMode(GLUT.DOUBLE | GLUT.DEPTH | GLUT.RGBA | GLUT.MULTISAMPLE);
  GLUT.initWindowPosition(50, 50);
  GLUT.initWindowSize(WINDOW_WIDTH, WINDOW_HEIGHT);
  GLUT.createWindow('Matrix');
  await Initialize();
  GLUT.displayFunc(OnDrawCene);
  GLUT.reshapeFunc(OnReSize);
  GLUT.keyboardFunc(OnKeyPress);
  GLUT.idleFunc(OnDrawCene);
  GLUT.mainLoop();

  GLUT.idleFunc(() => {
    if (benchmarkFps.elapsed() >= 1000) {
      benchmarkFps.start();
      console.log('FPS = ', fps);
      GLUT.setWindowTitle(`Teste OpenGL - FPS: ${fps}`);
      fps = 0;
    }

    if (benchmarkDisplay.elapsed() >= 1000 / 60) {
      benchmarkDisplay.start();
      OnDrawCene();
      fps++;
    }
  });
}

main();
