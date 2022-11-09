import GL from '@devzolo/node-native-gl';
import GLU from '@devzolo/node-native-glu';
import GLUT from '@devzolo/node-native-glut';
import { Benchmark } from 'utils';

let rot = 0;
let fps = 0;

function onReshape(width: number, height: number): void {
  console.log('onReshape', 'width', width, 'height', height); //print the width and height to the console
  GL.viewport(0, 0, width, height); //select the area of the window
  GL.matrixMode(GL.PROJECTION); //select the projection matrix
  GL.loadIdentity(); //reset the projection matrix
  GLU.perspective(45.0, width / height, 0.1, 100.0); //select the perspective
  GL.matrixMode(GL.MODELVIEW); //select the modelview matrix
}

let list = 0;

function onDisplay() {
  GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT); //clear the screen

  GL.loadIdentity(); //reset the current matrix
  GL.translatef(0.0, 0.0, -6.0); //move 6 units into the screen

  rot += 1;
  GL.rotatef(rot, 0.0, 1.0, 0.0); //rotate the triangle on the Y axis


  GL.begin(GL.TRIANGLES); //start drawing a triangle
  GL.color3f(1.0, 0.0, 0.0); //set the color to red
  GL.vertex3f(0.0, 1.0, 0.0); //top point of the triangle
  GL.color3f(0.0, 1.0, 0.0); //set the color to green
  GL.vertex3f(-1.0, -1.0, 0.0); //bottom left point of the triangle
  GL.color3f(0.0, 0.0, 1.0); //set the color to blue
  GL.vertex3f(1.0, -1.0, 0.0); //bottom right point of the triangle
  GL.end(); //end drawing of the triangle

  GLUT.swapBuffers(); //swap the buffers
  fps++;
}

async function main() {
  const width = 800;
  const height = 600;

  GLUT.init(); //inicializa a biblioteca glut
  GLUT.initDisplayMode(GLUT.DOUBLE | GLUT.RGB); //modo de display
  GLUT.initWindowSize(width, height); //seleciona o tamanho da janela
  GLUT.initWindowPosition((GLUT.get(GLUT.SCREEN_WIDTH) - width) / 2, (GLUT.get(GLUT.SCREEN_HEIGHT) - height) / 2);
  GLUT.createWindow('OpenGL Test'); //cria a janela com o nome "Teste"
  GLUT.displayFunc(onDisplay); //seleciona a função de desenho

  GL.enable(GL.DEPTH_TEST); //enable depth testing
  GL.depthFunc(GL.LESS); //depth testing interprets a smaller value as "closer"

  const benchmarkFps = new Benchmark();
  const benchmarkDisplay = new Benchmark();

  GLUT.idleFunc(() => {
    if (benchmarkFps.elapsed() >= 1000) { // 1 second
      benchmarkFps.start();
      console.log('FPS = ', fps);
      GLUT.setWindowTitle(`OpenGL Test - FPS: ${fps}`);
      fps = 0;
    }

    if (benchmarkDisplay.elapsed() >= 1000 / 60) { // 60 fps
      benchmarkDisplay.start();
      onDisplay(); //draw the scene
    }
  });

  GLUT.reshapeFunc(onReshape); //select the reshape function
  GL.clearColor(0.0, 0.0, 0.0, 0.0); //set the clear color to black
  GLUT.mainLoop(); //enter the GLUT event processing loop
}

main();
