import GL from '@devzolo/node-native-gl';
import GLU from '@devzolo/node-native-glu';
import GLUT from '@devzolo/node-native-glut';
import { Benchmark } from 'utils';

let rot = 0;
let fps = 0;

function redimensiona(width: number, height: number): void {
  console.log('redimensiona', 'width', width, 'height', height);
  GL.viewport(0, 0, width, height); //seleciona a area da janela
  GL.matrixMode(GL.PROJECTION); //seleciona a matriz de projeção
  GL.loadIdentity(); //reseta a matriz de projeção
  GLU.perspective(45.0, width / height, 0.1, 100.0); //seleciona a perspectiva
  GL.matrixMode(GL.MODELVIEW); //seleciona a matriz de visualização
}

function desenha() {
  GL.clear(GL.COLOR_BUFFER_BIT); //limpa a tela

  GL.loadIdentity(); //reseta a matriz atual
  GL.translatef(0.0, 0.0, -6.0); //envia para mais para tras

  rot += 1;
  GL.rotatef(rot, 0.0, 1.0, 0.0); //rotaciona no eixo Y

  GL.begin(GL.TRIANGLES); //inicia a figura
  GL.color3f(1.0, 0.0, 0.0); //seleciona a cor vermelha
  GL.vertex3f(0.0, 1.0, 0.0); //ponto superior
  GL.color3f(0.0, 1.0, 0.0); //seleciona a cor verde
  GL.vertex3f(-1.0, -1.0, 0.0); //ponto inferior esquerdo
  GL.color3f(0.0, 0.0, 1.0); //seleciona a cor azul
  GL.vertex3f(1.0, -1.0, 0.0); //ponto inferior direito
  GL.end(); //finaliza a figura

  // desenhar um circulo
  GL.begin(GL.TRIANGLE_FAN);
  GL.color3f(1.0, 1.0, 1.0);
  GL.vertex2f(0.0, 0.0);
  for (let i = 0; i <= 360; i += 1) {
    GL.vertex2f(Math.cos((i * Math.PI) / 180) * 0.5, Math.sin((i * Math.PI) / 180) * 0.5);
  }
  GL.end();

  GLUT.swapBuffers(); //executa os comandos OpenGL
  fps++;
}

async function main() {
  const width = 800;
  const height = 600;

  GLUT.init(); //inicializa a biblioteca glut
  GLUT.initDisplayMode(GLUT.DOUBLE | GLUT.RGB); //modo de display
  GLUT.initWindowSize(width, height); //seleciona o tamanho da janela
  GLUT.initWindowPosition((GLUT.get(GLUT.SCREEN_WIDTH) - width) / 2, (GLUT.get(GLUT.SCREEN_HEIGHT) - height) / 2);
  GLUT.createWindow('Teste OpenGL'); //cria a janela com o nome "Teste"
  GLUT.displayFunc(desenha); //seleciona a função de desenho

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
    desenha();
  });

  GLUT.reshapeFunc(redimensiona);
  GL.clearColor(0.0, 0.0, 0.0, 0.0);
  GLUT.mainLoop(); //inicia o loop na janela
}

main();
