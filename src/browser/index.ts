import GL from '@devzolo/node-native-gl';
import GLU from '@devzolo/node-native-glu';
import GLUT from '@devzolo/node-native-glut';
import { NativeBrowser, NativeBrowserUpdate } from '@devzolo/node-native-browser';
import { Benchmark } from '~/util';

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

async function initialize() {
  GL.enable(GL.TEXTURE_2D);
  GL.shadeModel(GL.SMOOTH);
  GL.clearColor(0.0, 0.0, 0.0, 1.0);
  GL.clearDepth(1.0);
  GL.hint(GL.PERSPECTIVE_CORRECTION_HINT, GL.NICEST);
  GL.blendFunc(GL.SRC_COLOR, GL.ONE_MINUS_SRC_ALPHA);
  GL.enable(GL.BLEND);
  GL.enable(GL.DEPTH_TEST);

  const width = 1024;
  const height = 1024;

  const data = [
    { url: 'https://www.youtube.com' },
    { url: 'https://www.google.com' },
    { url: 'https://github.com/devzolo' },
    { url: 'https://www.facebook.com' },
    { url: 'https://www.instagram.com' },
    { url: 'https://www.twitter.com' },
    { url: 'https://www.linkedin.com' },
    { url: 'https://www.pinterest.com' },
    { url: 'https://www.reddit.com' },
    { url: 'https://www.quora.com' },
    { url: 'https://www.tumblr.com' },
    { url: 'https://www.flickr.com' },
    { url: 'https://www.imdb.com' },
    { url: 'https://www.wikipedia.org' },
    { url: 'https://www.amazon.com' },
    { url: 'https://www.ebay.com' },
  ];

  for (const item of data) {
    const browser = new NativeBrowser({
      hwnd: GLUT.getWindowHandle(),
      transparent: true,
      onCreated: () => {
        browser.resize(width, height);
        browser.loadUrl(item.url);
      },
    });
    browsers[item.url] = browser;
  }
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
  GL.disable(GL.BLEND);
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
}

function onDrawCene() {
  GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
  GL.loadIdentity();
  GL.translatef(0.0, 0.0, -4.0);

  GL.pushMatrix();
  {
    rot += 0.3;
    GL.rotatef(rot, 0.0, 1.0, 0.0);

    GL.translatef(0.0, 0.0, -1.0);
    GL.color4f(1.0, 1.0, 1.0, 1.0);

    for (const browser in browsers) {
      GL.translatef(0.0, 0.0, -0.5);
      drawnQuad(browsers[browser].getTextureId());
    }
  }
  GL.popMatrix();

  drawBackground();

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
    NativeBrowserUpdate();
    onDrawCene();
    fps++;
  });

  await initialize();
  GLUT.mainLoop();
}
main();
