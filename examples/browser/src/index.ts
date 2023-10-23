import GL from '@devzolo/node-native-gl';
import GLU from '@devzolo/node-native-glu';
import GLUT from '@devzolo/node-native-glut';
import GLM from '@devzolo/node-native-glm';
import { NativeBrowser, NativeBrowserUpdate, eKeyEventType } from '@devzolo/node-native-browser';
import { watchFile } from 'fs';
import { Camera, CameraMovement } from './camera';
import { compilaShaders, Benchmark } from 'utils';

const camera = new Camera(new GLM.vec3(0, 0, -3));
let shader: number;

let vertexArrayId: number;
let vertexbuffer: number;
let gVertexBufferData: Float32Array;

const keys: Record<string, boolean> = {
  w: false,
  s: false,
  a: false,
  d: false,
};

const keyboardHandler = (key: string, x: number, y: number) => {
  keys[key.toLowerCase()] = true;
};

const keyboardUpHandler = (key: string, x: number, y: number) => {
  keys[key.toLowerCase()] = false;
};

function isKeyPressed(key: string) {
  return keys[key];
}

let lastX = 800 / 2.0;
let lastY = 600 / 2.0;
let firstMouse = true;
const mouseHandler = (x: number, y: number) => {
  if (firstMouse) {
    lastX = x;
    lastY = y;
    firstMouse = false;
  }

  const xoffset = x - lastX;
  const yoffset = lastY - y; // reversed since y-coordinates go from bottom to top

  lastX = x;
  lastY = y;

  camera.processMouseMovement(xoffset, yoffset);
};
const updateCamera = () => {
  const deltaTime = -(60 / 1000);
  if (isKeyPressed('w')) {
    camera.processKeyboard(CameraMovement.FORWARD, deltaTime);
  }

  if (isKeyPressed('s')) {
    camera.processKeyboard(CameraMovement.BACKWARD, deltaTime);
  }

  if (isKeyPressed('a')) {
    camera.processKeyboard(CameraMovement.LEFT, deltaTime);
  }

  if (isKeyPressed('d')) {
    camera.processKeyboard(CameraMovement.RIGHT, deltaTime);
  }
};

const benchmarkFps = new Benchmark();
const benchmarkDisplay = new Benchmark();

let fps = 0;

const browsers: Record<string, NativeBrowser> = {};
let drawBackgroundList!: number;

export function drawBackground() {
  const NUM_LINES = 200.0;
  const NUM_LINESDIV2 = NUM_LINES / 2;

  if (!drawBackgroundList) {
    drawBackgroundList = GL.genLists(1);
    GL.newList(drawBackgroundList, GL.COMPILE);

    GL.disable(GL.TEXTURE_2D);
    GL.color4f(0.0, 1.0, 0.0, 0.0);
    GL.begin(GL.LINES);
    {
      const y = -1.0;
      for (let i = 0.0; i <= NUM_LINES; i += 0.3) {
        GL.vertex3f(-NUM_LINESDIV2 + i, y, NUM_LINESDIV2);
        GL.vertex3f(-NUM_LINESDIV2 + i, y, -NUM_LINESDIV2);

        GL.vertex3f(NUM_LINESDIV2, y, -NUM_LINESDIV2 + i);
        GL.vertex3f(-NUM_LINESDIV2, y, -NUM_LINESDIV2 + i);
      }
    }
    GL.end();
    GL.enable(GL.TEXTURE_2D);
    GL.color4f(1.0, 1.0, 1.0, 1.0);

    GL.endList();
  }
  GL.callList(drawBackgroundList);
}

const file = `${__dirname}/index.html`;
//detect changes on file

watchFile(file, (curr, prev) => {
  if (curr.mtimeMs === prev.mtimeMs) {
    return;
  }
  browsers[file].loadURL(file);
});

// const prog = 0;
// let posLoc = -1;
// let texcoordLoc = -1;
// let texLoc = -1;
// let mvpLoc = -1;

// setInterval(() => {
//   for (const browser of Object.values(browsers)) {
//     browser.executeJavascript(`
//       console.clear()
//     `);
//   }
// }, 1000);
async function initialize() {
  if (GL.init() != GL.OK) {
    console.log('*** GLEW FAIL.');
    return false;
  }

  // Verifica se há suporte para as extensões GLSL
  if (!GL.isSupported('GL_ARB_vertex_shader') || !GL.isSupported('GL_ARB_fragment_shader')) {
    console.log('*** Hardware não suporta GLSL');
    return false;
  }

  // prog = compilaShaders(path.join(__dirname, 'shaders', 'tex.vert'), path.join(__dirname, 'shaders', 'tex.frag'));
  // posLoc = GL.getAttribLocation(prog, 'a_position');
  // texcoordLoc = GL.getAttribLocation(prog, 'a_texcoord');
  // texLoc = GL.getUniformLocation(prog, 's_tex');
  // mvpLoc = GL.getUniformLocation(prog, 'u_mvp');

  GL.shadeModel(GL.SMOOTH);
  // GL.clearColor(0.0, 0.0, 0.0, 1.0);
  // GL.clearDepth(1.0);
  GL.hint(GL.PERSPECTIVE_CORRECTION_HINT, GL.NICEST);
  // GL.enable(GL.DEPTH_TEST);
  // GL.enable(GL.BLEND);
  // GL.blendFunc(GL.SRC_COLOR, GL.ONE_MINUS_SRC_ALPHA);
  // GL.alphaFunc(GL.GREATER, 0.1);

  // Texture.load(path.join(__dirname, '..', 'src', 'assets', 'textures', 'grille.png')).then(texture => {
  //   texture2 = texture.id;
  // });

  const width = 800;
  const height = 800;
  const data = [
    { url: 'https://github.com/rms-diego' },
    { url: 'https://github.com/rafz' },
    { url: 'https://github.com/devzolo' },
    { url: `${__dirname}/index.html` },
  ];

  for (const item of data) {
    const browser = new NativeBrowser({
      hwnd: GLUT.getWindowHandle(),
      transparent: true,
      onCreated: () => {
        browser.resize(width, height);
        browser.loadURL(item.url);
      },
    });
    browsers[item.url] = browser;
  }
}

function onReSize(width: number, height: number) {
  (globalThis as any).width = width;
  (globalThis as any).height = height;
  GL.viewport(0, 0, width, height); //seleciona a area da janela
  GL.matrixMode(GL.PROJECTION); //seleciona a matriz de projeção
  GL.loadIdentity(); //reseta a matriz de projeção
  GLU.perspective(45.0, width / height, 0.1, 100.0); //seleciona a perspectiva
  GL.matrixMode(GL.MODELVIEW); //seleciona a matriz de visualização
}

let rot = 0;

function drawnQuad(textureid: number) {
  //GL.useProgram(prog);
  //GL.uniformMatrix4fv(mvpLoc, 1, GL.FALSE, Float32Array.from([-1, 1, -1, 1]));
  // GL.enableVertexAttribArray(posLoc);
  // GL.enableVertexAttribArray(texcoordLoc);

  GL.bindTexture(GL.TEXTURE_2D, textureid);

  // const vertices = Float32Array.from([-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0]);
  // const texcoords = Float32Array.from([0, 1, 1, 1, 0, 0, 1, 0]);

  // GL.vertexAttribPointer(posLoc, 3, GL.FLOAT, GL.FALSE, 0, vertices);
  // GL.vertexAttribPointer(texcoordLoc, 2, GL.FLOAT, GL.FALSE, 0, texcoords);

  GL.enable(GL.BLEND);
  GL.enable(GL.DEPTH_TEST);
  GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);

  GL.begin(GL.QUADS);
  {
    GL.normal3f(0.0, 0.0, 1.0);
    GL.texCoord2f(0.0, 1.0);
    GL.vertex3f(-1.0, -1.0, 1.0);

    GL.normal3f(0.0, 0.0, 1.0);
    GL.texCoord2f(1.0, 1.0);
    GL.vertex3f(1.0, -1.0, 1.0);

    GL.normal3f(0.0, 0.0, 1.0);
    GL.texCoord2f(1.0, 0.0);
    GL.vertex3f(1.0, 1.0, 1.0);

    GL.normal3f(0.0, 0.0, 1.0);
    GL.texCoord2f(0.0, 0.0);
    GL.vertex3f(-1.0, 1.0, 1.0);
  }
  GL.end();
  //GL.disable(GL.BLEND);
}

function onDrawCene() {
  GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

  GL.useProgram(shader);
  const projection = GLM.perspective(
    GLM.radians(camera.zoom),
    ((globalThis as any).width ?? 800) / ((globalThis as any).height ?? 600),
    0.1,
    1000.0,
  );
  const view = camera.getViewMatrix();

  GL.uniformMatrix4fv(GL.getUniformLocation(shader, 'projection'), 1, false, projection.getAsFloat32Array());
  GL.uniformMatrix4fv(GL.getUniformLocation(shader, 'view'), 1, false, view.getAsFloat32Array());

  GL.bindBuffer(GL.ARRAY_BUFFER, vertexbuffer);
  GL.enableVertexAttribArray(0);
  GL.vertexAttribPointer(
    0, // attribute. No particular reason for 0, but must match the layout in the shader.
    3, // size
    GL.FLOAT, // type
    false, // normalized?
    0, // stride
    // Float32Array.from([]),
  );
  for (const browser in browsers) {
    GL.bindTexture(GL.TEXTURE_2D, browsers[browser].getTextureId());
    GL.enable(GL.BLEND);
    GL.enable(GL.DEPTH_TEST);
    GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);
    for (let x = 1; x < 5; x++) {
      for (let y = 1; y < 5; y++) {
        for (let z = 1; z < 5; z++) {
          let model = new GLM.mat4();
          model = GLM.translate(model, new GLM.vec3(x * 3, y * 3, z * 3));
          GL.uniformMatrix4fv(GL.getUniformLocation(shader, 'model'), 1, false, model.getAsFloat32Array());
          GL.drawArrays(GL.TRIANGLES, 0, 12 * 3);
        }
      }
    }
  }

  GL.disableVertexAttribArray(0);
  GL.useProgram(0);

  //GL.clearColor(0.2, 0.2, 0.2, 1.0);
  GL.loadIdentity();
  GL.translatef(0.0, 0.0, -4.0);
  GL.enable(GL.BLEND);
  GL.pushMatrix();
  {
    rot += 0.3;
    GL.rotatef(rot, 0.0, 1.0, 0.0);

    GL.translatef(0.0, 0.0, -0.5);
    // GL.color4f(1.0, 1.0, 1.0, 1.0);

    //

    for (const browser in browsers) {
      GL.translatef(0.0, 0.0, -0.5);
      drawnQuad(browsers[browser].getTextureId());
    }
  }
  GL.popMatrix();
  GL.disable(GL.BLEND);

  drawBackground();

  GLUT.swapBuffers();
}

function keyboardFunc(key: string, x: number, y: number) {
  keyboardHandler(key, x, y);
  const windowKeyCode = key.charCodeAt(0);
  const keyCode = key.charCodeAt(0);
  const modifiers = 0;
  const isSystemKey = false;
  const type = eKeyEventType.KEYEVENT_KEYDOWN;
  for (const browser of Object.values(browsers)) {
    browser.injectKeyboardEvent(windowKeyCode, keyCode, modifiers, isSystemKey, type);
  }
}

function keyboardUpFunc(key: string, x: number, y: number) {
  keyboardUpHandler(key, x, y);
  const windowKeyCode = key.charCodeAt(0);
  const keyCode = key.charCodeAt(0);
  const modifiers = 0;
  const isSystemKey = false;
  const type = eKeyEventType.KEYEVENT_KEYUP;
  for (const browser of Object.values(browsers)) {
    browser.injectKeyboardEvent(windowKeyCode, keyCode, modifiers, isSystemKey, type);
  }
}

let devToolsOpened = false;

function specialFunc(key: number) {
  switch (key) {
    case GLUT.KEY_F5:
      for (const browser of Object.values(browsers)) {
        browser.reloadPage(true);
      }
      break;
    case GLUT.KEY_F12:
      for (const browser of Object.values(browsers)) {
        devToolsOpened = !devToolsOpened;
        browser.toggleDevTools(devToolsOpened);
      }
      break;
    case GLUT.KEY_F11:
      for (const browser of Object.values(browsers)) {
        browser.executeJavascript(`
          var video = document.getElementsByTagName('video')[0];
          if (video) {
            video.requestFullscreen();
          }
        `);
      }
      break;
  }
}

function specialUpFunc(key: number) {
  switch (key) {
    case GLUT.KEY_F12:
      for (const browser of Object.values(browsers)) {
        devToolsOpened = !devToolsOpened;
        browser.toggleDevTools(devToolsOpened);
      }
      break;
  }
}
function initGL() {
  shader = compilaShaders(__dirname + '/shaders/flatcolor.vert', __dirname + '/shaders/flatcolor.frag');

  vertexArrayId = GL.genVertexArrays(1);
  GL.bindVertexArray(vertexArrayId);

  gVertexBufferData = Float32Array.from([
    -1.0,
    -1.0,
    -1.0, // triangle 1 : begin
    -1.0,
    -1.0,
    1.0,
    -1.0,
    1.0,
    1.0, // triangle 1 : end
    1.0,
    1.0,
    -1.0, // triangle 2 : begin
    -1.0,
    -1.0,
    -1.0,
    -1.0,
    1.0,
    -1.0, // triangle 2 : end
    1.0,
    -1.0,
    1.0,
    -1.0,
    -1.0,
    -1.0,
    1.0,
    -1.0,
    -1.0,
    1.0,
    1.0,
    -1.0,
    1.0,
    -1.0,
    -1.0,
    -1.0,
    -1.0,
    -1.0,
    -1.0,
    -1.0,
    -1.0,
    -1.0,
    1.0,
    1.0,
    -1.0,
    1.0,
    -1.0,
    1.0,
    -1.0,
    1.0,
    -1.0,
    -1.0,
    1.0,
    -1.0,
    -1.0,
    -1.0,
    -1.0,
    1.0,
    1.0,
    -1.0,
    -1.0,
    1.0,
    1.0,
    -1.0,
    1.0,
    1.0,
    1.0,
    1.0,
    1.0,
    -1.0,
    -1.0,
    1.0,
    1.0,
    -1.0,
    1.0,
    -1.0,
    -1.0,
    1.0,
    1.0,
    1.0,
    1.0,
    -1.0,
    1.0,
    1.0,
    1.0,
    1.0,
    1.0,
    1.0,
    -1.0,
    -1.0,
    1.0,
    -1.0,
    1.0,
    1.0,
    1.0,
    -1.0,
    1.0,
    -1.0,
    -1.0,
    1.0,
    1.0,
    1.0,
    1.0,
    1.0,
    -1.0,
    1.0,
    1.0,
    1.0,
    -1.0,
    1.0,
  ]);

  vertexbuffer = GL.genBuffers(1);
  GL.bindBuffer(GL.ARRAY_BUFFER, vertexbuffer);
  GL.bufferData(GL.ARRAY_BUFFER, gVertexBufferData.length * 4, gVertexBufferData, GL.STATIC_DRAW);
  GL.bindBuffer(GL.ARRAY_BUFFER, 0);
}

async function main() {
  GLUT.init();
  GLUT.initDisplayMode(GLUT.DOUBLE | GLUT.DEPTH | GLUT.RGBA | GLUT.MULTISAMPLE);
  GLUT.initWindowPosition(50, 50);
  GLUT.initWindowSize(800, 600);
  GLUT.createWindow('Textura transparente');
  GLUT.reshapeFunc(onReSize);
  GLUT.displayFunc(onDrawCene);
  GLUT.keyboardFunc(keyboardFunc);
  GLUT.keyboardUpFunc(keyboardUpFunc);
  GLUT.specialFunc(specialFunc);
  GLUT.specialUpFunc(specialUpFunc);
  GLUT.passiveMotionFunc(mouseHandler);

  GLUT.idleFunc(() => {
    if (benchmarkFps.elapsed() >= 1000) {
      benchmarkFps.start();
      console.log('FPS = ', fps);
      GLUT.setWindowTitle(`Teste OpenGL - FPS: ${fps}`);
      fps = 0;
    }

    if (benchmarkDisplay.elapsed() >= 1000 / 60) {
      benchmarkDisplay.start();
      NativeBrowserUpdate();
      onDrawCene();
      updateCamera();
      fps++;
    }
  });

  await initialize();
  initGL();
  GLUT.mainLoop();
}
main();
