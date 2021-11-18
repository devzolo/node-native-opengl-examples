import GLU from '@devzolo/node-native-glu';

export default class Camera {
  private _position: number[] = [0, 0, 0];
  private _rotation: number[] = [0, 0, 0];

  public get position(): number[] {
    return this._position;
  }

  public set position(value: number[]) {
    this._position = value;
  }

  public get rotation(): number[] {
    return this._rotation;
  }

  public set rotation(value: number[]) {
    this._rotation = value;
  }

  public move(x: number, y: number, z: number): void {
    this._position[0] += x;
    this._position[1] += y;
    this._position[2] += z;
  }

  public rotate(x: number, y: number, z: number): void {
    this._rotation[0] += x;
    this._rotation[1] += y;
    this._rotation[2] += z;
  }

  public getViewMatrix(): number[] {
    const viewMatrix: number[] = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

    GLU.lookAt(this._position[0], this._position[1], this._position[2], 0, 0, 0, 0, 1, 0);

    return viewMatrix;
  }
}
