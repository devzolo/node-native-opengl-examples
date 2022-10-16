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
