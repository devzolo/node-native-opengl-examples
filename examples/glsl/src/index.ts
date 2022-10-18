/* eslint-disable @typescript-eslint/camelcase */
//*****************************************************
//
// Exemplo3DGLSL.cpp
// Um programa OpenGL que abre uma janela GLUT
// e desenha um torus iluminado por um spot - a iluminação
// é calculada por shaders, gerando uma borda "suave"
//
// Navegação via botões do mouse + movimento:
// - botão esquerdo: rotaciona objeto
// - botão direito:  aproxima/afasta
// - botão do meio:  translada objeto
//
// Teclas Home e End fazem zoom in/zoom out
// Teclas 0, 1 e 2 devem ser usadas para escolher a fonte
// de luz desejada (verde, vermelha ou azul)
// Setas movem fonte de luz em x e y
// PageUp/PageDown movem fonte de luz em z
//
// Marcelo Cohen e Isabel H. Manssour
// Este código acompanha o livro
// "OpenGL - Uma Abordagem Prática e Objetiva"
//
//*****************************************************
import GL from '@devzolo/node-native-gl';
import GLU from '@devzolo/node-native-glu';
import GLUT from '@devzolo/node-native-glut';
import fs from 'fs';
import path from 'path';

function system(cmd: string): void {
  console.log(cmd);
}

function normaliza(norm: Float32Array): Float32Array {
  const tam: GLfloat = Math.sqrt(norm[0] * norm[0] + norm[1] * norm[1] + norm[2] * norm[2]);
  if (tam == 0) return norm;
  return Float32Array.from([norm[0] / tam, norm[1] / tam, norm[2] / tam]);
}
//==============================================================================
// Variáveis para controles de navegação
let angle: GLfloat = 60.0;
let fAspect: GLfloat;
let rotX: GLfloat;
let rotY: GLfloat;
let rotX_ini: GLfloat;
let rotY_ini: GLfloat;
let obsX: GLfloat;
let obsY: GLfloat;
let obsZ: GLfloat;
let obsZ_ini: GLfloat;
let alvoX_ini: GLfloat;
let alvoY_ini: GLfloat;
let x_ini: GLfloat, y_ini: GLfloat, bot: GLfloat;

let index: GLuint = 0;
// Handle para programa GLSL
const prog: [GLuint, GLuint, GLuint] = [0, 0, 0];

// Handle para variável uniform "interna"
let uinterna: GLint = 0;

// Posição da luz
const posLuz = Float32Array.from([0.0, 12.0, 0.0, 1.0]);

// Cor difusa da luz
const luzDifusa = Float32Array.from([1.0, 1.0, 1.0, 1.0]);

// Cor especular da luz
const luzEspecular = Float32Array.from([1.0, 1.0, 1.0, 1.0]);

// Direção da luz
let dirLuz = Float32Array.from([0.0, 0.0, 0.0]);

// Alvo do spot (utilizado para calcular a direção)
const alvoSpot = Float32Array.from([0.0, 0.0, 0.0]);

// True se usando shaders
let usashaders: GLboolean = true;

// Coeficiente especular inicial
let e: GLfloat = 1.0;

// Diferença angular entre a borda interna e externa do spot (em graus)
let borda: GLfloat = 1.0;

// Borda externa do spot (em graus)
const cutoff: GLfloat = 20.0;

// Cosseno da borda interna, para ser empregado no fragment shader
let cosborda: GLfloat = 0;

//==============================================================================

// Função responsável pela especificação dos parâmetros de iluminaç¿o
function defineIluminacao(): void {
  GL.lightfv(GL.LIGHT0, GL.POSITION, posLuz);
  GL.lightfv(GL.LIGHT0, GL.SPOT_DIRECTION, dirLuz);
  GL.lightf(GL.LIGHT0, GL.SPOT_EXPONENT, e);
  GL.lightf(GL.LIGHT0, GL.SPOT_CUTOFF, cutoff);
}

// Função usada para especificar a posição do observador virtual
function posicionaObservador(): void {
  // Especifica sistema de coordenadas do modelo
  GL.matrixMode(GL.MODELVIEW);
  // Inicializa sistema de coordenadas do modelo
  GL.loadIdentity();
  // Posiciona e orienta o observador
  GL.translatef(-obsX, -obsY, -obsZ);
  GL.rotatef(rotX, 1, 0, 0);
  GL.rotatef(rotY, 0, 1, 0);
}

// Função usada para especificar o volume de visualização
function especificaParamsVisualizacao(): void {
  // Especifica sistema de coordenadas de projeção
  GL.matrixMode(GL.PROJECTION);
  // Inicializa sistema de coordenadas de projeção
  GL.loadIdentity();
  // Especifica a projeção perspectiva(angulo,aspecto,zMin,zMax)
  GLU.perspective(angle, fAspect, 0.1, 1000);
  GL.matrixMode(GL.MODELVIEW);

  posicionaObservador();
}

// Função callback chamada quando o tamanho da janela é alterado
function alteraTamanhoJanela(w: GLfloat, h: GLfloat): void {
  // Para previnir uma divisão por zero
  if (h == 0) h = 1;

  // Especifica as dimensões da viewport
  GL.viewport(0, 0, w, h);

  // Calcula a correção de aspecto
  fAspect = w / h;

  especificaParamsVisualizacao();
}

// Função que calcula a direção do spot a partir
// do alvo especificado
function calculaDirSpot(): void {
  // Direção é calculada pelo alvo - posição do spot
  const dir = Float32Array.from([alvoSpot[0] - posLuz[0], alvoSpot[1] - posLuz[1], alvoSpot[2] - posLuz[2]]);
  dirLuz = normaliza(dir);
}

// Função para desenhar um "chão" no ambiente
function desenhaChao(): void {
  const TAM = 20;
  const D = 2;

  // Flags para determinar a cor de cada quadrado
  let flagx: GLboolean, flagz: GLboolean;
  // Define a normal apontando para cima
  GL.translatef(0, -0.8, 0);
  flagx = false;
  // X varia de -TAM a TAM, de D em D
  for (let x: GLfloat = -TAM; x < TAM; x += D) {
    // Flagx determina a cor inicial
    if (flagx) flagz = false;
    else flagz = true;
    // Z varia de -TAM a TAM, de D em D
    for (let z: GLfloat = -TAM; z < TAM; z += D) {
      // Escolhe cor
      if (flagz) GL.color3f(0.4, 0.4, 0.4);
      else GL.color3f(1, 1, 1);
      // E desenha o quadrado
      GL.begin(GL.QUADS);
      GL.normal3f(0, 1, 0);
      GL.vertex3f(x, 0, z);
      GL.vertex3f(x + D, 0, z);
      GL.vertex3f(x + D, 0, z + D);
      GL.vertex3f(x, 0, z + D);
      GL.end();
      // Alterna cor
      flagz = !flagz;
    }
    // A cada coluna, alterna cor inicial
    flagx = !flagx;
  }
  GL.end();
}

// Função callback de redesenho da janela
function desenha(): void {
  GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

  GL.pushMatrix();

  defineIluminacao();

  GL.pushMatrix();
  GL.translatef(posLuz[0], posLuz[1], posLuz[2]);
  GL.disable(GL.LIGHTING);
  GL.color3f(1, 0, 0);
  GLUT.solidSphere(0.1, 5, 5);
  GL.enable(GL.LIGHTING);
  GL.popMatrix();

  if (usashaders) {
    // Ativa programa
    GL.useProgram(prog[index]);
    // E envia o valor atual da borda
    GL.uniform1f(uinterna, cosborda);
  }

  // Desenha o chão armazenado na display list
  GL.callList(1);

  // Agora desenha um torus
  GL.color3f(1, 0.5, 0);
  GL.translatef(0, 3, 0);
  GL.rotatef(45, 0, 1, 0);
  GLUT.solidTorus(1, 2, 20, 20);

  GL.useProgram(0);

  GL.popMatrix();

  GLUT.swapBuffers();
}

// Função callback chamada para gerenciar eventos de teclas
function teclado(tecla: any): void {
  switch (tecla) {
    case 27:
      system('exit');
      break;
    default:
      const teclaChar = tecla;

      console.log(teclaChar)
      switch (teclaChar) {
        case "'":
          usashaders = !usashaders;
          break;
        case '1':
          index = 0;
          break;
        case '2':
          index = 1;
          break;
        case '3':
          index = 2;
          break;
        case ' ':
          usashaders = !usashaders;
          break;
        case '+':
          ++e;
          break;
        case '-':
          --e;
          break;
        case '.':
          if (borda < cutoff) borda += 0.1;
          break;
        case ',':
          if (borda > 0.1) borda -= 0.1;
          break;
      }
  }

  // Calcula o cosseno da borda interna
  cosborda = Math.cos(((cutoff - borda) * Math.PI) / 180.0);
  GLUT.postRedisplay();
}

// Função callback para tratar eventos de teclas especiais
function teclasEspeciais(tecla: number): void {
  switch (tecla) {
    case GLUT.KEY_LEFT:
      posLuz[0] -= 2.0;
      break;
    case GLUT.KEY_RIGHT:
      posLuz[0] += 2.0;
      break;
    case GLUT.KEY_UP:
      posLuz[1] += 2.0;
      break;
    case GLUT.KEY_DOWN:
      posLuz[1] -= 2.0;
      break;
    case GLUT.KEY_PAGE_UP:
      posLuz[2] -= 2.0;
      break;
    case GLUT.KEY_PAGE_DOWN:
      posLuz[2] += 2.0;
      break;
    case GLUT.KEY_HOME:
      if (angle >= 10.0) angle -= 5.0;
      break;
    case GLUT.KEY_END:
      if (angle <= 150.0) angle += 5.0;
      break;
  }
  posicionaObservador();
  GLUT.postRedisplay();
}

// Função callback para eventos de botões do mouse
function gerenciaMouse(button: number, _state: any, x: number, y: number): void {
  if (_state == GLUT.DOWN) {
    // Salva os parâmetros atuais
    x_ini = x;
    y_ini = y;
    obsZ_ini = obsZ;
    rotX_ini = rotX;
    rotY_ini = rotY;
    alvoX_ini = alvoSpot[0];
    alvoY_ini = alvoSpot[2];
    bot = button;
  } else bot = -1;
}

// Função callback para eventos de movimento do mouse
const SENS_ROT = 5.0;
const SENS_OBS = 10.0;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SENS_TRANSL = 10.0;

function gerenciaMovim(x: number, y: number): void {
  // Botão esquerdo ?
  if (bot == GLUT.LEFT_BUTTON) {
    // Calcula diferenças
    const deltax = x_ini - x;
    const deltay = y_ini - y;
    // E modifica ângulos
    rotY = rotY_ini + deltax / SENS_ROT;
    rotX = rotX_ini + deltay / SENS_ROT;
  }
  // Botão direito ?
  else if (bot == GLUT.RIGHT_BUTTON) {
    // Calcula diferença
    const deltaz = y_ini - y;
    // E modifica distância do observador
    obsZ = obsZ_ini + deltaz / SENS_OBS;
  }
  // Botão do meio ?
  else if (bot == GLUT.MIDDLE_BUTTON) {
    // Calcula diferenças
    const deltaroty = y_ini - y;
    const deltarotx = x_ini - x;
    // E modifica alvo do spot
    alvoSpot[0] = alvoX_ini - deltarotx / 10.0;
    alvoSpot[2] = alvoY_ini - deltaroty / 10.0;
    // Recalcula direção a partir do alvo e posição
    calculaDirSpot();
  }
  posicionaObservador();
  GLUT.postRedisplay();
}

function carregaArquivo(filePath: string): string {
  return fs.readFileSync(path.resolve(path.join(__dirname, filePath)), 'utf8');
}

// Função que recebe o handle de um shader/programa e retorna
// o infolog da última compilação ou ligação
function mostraInfoLog(shader: GLuint): void {
  // Obtém tamanho do infolog
  const [tamanho] = GL.getShaderiv(shader, GL.INFO_LOG_LENGTH);

  // Se há algo no infolog...
  if (tamanho > 1) {
    const [length, infoLog] = GL.getShaderInfoLog(shader, tamanho);
    console.log(length, infoLog);
  }
}

// Função que recebe os nomes de dois arquivos-texto, contendo
// os códigos-fonte do vertex shader e do fragment shader
function compilaShaders(vertsrc: string, fragsrc: string): GLuint {
  // Cria os dois shaders
  const v: GLuint = GL.createShader(GL.VERTEX_SHADER);
  const f: GLuint = GL.createShader(GL.FRAGMENT_SHADER);

  // Carrega os arquivos
  const vs: string = carregaArquivo(vertsrc);
  const fs: string = carregaArquivo(fragsrc);

  // Envia os códigos-fonte para OpenGL
  GL.shaderSource(v, vs);
  GL.shaderSource(f, fs);

  // Compila o vertex shader e mostra o log da compilação
  GL.compileShader(v);
  mostraInfoLog(v);

  // Verifica se a compilação teve sucesso
  const [vertOK] = GL.getShaderiv(v, GL.COMPILE_STATUS);

  if (!vertOK) {
    console.error('Não foi possível compilar o vertex shader %s', vertsrc);
    //exit(1);
    return 0;
  }

  // Compila o fragment shader e mostra o log da compilação
  GL.compileShader(f);
  mostraInfoLog(f);

  // Verifica se a compilação teve sucesso
  const [fragOK] = GL.getShaderiv(f, GL.COMPILE_STATUS);
  if (!fragOK) {
    console.error('Não foi possível compilar o fragment shader %s', fragsrc);
    //exit(1);
    return 0;
  }

  // Cria o programa GLSL
  const prog: GLuint = GL.createProgram();
  // E associa os shaders a ele
  GL.attachShader(prog, f);
  GL.attachShader(prog, v);

  // Faz a ligação dos shaders
  GL.linkProgram(prog);
  //mostraInfoLog(prog);

  // Verifica se a ligação teve sucesso
  const [ligacaoOK] = GL.getShaderiv(prog, GL.LINK_STATUS);
  if (!ligacaoOK) {
    console.error('Não foi possível fazer a ligação dos shaders');
    //exit(1);
    //return 0;
  }

  // Finalmente, retorna o programa
  return prog;
}

// Função responsável por inicializar parâmetros e variáveis
function inicializa(): boolean {
  if (GL.init() != GL.OK) {
    console.log('*** GLEW FAIL.');
    return false;
  }

  // Verifica se há suporte para as extensões GLSL
  if (!GL.isSupported('GL_ARB_vertex_shader') || !GL.isSupported('GL_ARB_fragment_shader')) {
    console.log('*** Hardware não suporta GLSL');
    return false;
  }

  // Carrega e compila os shaders
  prog[0] = compilaShaders('./shaders/spotlight2.vert', './shaders/spotlight2.frag');
  prog[1] = compilaShaders('./shaders/toon.vert', './shaders/toon.frag');
  prog[2] = compilaShaders('./shaders/light.vert', './shaders/light.frag');

  // Armazena posição da variável "interna"
  uinterna = GL.getUniformLocation(prog[index], 'interna');

  // Define a cor de fundo da janela de visualização como branca
  GL.clearColor(1.0, 1.0, 1.0, 1.0);

  // Habilita a definição da cor do material a partir da cor corrente
  GL.enable(GL.COLOR_MATERIAL);
  GL.colorMaterial(GL.FRONT, GL.AMBIENT_AND_DIFFUSE);

  // Ajusta componente especular do material e shininess
  GL.materialfv(GL.FRONT, GL.SPECULAR, luzEspecular);
  GL.materialf(GL.FRONT, GL.SHININESS, 100.0);

  // Define os parâmetros da fonte de luz
  GL.lightfv(GL.LIGHT0, GL.DIFFUSE, luzDifusa);
  GL.lightfv(GL.LIGHT0, GL.SPECULAR, luzEspecular);
  GL.enable(GL.LIGHT0);
  GL.enable(GL.LIGHTING);
  GL.enable(GL.DEPTH_TEST);

  // Cria uma display list para o chão
  GL.newList(1, GL.COMPILE);
  desenhaChao();
  GL.endList();

  // Inicializa o valor de cosborda
  cosborda = Math.cos(((cutoff - borda) * Math.PI) / 180.0);

  // Calcula direção inicial do spot
  calculaDirSpot();

  // Inicializa as variáveis usadas para alterar a posição do
  // observador virtual
  rotX = rotY = 0;
  obsX = obsY = 0;
  obsZ = 10;
  return true;
}

//==============================================================================

async function main(): Promise<void> {
  GLUT.init();

  // Define o modo de operação da GLUT
  GLUT.initDisplayMode(GLUT.DOUBLE | GLUT.RGB | GLUT.DEPTH);
  // Especifica a posição inicial da janela GLUT
  GLUT.initWindowPosition(5, 5);
  // Especifica o tamanho inicial em pixels da janela GLUT
  GLUT.initWindowSize(450, 450);
  // Cria a janela passando como argumento o título da mesma
  GLUT.createWindow('Spotlights usando GLSL');
  // Registra a função callback de redesenho da janela de visualização
  GLUT.displayFunc(desenha);
  // Registra a função callback de redimensionamento da janela de visualização
  GLUT.reshapeFunc(alteraTamanhoJanela);
  // Registra a função callback para tratamento das teclas normais
  GLUT.keyboardFunc(teclado);
  // Registra a função callback para tratamento das teclas especiais
  GLUT.specialFunc(teclasEspeciais);
  // Registra a função callback para eventos de botões do mouse
  GLUT.mouseFunc(gerenciaMouse);
  // Registra a função callback para eventos de movimento do mouse
  GLUT.motionFunc(gerenciaMovim);
  // Chama a função responsável por fazer as inicializações
  if (inicializa()) {
    GLUT.mainLoop();
  }
}

main();
