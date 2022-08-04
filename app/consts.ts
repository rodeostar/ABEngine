export const DEFAULT_BOARD_SIZE = 5;

export const createEmptyBoard = <T>(
  count = DEFAULT_BOARD_SIZE
): Array<T | null> => new Array(count).fill(null);
