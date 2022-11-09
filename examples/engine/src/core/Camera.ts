import glm from '@devzolo/node-native-glm';

export enum CameraMovement {
  FORWARD,
  BACKWARD,
  LEFT,
  RIGHT
}

export class Camera {
  static YAW = 40.0;
  static PITCH = 0.0;
  static SPEED = 0.5;
  static SENSITIVITY = 0.4;
  static ZOOM = 45.0;

  constructor(
    public position = new glm.vec3(0, 0, 0),
    public worldUp = new glm.vec3(0, 1, 0),
    public yaw = Camera.YAW,
    public pitch = Camera.PITCH,
    public movimentSpeed = Camera.SPEED,
    public mouseSensitivity = Camera.SENSITIVITY,
    public zoom = Camera.ZOOM,
    public front = new glm.vec3(0, 0, -1),
    public right = new glm.vec3(0, 0, 0),
    public up = new glm.vec3(0, 0, 0)
  ) {
    this.updateCameraVectors();
  }

  getViewMatrix(): glm.mat4 {
    return glm.lookAt(this.position, glm.add(this.position, this.front), this.up);
  }

  updateCameraVectors() {
    const fr = new glm.vec3(0, 0, 0);
    fr.x = Math.cos(glm.radians(this.yaw)) * Math.cos(glm.radians(this.pitch));
    fr.y = Math.sin(glm.radians(this.pitch));
    fr.z = Math.sin(glm.radians(this.yaw)) * Math.cos(glm.radians(this.pitch));

    this.front = glm.normalize(fr);
    this.right = glm.normalize(glm.cross(this.front, this.worldUp));

    this.up = glm.normalize(glm.cross(this.right, this.front));
  }

  processKeyboard(movement: CameraMovement, deltaTime: number) {
    const velocity = this.movimentSpeed * deltaTime;
    const velocityVec = new glm.vec3(velocity, velocity, velocity);
    if (movement == CameraMovement.FORWARD) {
      this.position = glm.add(this.position, glm.mult(this.front, velocityVec));
    } else if (movement == CameraMovement.BACKWARD) {
      this.position = glm.sub(this.position, glm.mult(this.front, velocityVec));
    } else if (movement == CameraMovement.LEFT) {
      this.position = glm.sub(this.position, glm.mult(this.right, velocityVec));
    } else if (movement == CameraMovement.RIGHT) {
      this.position = glm.add(this.position, glm.mult(this.right, velocityVec));
    }
  }


  processMouseMovement(xoffset: number, yoffset: number, constrainPitch: boolean = true) {
    xoffset *= this.mouseSensitivity;
    yoffset *= this.mouseSensitivity;

    this.yaw += xoffset;
    this.pitch += yoffset;

    if (constrainPitch) {
      if (this.pitch > 89.0) {
        this.pitch = 89.0;
      } else if (this.pitch < -89.0) {
        this.pitch = -89.0;
      }
    }
    this.updateCameraVectors();
  }

  processMouseScroll(yoffset: number) {
    if (this.zoom >= 1.0 && this.zoom <= 45.0) {
      this.zoom -= yoffset;
    }

    if (this.zoom <= 1.0) {
      this.zoom = 1.0;
    }

    if (this.zoom >= 45.0) {
      this.zoom = 45.0;
    }
  }

}
