import GL from '@devzolo/node-native-gl';
import fs from 'fs';
import path from 'path';

function carregaArquivo(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

function mostraInfoLog(shader: GLuint): void {
  // Obtém tamanho do infolog
  const [tamanho] = GL.getShaderiv(shader, GL.INFO_LOG_LENGTH);

  // Se há algo no infolog...
  if (tamanho > 1) {
    const [length, infoLog] = GL.getShaderInfoLog(shader, tamanho);
    console.log(length, infoLog);
  }
}

export function compilaShaders(vertsrc: string, fragsrc: string): GLuint {
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
