import GLU from '@devzolo/node-native-glu';

export class Camera {
  #position: number[] = [0, 0, 0];
  #rotation: number[] = [0, 0, 0];

  public get position(): number[] {
    return this.#position;
  }

  public set position(value: number[]) {
    this.#position = value;
  }

  public get rotation(): number[] {
    return this.#rotation;
  }

  public set rotation(value: number[]) {
    this.#rotation = value;
  }

  public move(x: number, y: number, z: number): void {
    this.#position[0] += x;
    this.#position[1] += y;
    this.#position[2] += z;
  }

  public rotate(x: number, y: number, z: number): void {
    this.#rotation[0] += x;
    this.#rotation[1] += y;
    this.#rotation[2] += z;
  }

  public getViewMatrix(): number[] {
    const viewMatrix: number[] = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

    GLU.lookAt(this.#position[0], this.#position[1], this.#position[2], 0, 0, 0, 0, 1, 0);

    return viewMatrix;
  }
}
