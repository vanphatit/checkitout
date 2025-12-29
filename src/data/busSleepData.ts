type SeatStatusType = 'SOLD' | 'EMPTY';

interface BusSeat {
    seatNo: string;
    status: SeatStatusType;
}

const busSleepData: BusSeat[] = [

    { seatNo: 'A1', status: 'SOLD' },
    { seatNo: 'A3', status: 'SOLD' },
    { seatNo: 'A6', status: 'EMPTY' },
    { seatNo: 'A9', status: 'EMPTY' },
    { seatNo: 'A12', status: 'EMPTY' },
    { seatNo: 'A15', status: 'SOLD' },

    { seatNo: 'A4', status: 'EMPTY' },
    { seatNo: 'A7', status: 'EMPTY' },
    { seatNo: 'A10', status: 'EMPTY' },
    { seatNo: 'A13', status: 'EMPTY' },
    { seatNo: 'A16', status: 'SOLD' },

    { seatNo: 'A2', status: 'SOLD' },
    { seatNo: 'A5', status: 'SOLD' },
    { seatNo: 'A8', status: 'EMPTY' },
    { seatNo: 'A11', status: 'EMPTY' },
    { seatNo: 'A14', status: 'EMPTY' },
    { seatNo: 'A17', status: 'SOLD' },

    { seatNo: 'B1', status: 'SOLD' },
    { seatNo: 'B3', status: 'SOLD' },
    { seatNo: 'B6', status: 'EMPTY' },
    { seatNo: 'B9', status: 'EMPTY' },
    { seatNo: 'B12', status: 'EMPTY' },
    { seatNo: 'B15', status: 'SOLD' },

    { seatNo: 'B4', status: 'EMPTY' },
    { seatNo: 'B7', status: 'EMPTY' },
    { seatNo: 'B10', status: 'EMPTY' },
    { seatNo: 'B13', status: 'EMPTY' },
    { seatNo: 'B16', status: 'SOLD' },

    { seatNo: 'B2', status: 'SOLD' },
    { seatNo: 'B5', status: 'SOLD' },
    { seatNo: 'B8', status: 'EMPTY' },
    { seatNo: 'B11', status: 'EMPTY' },
    { seatNo: 'B14', status: 'EMPTY' },
    { seatNo: 'B17', status: 'SOLD' },
];
export default busSleepData;