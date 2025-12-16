import { SortOrder, DateMetadataLabel } from './models';


export function parseViewCount(viewStr: string): number {
  const match = viewStr.match(/^([\d.]+)([MK]?)\s/);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  const suffix = match[2];
  if (suffix === 'M') return num * 1_000_000;
  if (suffix === 'K') return num * 1_000;
  return num;
}

export function viewsSorted(order: SortOrder, arr: Number[]): boolean {
  if (order === 'ascending') {
    return arr.every((x, i) => i === 0 || x >= arr[i - 1]);
  } else {
    return arr.every((x, i) => i === 0 || x <= arr[i - 1]);
  }
}

export function datesSorted(
  order: SortOrder,
  arr: DateMetadataLabel[],
): boolean {
  if (order === 'ascending') {
    return arr.every(
      (x, i) => i === 0 || new Date(x.date) >= new Date(arr[i - 1].date),
    );
  } else {
    return arr.every(
      (x, i) => i === 0 || new Date(x.date) <= new Date(arr[i - 1].date),
    );
  }
}
