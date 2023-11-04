import GL from '@devzolo/node-native-gl';
import GLU from '@devzolo/node-native-glu';
import GLUT from '@devzolo/node-native-glut';
import { Benchmark } from 'utils';
import * as phisics from 'matter-js';

let fps = 0;

const engine = phisics.Engine.create();



const ballStack = phisics.Composites.stack(0, 0, 10, 10, 0, 0, (x:number, y:number) => {
  return phisics.Bodies.circle(x, y, 0.1, {
    restitution: 1,
    friction: 0,
    frictionAir: 0,
    frictionStatic: 0,
    inertia: Infinity,
    isStatic: false,
    mass: 0.1,
    plugin: {
      data: {
        type: 'ball',
      },
    }
  });
});
phisics.World.add(engine.world, ballStack);

const ground = phisics.Bodies.rectangle(0, -1, 2, 0.1, { isStatic: true, plugin: { data: { type: 'ground' } }  });
phisics.World.add(engine.world, ground);

engine.gravity.y = -0.001;


function drawGlBodies() {
  const bodies = phisics.Composite.allBodies(engine.world);
  bodies.forEach(body => {
    // if (body?.plugin?.data?.type === 'ball') {
    //   GL.pushMatrix();
    //   {
    //     let posX = body.position.x;
    //     let posY = body.position.y;
    //     GL.rotatef(body.angle, 0.0, 0.0, 1.0);
    //     GL.translatef(posX, posY, 0.0);
    //     GL.color3f(0.0, 1.0, 0.0);
    //     GLUT.solidTeapot(0.1);
    //   }
    //   GL.popMatrix();
    // } else {

    // }

    const vertices = body.vertices;
    GL.begin(GL.LINE_LOOP);
    GL.color3f(1.0, 0.0, 0.0);
    vertices.forEach(vertex => {
      let posX = vertex.x + body.position.x/2;
      let posY = vertex.y + body.position.y/2;
      GL.vertex3f(posX, posY, 0.0);
    });
    GL.end();
  });
}



function onReshape(width: number, height: number): void {
  console.log('onReshape', 'width', width, 'height', height); //print the width and height to the console
  GL.viewport(0, 0, width, height); //select the area of the window
  GL.matrixMode(GL.PROJECTION); //select the projection matrix
  GL.loadIdentity(); //reset the projection matrix
  GLU.perspective(45.0, width / height, 0.1, 100.0); //select the perspective
  GL.matrixMode(GL.MODELVIEW); //select the modelview matrix
}

function onDisplay() {
  phisics.Engine.update(engine, 1000 / 60);

  GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT); //clear the screen

  GL.loadIdentity(); //reset the current matrix
  GL.translatef(0.0, 0.0, -6.0); //move 6 units into the screen

  // drawTriangle();
  drawGlBodies();

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
      // console.log('FPS = ', fps);
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
