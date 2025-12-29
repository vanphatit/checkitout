import { Seat } from "@/types/seat";

/**
 * Layout cố định:
 *  Cột 1 | Cột 2 | Cột 3
 *  A1    |  X    | A2
 *  A3    | A4   | A5
 *  A6    | A7   | A8
 *  A9    | A10  | A11
 *  A12   | A13  | A14
 *  A15   | A16  | A17
 */
export const sleeperGridMap: (string | null)[][] = [
  ["1", null, "2"],
  ["3", "4", "5"],
  ["6", "7", "8"],
  ["9", "10", "11"],
  ["12", "13", "14"],
  ["15", "16", "17"],
];

export function buildSleeperGrid(
  seats: Seat[],
  prefix: "A" | "B"
): (Seat | null)[][] {
  const seatMap = new Map<string, Seat>();

  seats.forEach((seat) => {
    // A1 → 1 | B12 → 12
    const num = seat.seatNo.replace(prefix, "");
    seatMap.set(num, seat);
  });

  return sleeperGridMap.map((row) =>
    row.map((cell) => (cell ? seatMap.get(cell) ?? null : null))
  );
}
