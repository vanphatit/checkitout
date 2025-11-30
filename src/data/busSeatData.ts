type SeatStatusType = 'SOLD' | 'EMPTY' | 'PENDING';

interface BusSeat {
    id: string;
    status: SeatStatusType;
}

const busSeatData: BusSeat[] = [

    { id: 'A1', status: "SOLD" },
    { id: 'A3', status: "SOLD" },
    { id: 'A6', status: "PENDING" },
    { id: 'A9', status: "EMPTY" },
    { id: 'A12', status: "EMPTY" },
    { id: 'A15', status: "SOLD" },

    { id: 'A4', status: "PENDING" },
    { id: 'A7', status: "EMPTY" },
    { id: 'A10', status: "EMPTY" },
    { id: 'A13', status: "PENDING" },
    { id: 'A16', status: "SOLD" },

    { id: 'A2', status: "SOLD" },
    { id: 'A5', status: "SOLD" },
    { id: 'A8', status: "EMPTY" },
    { id: 'A11', status: "EMPTY" },
    { id: 'A14', status: "PENDING" },
    { id: 'A17', status: "SOLD" },

    { id: 'B1', status: "SOLD" },
    { id: 'B3', status: "SOLD" },
    { id: 'B6', status: "PENDING" },
    { id: 'B9', status: "EMPTY" },
    { id: 'B12', status: "EMPTY" },
    { id: 'B15', status: "SOLD" },

    { id: 'B4', status: "PENDING" },
    { id: 'B7', status: "EMPTY" },
    { id: 'B10', status: "EMPTY" },
    { id: 'B13', status: "PENDING" },
    { id: 'B16', status: "SOLD" },

    { id: 'B2', status: "SOLD" },
    { id: 'B5', status: "SOLD" },
    { id: 'B8', status: "EMPTY" },
    { id: 'B11', status: "EMPTY" },
    { id: 'B14', status: "PENDING" },
    { id: 'B17', status: "SOLD" },
];
export default busSeatData;