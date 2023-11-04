import GLUT from '@devzolo/node-native-glut';
import { Benchmark } from 'utils';

export class Window {

  width = 800;
  height = 600;

  fps = 0;
  #onDisplay?: () => void;
  #onReshape?: (width: number, height: number) => void;
  #onKeyboard?: (key: string, x: number, y: number) => void;
  #onKeyboardUp?: (key: string, x: number, y: number) => void;
  #onSpecial?: (key: number, x: number, y: number) => void;
  #onSpecialUp?: (key: number, x: number, y: number) => void;
  #onMouseMove?: (x: number, y: number) => void;
  #onUpdate?: (deltaTime: number) => void;

  set onDisplay(onDisplay: () => void) {
    this.#onDisplay = onDisplay;
  }

  set onReshape(onReshape: (width: number, height: number) => void) {
    this.#onReshape = onReshape;
  }

  set onKeyboard(onKeyboard: (key: string, x: number, y: number) => void) {
    this.#onKeyboard = onKeyboard;
  }

  set onKeyboardUp(onKeyboardUp: (key: string, x: number, y: number) => void) {
    this.#onKeyboardUp = onKeyboardUp;
  }

  set onSpecial(onSpecial: (key: number, x: number, y: number) => void) {
    this.#onSpecial = onSpecial;
  }

  set onSpecialUp(onSpecialUp: (key: number, x: number, y: number) => void) {
    this.#onSpecialUp = onSpecialUp;
  }

  set onMouseMove(onMouseMove: (x: number, y: number) => void) {
    this.#onMouseMove = onMouseMove;
  }

  set onUpdate(onUpdate: (deltaTime: number) => void) {
    this.#onUpdate = onUpdate;
  }

  constructor() {

    const benchmarkFps = new Benchmark();
    const benchmarkDisplay = new Benchmark();

    GLUT.init();
    GLUT.initDisplayMode(GLUT.DOUBLE | GLUT.DEPTH | GLUT.RGBA | GLUT.MULTISAMPLE);
    GLUT.initWindowSize(this.width, this.height);
    GLUT.initWindowPosition((GLUT.get(GLUT.SCREEN_WIDTH) - this.width) / 2, (GLUT.get(GLUT.SCREEN_HEIGHT) - this.height) / 2);
    GLUT.createWindow('Window');
    GLUT.reshapeFunc((width: number, height: number) => {
      this.#onReshape?.(width, height);
    });


    GLUT.keyboardFunc((key: string, x: number, y: number) => {
      this.#onKeyboard?.(key, x, y);
    });
    GLUT.keyboardUpFunc((key: string, x: number, y: number) => {
      this.#onKeyboardUp?.(key, x, y);
    });
    GLUT.specialFunc((key: number, x: number, y: number) => {
      this.#onSpecial?.(key, x, y);
    });
    GLUT.specialUpFunc((key: number, x: number, y: number) => {
      this.#onSpecialUp?.(key, x, y);
    });

    GLUT.passiveMotionFunc((x: number, y: number) => {
      this.#onMouseMove?.(x, y);
    });

    GLUT.displayFunc(() => {
      this.#onDisplay?.();
    });
    GLUT.idleFunc(() => {
      if (benchmarkFps.elapsed() >= 1000) {
        benchmarkFps.start();
        GLUT.setWindowTitle(`Teste OpenGL - FPS: ${this.fps}`);
        this.fps = 0;
      }

      if (benchmarkDisplay.elapsed() >= 1000 / 144) {
        this.#onUpdate?.(benchmarkDisplay.elapsed() * 60 / 1000);
        benchmarkDisplay.start();
        GLUT.swapBuffers();
        this.#onDisplay?.();
        this.fps++;
      }
    });
  }

  public setTitle(title: string) {
    GLUT.setWindowTitle(title);
  }

  public run() {
    GLUT.mainLoop();
  }
}
