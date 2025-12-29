import { Seat } from "@/types/seat";

export function splitRows4(seats: Seat[]) {
  const sorted = [...seats].sort((a, b) => {
    const na = Number(a.seatNo.slice(1));
    const nb = Number(b.seatNo.slice(1));
    return na - nb;
  });

  const rows: Seat[][] = [];

  for (let i = 0; i < sorted.length; i += 4) {
    rows.push(sorted.slice(i, i + 4).reverse());
  }

  return rows;
}
