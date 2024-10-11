export function RandomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function RandomBoolean(): boolean {
  return Math.random() >= 0.5;
}

export function RandomArray<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function RandomString(length: number): string {
  return Math.random()
    .toString(36)
    .substring(2, length + 2);
}
