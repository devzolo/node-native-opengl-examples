import GL from '@devzolo/node-native-gl';
import GLU from '@devzolo/node-native-glu';
import GLUT from '@devzolo/node-native-glut';

enum MouseButtonInfo {
  BUTTON_LEFT,
  BUTTON_RIGHT,
  BUTTON_LEFT_TRANSLATE,
}

const mButton: Record<number, boolean> = [];

let mOldY = 0;
let mOldX = 0;

const eye: number[] = [0.0, 0.0, 1.5];
const rot: number[] = [0.0, 0.0, 0.0];

function clamp(v: number) {
  if (v > 360) v = 0;
  else if (v < 0) v = 360;
  return v;
}

const luzAmbiente = Float32Array.from([0.2, 0.2, 0.2, 1.0]);

//Posições das fontes de luz
const posLuz = [
  Float32Array.from([10.0, 30.0, 10.0, 1.0]),
  Float32Array.from([-10.0, 30.0, 10.0, 1.0]),
  Float32Array.from([0.0, 30.0, -10.0, 1.0]),
];

//Direção das fontes de luz
const dirLuz = [
  Float32Array.from([0.0, -1.0, 0.0]),
  Float32Array.from([0.0, -1.0, 0.0]),
  Float32Array.from([0.0, -1.0, 0.0]),
];

//Cores difusas
const luzDifusa = [
  Float32Array.from([1.0, 0.0, 0.0, 1.0]),
  Float32Array.from([0.0, 1.0, 0.0, 1.0]),
  Float32Array.from([0.0, 0.0, 1.0, 1.0]),
];

//Cores especulares
const luzEspecular = [
  Float32Array.from([1.0, 0.0, 0.0, 1.0]),
  Float32Array.from([0.0, 1.0, 0.0, 1.0]),
  Float32Array.from([0.0, 0.0, 1.0, 1.0]),
];

function defineIluminacao() {
  for (let i = 0; i < 3; i++) {
    GL.lightfv(GL.LIGHT0 + i, GL.AMBIENT, luzAmbiente);
    GL.lightfv(GL.LIGHT0 + i, GL.DIFFUSE, luzDifusa[i]);
    GL.lightfv(GL.LIGHT0 + i, GL.SPECULAR, luzEspecular[i]);
    GL.lightfv(GL.LIGHT0 + i, GL.POSITION, posLuz[i]);
    GL.lightfv(GL.LIGHT0 + i, GL.SPOT_DIRECTION, dirLuz[i]);
    GL.lightf(GL.LIGHT0 + i, GL.SPOT_CUTOFF, 40.0);
    GL.lightf(GL.LIGHT0 + i, GL.SPOT_EXPONENT, 10.0);
  }
}

let chaoList = 0;

function desenhaChao() {
  const tam = 1000;
  const D = 4;
  let flagx = false;
  let flagz = false;
  GL.normal3f(0.0, 1.0, 0.0);

  GL.begin(GL.QUADS);
  {
    flagx = false;
    for (let x = -tam; x < tam; x += D) {
      if (flagx) flagz = false;
      else flagz = true;
      for (let z = -tam; z < tam; z += D) {
        if (flagz) GL.color3f(0.4, 0.4, 0.4);
        else GL.color3f(1.0, 1.0, 1.0);
        GL.vertex3f(x, 0, z);
        GL.vertex3f(x + D, 0, z);
        GL.vertex3f(x + D, 0, z + D);
        GL.vertex3f(x, 0, z + D);
        flagz = !flagz;
      }
      flagx = !flagx;
    }
  }
  GL.end();
}

function onDisplay() {
  GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
  GL.loadIdentity();

  //Setup default camera
  GL.translatef(-eye[0], -eye[1], -6.0 - eye[2]);
  GL.rotatef(rot[0], 1.0, 0.0, 0.0);
  GL.rotatef(rot[1], 0.0, 1.0, 0.0);
  GL.rotatef(rot[2], 0.0, 0.0, 1.0);
  GL.scalef(0.05, 0.05, 0.05);

  defineIluminacao();

  GL.disable(GL.LIGHTING);
  for (let i = 0; i < 3; i++) {
    GL.pushMatrix();
    {
      GL.translatef(posLuz[i][0], posLuz[i][1], posLuz[i][2]);
      GL.color3f(luzDifusa[i][0], luzDifusa[i][1], luzDifusa[i][2]);
      GLUT.solidSphere(1, 5, 5);
    }
    GL.popMatrix();
  }
  GL.enable(GL.LIGHTING);

  GL.color3f(1.0, 1.0, 1.0);

  GL.pushMatrix();
  {
    GL.translatef(0.0, 7.5, 0.0);
    // GLUT.solidTeapot(10);
    GLUT.wireTeapot(10);
  }
  GL.popMatrix();

  if (chaoList === 0) {
    chaoList = GL.genLists(1);
    GL.newList(chaoList, GL.COMPILE);
    desenhaChao();
    GL.endList();
  }
  GL.callList(chaoList);

  GLUT.swapBuffers();
}

function onReshape(width: number, height: number) {
  if (height === 0) height = 1;
  GL.viewport(0, 0, width, height);
  GL.matrixMode(GL.PROJECTION);
  GL.loadIdentity();

  GLU.perspective(45, width / height, 0.1, 100.0);
  GL.matrixMode(GL.MODELVIEW);
  GL.loadIdentity();
}

function onMousePress(button: number, newState: number, x: number, y: number) {
  mOldX = x;
  mOldY = y;
  switch (button) {
    case GLUT.LEFT_BUTTON:
      if (GLUT.getModifiers() == GLUT.ACTIVE_CTRL) {
        mButton[MouseButtonInfo.BUTTON_LEFT_TRANSLATE] = newState === GLUT.DOWN;
      } else {
        mButton[MouseButtonInfo.BUTTON_LEFT] = newState === GLUT.DOWN;
      }
      break;
    case GLUT.RIGHT_BUTTON:
      mButton[MouseButtonInfo.BUTTON_RIGHT] = newState === GLUT.DOWN;
      break;
    default:
      break;
  }
}

function onMotion(x: number, y: number) {
  if (mButton[MouseButtonInfo.BUTTON_LEFT]) {
    rot[0] -= mOldY - y;
    rot[1] -= mOldX - x;
    for (let i = 0; i < 3; i++) rot[i] = clamp(rot[i]);
  } else if (mButton[MouseButtonInfo.BUTTON_RIGHT]) {
    eye[2] -= (mOldY - y) * 0.05;
    for (let i = 0; i < 3; i++) rot[i] = clamp(rot[i]);
  } else if (mButton[MouseButtonInfo.BUTTON_LEFT_TRANSLATE]) {
    eye[0] += mOldX - x * 0.01;
    eye[1] -= mOldY - y * 0.01;
    for (let i = 0; i < 3; i++) rot[i] = clamp(rot[i]);
  }
  mOldX = x;
  mOldY = y;
}

function initialize() {
  GL.shadeModel(GL.SMOOTH);
  GL.clearColor(0.0, 0.0, 0.0, 5.0);
  GL.enable(GL.COLOR_MATERIAL);
  GL.enable(GL.LIGHTING);
  GL.enable(GL.LIGHT0);
  GL.enable(GL.LIGHT1);
  GL.enable(GL.LIGHT2);
  GL.enable(GL.DEPTH_TEST);
  GL.depthFunc(GL.LEQUAL);
  GL.hint(GL.PERSPECTIVE_CORRECTION_HINT, GL.NICEST);
}

async function main(): Promise<void> {
  GLUT.init();
  GLUT.initDisplayMode(GLUT.DOUBLE | GLUT.DEPTH | GLUT.RGBA | GLUT.MULTISAMPLE);
  GLUT.initWindowPosition(50, 50);
  GLUT.initWindowSize(800, 600);
  GLUT.createWindow('Luz Spot');

  GLUT.idleFunc(onDisplay);
  GLUT.displayFunc(onDisplay);
  GLUT.reshapeFunc(onReshape);
  GLUT.mouseFunc(onMousePress);
  GLUT.motionFunc(onMotion);

  initialize();

  GLUT.mainLoop();
}

main();
