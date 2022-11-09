import GL from "@devzolo/node-native-gl";
import GLU from "@devzolo/node-native-glu";
import GLUT from "@devzolo/node-native-glut";
import glm from "@devzolo/node-native-glm";
import { Shader, Texture, Window } from "./core";
import { Camera, CameraMovement } from "./core";
import path from "path";
import gVertexBufferData from "./models/buffers/BoxVertexBufferData";
import { eKeyEventType, NativeBrowser, NativeBrowserUpdate } from "@devzolo/node-native-browser"

let texture1: Texture;
let browser: NativeBrowser;
let vertexArrayId = 0;
let vertexbuffer: number = 0;

let camera = new Camera(new glm.vec3(0.0, 0.0, 3.0));
let shader = new Shader();

let keys: Record<string, boolean> = {
  w: false,
  s: false,
  a: false,
  d: false
};

let lastX = 800 / 2.0;
let lastY = 600 / 2.0;
let firstMouse = true;
let warpingMouse = false;

const onMouseMove = (x: number, y: number) => {

  if (firstMouse) {
    lastX = x;
    lastY = y;
    firstMouse = false;
  }

  let xoffset = x - lastX;
  let yoffset = lastY - y; // reversed since y-coordinates go from bottom to top

  lastX = x;
  lastY = y;

  camera.processMouseMovement(xoffset, yoffset);
}

const onKeyboard = (key: string, x: number, y: number) => {
  keys[key.toLowerCase()] = true;

  const windowKeyCode = key.charCodeAt(0);
  const keyCode = key.charCodeAt(0);
  const modifiers = 0;
  const isSystemKey = false;
  const type = eKeyEventType.KEYEVENT_KEYDOWN;
  browser.injectKeyboardEvent(windowKeyCode, keyCode, modifiers, isSystemKey, type);
}

const onKeyboardUp = (key: string, x: number, y: number) => {
  keys[key.toLowerCase()] = false;

  const windowKeyCode = key.charCodeAt(0);
  const keyCode = key.charCodeAt(0);
  const modifiers = 0;
  const isSystemKey = false;
  const type = eKeyEventType.KEYEVENT_KEYUP;
  browser.injectKeyboardEvent(windowKeyCode, keyCode, modifiers, isSystemKey, type);
}

let devToolsOpened = false;

function onSpecial(key: number) {
  switch (key) {
    case GLUT.KEY_F5:
      browser.reloadPage(true);
      break;
    case GLUT.KEY_F12:
      devToolsOpened = !devToolsOpened;
      browser.toggleDevTools(devToolsOpened);
      break;
    case GLUT.KEY_F11:
      browser.executeJavascript(`
          var video = document.getElementsByTagName('video')[0];
          if (video) {
            video.requestFullscreen();
          }
        `);
      break;
  }
}

function onSpecialUp(key: number) {
  switch (key) {
    case GLUT.KEY_F12:
      devToolsOpened = !devToolsOpened;
      browser.toggleDevTools(devToolsOpened);
      break;
  }
}

function isKeyPressed(key: any) {
  return keys[key];
}

function onUpdate(deltaTime: number) {
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

  NativeBrowserUpdate();
}

async function onInit() {
  if (GL.init() !== GL.OK) {
    console.log('*** GL FAIL.');
    return;
  }

  // Verifica se há suporte para as extensões GLSL
  if (!GL.isSupported('GL_ARB_vertex_shader') || !GL.isSupported('GL_ARB_fragment_shader')) {
    console.log('*** Hardware não suporta GLSL');
    return;
  }

  //GLUT.setCursor(GLUT.CURSOR_NONE);

  GL.clearColor(0.0, 0.0, 0.0, 1.0);

  await shader.load(
    path.join(__dirname, "assets", "shaders", "camera.vert"),
    path.join(__dirname, "assets", "shaders", "camera.frag")
  );

  GL.enable(GL.TEXTURE_2D);
  GL.shadeModel(GL.SMOOTH);
  GL.clearColor(0.0, 0.0, 0.0, 1.0);
  GL.clearDepth(1.0);
  GL.hint(GL.PERSPECTIVE_CORRECTION_HINT, GL.NICEST);
  GL.blendFunc(GL.SRC_COLOR, GL.ONE_MINUS_SRC_ALPHA);
  GL.enable(GL.BLEND);
  GL.enable(GL.DEPTH_TEST);

  texture1 = await Texture.load(path.join(__dirname, 'assets', 'textures', 'bloco.jpg'));

  browser = new NativeBrowser({
    hwnd: GLUT.getWindowHandle(),
    transparent: true,
    onCreated: () => {
      browser.resize(1024, 1024);
      browser.loadURL("https://www.youtube.com/watch?v=lLWEXRAnQd0&ab_channel=BobRoss");
    }
  });

  vertexArrayId = GL.genVertexArrays(1);
  GL.bindVertexArray(vertexArrayId);
  vertexbuffer = GL.genBuffers(1);
  GL.bindBuffer(GL.ARRAY_BUFFER, vertexbuffer);
  GL.bufferData(GL.ARRAY_BUFFER, gVertexBufferData.length * 4, gVertexBufferData, GL.STATIC_DRAW);
  GL.bindBuffer(GL.ARRAY_BUFFER, 0);


  GL.bindBuffer(GL.ARRAY_BUFFER, vertexbuffer);
  GL.enableVertexAttribArray(0);
  GL.vertexAttribPointer(
    0,
    2,
    GL.FLOAT,
    false,
    8 * 4,
    0,
  );
  GL.enableVertexAttribArray(0);

  GL.vertexAttribPointer(
    1,
    2,
    GL.FLOAT,
    false,
    8 * 4,
    3 * 4,
  );
  GL.enableVertexAttribArray(1);

  GL.vertexAttribPointer(
    2,
    2,
    GL.FLOAT,
    false,
    8 * 4,
    6 * 4,
  );
  GL.enableVertexAttribArray(2);

  shader.use();
  shader.setInt("texture1", 0);
}

function onReshape(width: number, height: number): void {
  GL.viewport(0, 0, width, height);
  GL.matrixMode(GL.PROJECTION);
  GL.loadIdentity();
  GLU.perspective(45.0, width / height, 0.1, 100.0);
  GL.matrixMode(GL.MODELVIEW);
}

function onDisplay() {



  //GL.clearColor(0.2, 0.3, 0.3, 1.0);
  GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);


  let width = GLUT.get(GLUT.WINDOW_WIDTH);
  let height = GLUT.get(GLUT.WINDOW_HEIGHT);

  GL.activeTexture(GL.TEXTURE0);
  GL.bindTexture(GL.TEXTURE_2D, browser.getTextureId());

  shader.use();
  let projection = glm.perspective(glm.radians(camera.zoom), width / height, 0.1, 1000.0);
  shader.setMatrix4("projection", projection);
  let view = camera.getViewMatrix();
  shader.setMatrix4("view", view);

  for (let x = 1; x < 10; x++) {
    for (let y = 1; y < 10; y++) {
      for (let z = 1; z < 10; z++) {
        let model = new glm.mat4();
        model = glm.translate(model, new glm.vec3(x * 6, y * 6, z * 6));
        shader.setMatrix4("model", model);
        GL.drawArrays(GL.QUADS, 0, 4 * 8);
      }
    }
  }

  GL.bindTexture(GL.TEXTURE_2D, 0);

  // GL.disableVertexAttribArray(0);
  // GL.useProgram(0);

  GL.useProgram(0);
}

async function main() {
  const window = new Window();
  window.setTitle('Hello World!');
  await onInit();
  window.onReshape = onReshape;
  window.onDisplay = onDisplay;
  window.onKeyboard = onKeyboard;
  window.onKeyboardUp = onKeyboardUp;
  window.onSpecial = onSpecial;
  window.onSpecialUp = onSpecialUp;
  window.onMouseMove = onMouseMove;
  window.onUpdate = onUpdate;
  window.run();
}

main();
