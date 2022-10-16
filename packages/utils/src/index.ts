export * from './Camera';
export * from './Texture';
export * from './Benchmark';


// The following code is a fancy bit of math that is eqivilant to calling:
// gluPerspective( fieldOfView/2.0f, width/height , 0.1f, 255.0f )
// We do it this way simply to avoid requiring glu.h
/*
GLfloat zNear = 0.1f;
GLfloat zFar = 255.0f;
GLfloat aspect = float(width)/float(height);
GLfloat fH = tan( float(fieldOfView / 360.0f * 3.14159f) ) * zNear;
GLfloat fW = fH * aspect;
glFrustum( -fW, fW, -fH, fH, zNear, zFar );






void buildPerspProjMat(GLfloat *m, GLfloat fov, GLfloat aspect, GLfloat znear, GLfloat zfar) {
	GLfloat h = tan(fov);
	GLfloat w = h / aspect;
	GLfloat depth = znear - zfar;
	GLfloat q = (zfar + znear) / depth;
	GLfloat qn = 2 * zfar * znear / depth;

	m[0]  = w;  m[1]  = 0;  m[2]  = 0;  m[3]  = 0;

	m[4]  = 0;  m[5]  = h;  m[6]  = 0;  m[7]  = 0;

	m[8]  = 0;  m[9]  = 0;  m[10] = q;  m[11] = -1;

	m[12] = 0;  m[13] = 0;  m[14] = qn;  m[15] = 0;
}

https://unspecified.wordpress.com/2012/06/21/calculating-the-gluperspective-matrix-and-other-opengl-matrix-maths/

*/
export function sleep(delay: number): Promise<void> {
  return new Promise(function(resolve) {
    setTimeout(resolve, delay);
  });
}

export const performance = {
  now: function(start?: number | [number, number] | undefined): number | [number, number] {
    if (!start) return process.hrtime();
    const end = process.hrtime(start as [number, number]);
    return Math.round(end[0] * 1000 + end[1] / 1000000);
  },
};
//const start = performance.now();
//console.log('performance', performance.now(start));

import GL from '@devzolo/node-native-gl';
import fs from 'fs';
import path from 'path';

function carregaArquivo(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

function mostraInfoLog(shader: any): void {
  // Obtém tamanho do infolog
  const [tamanho] = GL.getShaderiv(shader, GL.INFO_LOG_LENGTH);

  // Se há algo no infolog...
  if (tamanho > 1) {
    const [length, infoLog] = GL.getShaderInfoLog(shader, tamanho);
    console.log(length, infoLog);
  }
}

export function compilaShaders(vertsrc: string, fragsrc: string) {
  // Cria os dois shaders
  const v = GL.createShader(GL.VERTEX_SHADER);
  const f = GL.createShader(GL.FRAGMENT_SHADER);

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
  const prog = GL.createProgram();
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

