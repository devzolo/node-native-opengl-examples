import GL from '@devzolo/node-native-gl';
import GLU from '@devzolo/node-native-glu';
import GLUT from '@devzolo/node-native-glut';
import { NativeSound } from '@devzolo/node-native-sound';
import path from 'path';

import { Benchmark } from '~/util';
import { drawBackground, drawCube, drawNode } from './elements';
import { clamp } from './utils';

const BANDS = 28;
const BANDSDIV2 = BANDS / 2;
const SPECHEIGHT = 30.0;

const BAND_COLOR: number[] = [];
const cubey: Record<number, number> = {};

enum MouseButtonInfo {
  BUTTON_LEFT,
  BUTTON_MIDDLE,
  BUTTON_RIGHT,
  BUTTON_LEFT_TRANSLATE,
}

let fps = 0;

let chan;
const mButton: Record<number, boolean> = {};
let mOldY, mOldX;
const eye = [0.0, 0.0, 1.5];
const rot = [0.0, 0.0, 0.0];
const keyDown: Record<string, boolean> = {};
const sKeyDown: Record<number, boolean> = {};
const mKeyDown: Record<number, boolean> = {};

let bTextured = true;
let bLighGL = false;
let sound: NativeSound;

const gamemode = false;

function updateSpectrum() {
  const fft = sound.getFFTData(2048);

  let b0 = 0;
  let y;

  for (let x = 0.0; x < BANDS; x++) {
    let sum = 0.0;
    let b1 = Math.round(Math.pow(2, (x * 10.0) / (BANDS - 1)));
    if (b1 > 1023) b1 = 1023;
    if (b1 <= b0) b1 = b0 + 1;
    const sc = 10 + b1 - b0;
    for (; b0 < b1; b0++) sum += fft[1 + b0];
    y = Math.sqrt(sum / Math.log(sc)) * 1.7 * SPECHEIGHT - 4;
    if (y > SPECHEIGHT) y = SPECHEIGHT;

    GL.pushMatrix();
    {
      if (y < cubey[Math.round(x)]) cubey[Math.round(x)] -= 0.005;
      else cubey[Math.round(x)] = y;
      drawCube(-(BANDSDIV2 * 3) + x * 3, 0.0, cubey[Math.round(x)] > 0.0 ? cubey[Math.round(x)] : 0.0);
    }
    GL.popMatrix();

    GL.pushMatrix();
    {
      drawNode(-(BANDSDIV2 * 3) + x * 3, 0.0, y > 0.0 ? y : 0.0);
    }
    GL.popMatrix();
  }
}

function onReSize(width: number, height: number): void {
  if (height == 0) height = 1;
  GL.viewport(0, 0, width, height);
  GL.matrixMode(GL.PROJECTION);
  GL.loadIdentity();
  GLU.perspective(45.0, width / height, 0.1, 100.0);
  GL.matrixMode(GL.MODELVIEW);
  GL.loadIdentity();
}

function initialize() {
  //g_font = CreateOutlineFont("Verdana",1,0.5,0.1,400,false,false,false,false);

  sound = new NativeSound(path.join(__dirname, '..', 'assets', 'music', 'test.mp3'));

  for (let i = 0; i < BANDS; i++) BAND_COLOR[i] = Math.random() * 0xffffffff;

  GL.clearColor(0.0, 0.0, 0.0, 0.0);
  GL.shadeModel(GL.SMOOTH);
  GL.enable(GL.DEPTH_TEST);
  GL.enable(GL.TEXTURE_2D);

  GL.disable(GL.LIGHTING);
  GL.enable(GL.LIGHT0);

  const lightpos = Float32Array.from([10.0, 10.0, 100.0, 0.0]);
  const lightcolor = Float32Array.from([1.0, 1.0, 1.0, 1.0, 0.0]);

  GL.lightfv(GL.LIGHT0, GL.POSITION, lightpos);
  GL.lightfv(GL.LIGHT0, GL.DIFFUSE, lightcolor);
  GL.lightfv(GL.LIGHT0, GL.SPECULAR, lightcolor);
}

function onKeyDown(key: string, x: number, y: number): void {
  switch (key) {
    case String.fromCharCode(27): {
      process.exit(0);
    }
    case '1': {
      bLighGL = !bLighGL;
      if (bLighGL) GL.enable(GL.LIGHTING);
      else GL.disable(GL.LIGHTING);
    }
    case '2':
      GL.polygonMode(GL.FRONT_AND_BACK, GL.POINT);
    case '3':
      GL.polygonMode(GL.FRONT_AND_BACK, GL.LINE);
    case '4':
      GL.polygonMode(GL.FRONT_AND_BACK, GL.FILL);
    case '5': {
      bTextured = !bTextured;
      if (bTextured) GL.enable(GL.TEXTURE_2D);
      else GL.disable(GL.TEXTURE_2D);
    }
  }
  keyDown[key] = true;
}

function onKeyUp(key: string, x: number, y: number): void {
  keyDown[key] = false;
}

function onSpecialKeyDown(key: number, x: number, y: number): void {
  sKeyDown[key] = true;
  switch (key) {
    case GLUT.KEY_F1: {
      GLUT.fullScreen();
    }
  }
}

function onSpecialKeyUp(key: number, x: number, y: number): void {
  sKeyDown[key] = false;
}

function onMousePress(button: number, newstate: number, x: number, y: number): void {
  mOldX = x;
  mOldY = y;
  switch (button) {
    case GLUT.LEFT_BUTTON:
      if (GLUT.getModifiers() === GLUT.ACTIVE_CTRL) {
        mButton[MouseButtonInfo.BUTTON_LEFT_TRANSLATE] = newstate == GLUT.DOWN ? true : false;
      } else {
        mButton[MouseButtonInfo.BUTTON_LEFT] = newstate == GLUT.DOWN ? true : false;
      }
    case GLUT.RIGHT_BUTTON:
      mButton[MouseButtonInfo.BUTTON_RIGHT] = newstate == GLUT.DOWN ? true : false;
    case GLUT.MIDDLE_BUTTON:
      mButton[MouseButtonInfo.BUTTON_MIDDLE] = newstate == GLUT.DOWN ? true : false;
  }
  mButton[button] = !newstate;
}

function onMotion(x: number, y: number): void {
  if (mButton[MouseButtonInfo.BUTTON_LEFT]) {
    rot[0] -= mOldY - y;
    rot[1] -= mOldX - x;
    for (let i = 0; i < 3; i++) rot[i] = clamp(rot[i]);
  } else if (mButton[MouseButtonInfo.BUTTON_RIGHT]) {
    eye[2] -= (mOldY - y) * 0.05;
    for (let i = 0; i < 3; i++) rot[i] = clamp(rot[i]);
  } else if (mButton[MouseButtonInfo.BUTTON_MIDDLE]) {
    eye[0] -= (x - mOldX) * 0.05;
    eye[1] -= -(y - mOldY) * 0.05;
  } else if (mButton[MouseButtonInfo.BUTTON_LEFT_TRANSLATE]) {
    eye[0] += (mOldX - x) * 0.01;
    eye[1] -= (mOldY - y) * 0.01;
    for (let i = 0; i < 3; i++) rot[i] = clamp(rot[i]);
  }
  mOldX = x;
  mOldY = y;
}

async function onDrawCene(): Promise<void> {
  GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
  GL.loadIdentity();

  //Camera
  GL.translatef(0.0, 0.0, -6.0);
  GL.translatef(-eye[0], -eye[1], -eye[2]);
  GL.rotatef(rot[0], 1.0, 0.0, 0.0);
  GL.rotatef(rot[1], 0.0, 0.0, 1.0);
  GL.rotatef(rot[2], 0.0, 1.0, 0.0);
  GL.scalef(0.05, 0.05, 0.05);

  drawBackground();
  updateSpectrum();

  //drawText(g_font, FPS(), -0.98, 0.94, 0.05);

  GLUT.swapBuffers();
  //FPS();
}

async function main(): Promise<void> {
  const width = 800;
  const height = 600;

  GLUT.init();
  GLUT.initDisplayMode(GLUT.DOUBLE | GLUT.DEPTH | GLUT.RGBA | GLUT.MULTISAMPLE);

  if (gamemode) {
    GLUT.gameModeString('800x600:32@60');
    GLUT.enterGameMode();
  } else {
    GLUT.initWindowSize(width, height);
    GLUT.initWindowPosition(100, 100);
    GLUT.createWindow('Spectrum 3D');
  }

  GLUT.reshapeFunc(onReSize);
  GLUT.displayFunc(onDrawCene);
  GLUT.idleFunc(onDrawCene);

  const benchmarkFps = new Benchmark();
  const benchmarkDisplay = new Benchmark();

  GLUT.idleFunc(() => {
    if (benchmarkFps.elapsed() >= 1000) {
      benchmarkFps.start();
      console.log('FPS = ', fps);
      GLUT.setWindowTitle(`Teste OpenGL - FPS: ${fps}`);
      fps = 0;
    }

    if (benchmarkDisplay.elapsed() >= 1000 / 60) {
      benchmarkDisplay.start();
    }
    onDrawCene();
    fps++;
  });

  GLUT.keyboardFunc(onKeyDown);
  GLUT.keyboardUpFunc(onKeyUp);
  GLUT.specialFunc(onSpecialKeyDown);
  GLUT.specialUpFunc(onSpecialKeyUp);
  GLUT.mouseFunc(onMousePress);
  GLUT.motionFunc(onMotion);

  initialize();

  GLUT.mainLoop();
}

main();
