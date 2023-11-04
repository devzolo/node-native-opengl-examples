export function sleep(delay: number): Promise<void> {
  return new Promise(function (resolve) {
    setTimeout(resolve, delay);
  });
}

export const performance = {
  now: function (start?: number | [number, number] | undefined): number | [number, number] {
    if (!start) return process.hrtime();
    const end = process.hrtime(start as [number, number]);
    return Math.round(end[0] * 1000 + end[1] / 1000000);
  },
};
