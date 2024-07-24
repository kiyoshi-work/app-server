export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function randomSecond(maxSeconds: number) {
  return Math.floor(Math.random() * maxSeconds) + 1;
}
export function randomElementInArray(array: any[]) {
  return array[randomSecond(array.length) - 1];
}
export function syntaxHighlight(json: any) {
  if (typeof json != 'string') {
    json = JSON.stringify(json, undefined, 2);
  }
  return json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export type FeasibleCases = {
  id?: number | string;
  probability: number;
};

export const getRandomWithProb = (feasibleCases: FeasibleCases[]): number => {
  //Normalize
  const sumFeasibleCasesProb = feasibleCases.reduce(
    (s, item) => s + item.probability,
    0,
  );
  for (let feasibleCase of feasibleCases) {
    feasibleCase.probability /= sumFeasibleCasesProb;
  }
  if (feasibleCases.length === 0)
    throw Error('Error: Feasible Cases are empty');
  let pivots: number[] = [feasibleCases[0].probability];
  for (let i = 1; i < feasibleCases.length; i++) {
    let prevPivot: number = pivots[pivots.length - 1];
    pivots.push(feasibleCases[i].probability + prevPivot);
  }
  const picker: number = Math.random();
  let chosenPivot: number = pivots.filter((pivot) => picker <= pivot)[0];
  let chosenOne: number = pivots.indexOf(chosenPivot);
  return chosenOne;
};
