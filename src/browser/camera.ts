import GLM from '@devzolo/node-native-glm';

export enum CameraMovement {
  FORWARD,
  BACKWARD,
  LEFT,
  RIGHT,
}

export class Camera {
  static YAW = -90.0;
  static PITCH = 0.0;
  static SPEED = 2.5;
  static SENSITIVITY = 0.6;
  static ZOOM = 45.0;

  constructor(
    public position = new GLM.vec3(0, 0, 0),
    public worldUp = new GLM.vec3(0, 1, 0),
    public yaw = Camera.YAW,
    public pitch = Camera.PITCH,
    public movimentSpeed = Camera.SPEED,
    public mouseSensitivity = Camera.SENSITIVITY,
    public zoom = Camera.ZOOM,
    public front = new GLM.vec3(0, 0, -1),
    public right = new GLM.vec3(0, 0, 0),
    public up = new GLM.vec3(0, 0, 0),
  ) {
    this.updateCameraVectors();
  }

  getViewMatrix(): GLM.mat4 {
    const posUp = this.position.copy().add(this.front);

    return GLM.lookAt(this.position, posUp, this.up);
  }

  updateCameraVectors() {
    /*
        glm::vec3 front;
        front.x = cos(glm::radians(Yaw)) * cos(glm::radians(Pitch));
        front.y = sin(glm::radians(Pitch));
        front.z = sin(glm::radians(Yaw)) * cos(glm::radians(Pitch));
        Front = glm::normalize(front);
        // Also re-calculate the Right and Up vector
        Right = glm::normalize(glm::cross(Front, WorldUp));  // Normalize the vectors, because their length gets closer to 0 the more you look up or down which results in slower movement.
        Up    = glm::normalize(glm::cross(Right, Front));
    */

    const fr = new GLM.vec3(0, 0, 0);
    fr.x = Math.cos(GLM.radians(this.yaw)) * Math.cos(GLM.radians(this.pitch));
    fr.y = Math.sin(GLM.radians(this.pitch));
    fr.z = Math.sin(GLM.radians(this.yaw)) * Math.cos(GLM.radians(this.pitch));

    this.front = GLM.normalize(fr);
    this.right = GLM.normalize(GLM.cross(this.front, this.worldUp));

    this.up = GLM.normalize(GLM.cross(this.right, this.front));
  }

  processKeyboard(movement: CameraMovement, deltaTime: number) {
    const velocity = this.movimentSpeed * deltaTime;
    const velocityVec = new GLM.vec3(velocity, velocity, velocity);

    if (movement == CameraMovement.FORWARD) {
      this.position = GLM.sub(this.position, GLM.mult(this.front, velocityVec));
    } else if (movement == CameraMovement.BACKWARD) {
      this.position = GLM.add(this.position, GLM.mult(this.front, velocityVec));
    } else if (movement == CameraMovement.LEFT) {
      this.position = GLM.add(this.position, GLM.mult(this.right, velocityVec));
    } else if (movement == CameraMovement.RIGHT) {
      this.position = GLM.sub(this.position, GLM.mult(this.right, velocityVec));
    }
  }

  processMouseMovement(xoffset: number, yoffset: number, constrainPitch = true) {
    xoffset *= this.mouseSensitivity;
    yoffset *= this.mouseSensitivity;

    this.yaw += xoffset;
    this.pitch += yoffset;

    // Make sure that when pitch is out of bounds, screen doesn't get flipped
    if (constrainPitch) {
      if (this.pitch > 89.0) {
        this.pitch = 89.0;
      } else if (this.pitch < -89.0) {
        this.pitch = -89.0;
      }
    }

    // Update Front, Right and Up Vectors using the updated Euler angles
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
