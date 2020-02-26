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

export class Benchmark {
  private _start: [number, number] | undefined;

  constructor() {
    this.start();
  }

  public start(): void {
    this._start = process.hrtime();
  }

  public elapsed(): number {
    const end = process.hrtime(this._start);
    return Math.round(end[0] * 1000 + end[1] / 1000000);
  }
}
