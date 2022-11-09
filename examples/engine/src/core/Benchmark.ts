export class Benchmark {
  #start: [number, number] | undefined;

  constructor() {
    this.start();
  }

  public start(): void {
    this.#start = process.hrtime();
  }

  public elapsed(): number {
    const end = process.hrtime(this.#start);
    return Math.round(end[0] * 1000 + end[1] / 1000000);
  }
}
