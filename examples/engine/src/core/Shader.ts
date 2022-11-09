import GL from "@devzolo/node-native-gl";
import glm from "@devzolo/node-native-glm";
import fs from "fs/promises";

export class Shader {
  #id = 0;

  async loadFile(filePath: string) {
    return fs.readFile(filePath, 'utf8');
  }

  displayInfoLog(shader: GLuint): void {
    // Obtém tamanho do infolog
    const [tamanho] = GL.getShaderiv(shader, GL.INFO_LOG_LENGTH);

    // Se há algo no infolog...
    if (tamanho > 1) {
      const [length, infoLog] = GL.getShaderInfoLog(shader, tamanho);
      console.log(length, infoLog);
    }
  }

  async load(vertexPath: string, fragmentPath: string, geometryPath: string = "") {
    const v: GLuint = GL.createShader(GL.VERTEX_SHADER);
    const f: GLuint = GL.createShader(GL.FRAGMENT_SHADER);

    const vs: string = await this.loadFile(vertexPath);
    const fs: string = await this.loadFile(fragmentPath);

    GL.shaderSource(v, vs);
    GL.shaderSource(f, fs);

    GL.compileShader(v);

    this.displayInfoLog(v);

    // Verifica se a compilação teve sucesso
    const [vertOK] = GL.getShaderiv(v, GL.COMPILE_STATUS);

    if (!vertOK) {
      console.error('Não foi possível compilar o vertex shader %s', vertexPath);
      //exit(1);
      return 0;
    }
    // Compila o fragment shader e mostra o log da compilação
    GL.compileShader(f);
    this.displayInfoLog(f);

    // Verifica se a compilação teve sucesso
    const [fragOK] = GL.getShaderiv(f, GL.COMPILE_STATUS);
    if (!fragOK) {
      console.error('Não foi possível compilar o fragment shader %s', fragmentPath);
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

    this.#id = prog;
    return this;
  }

  use() {
    GL.useProgram(this.#id);
    return this;
  }

  setBool(name: string, value: boolean) {
    GL.uniform1i(GL.getUniformLocation(this.#id, name), value ? 1 : 0);
    return this;
  }

  setInt(name: string, value: number) {
    GL.uniform1i(GL.getUniformLocation(this.#id, name), value);
    return this;
  }

  setFloat(name: string, value: number) {
    GL.uniform1f(GL.getUniformLocation(this.#id, name), value);
    return this;
  }

  setMatrix4(name: string, value: glm.mat4) {
    GL.uniformMatrix4fv(GL.getUniformLocation(this.#id, name), 1, false, value.getAsFloat32Array());
    return this;
  }

}
