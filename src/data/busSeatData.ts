type SeatStatusType = "SOLD" | "EMPTY";

interface BusSeat {
    seatNo: string;
    status: SeatStatusType;
}

const busSeatData: BusSeat[] = [
    { seatNo: "1", status: "EMPTY" },
    { seatNo: "2", status: "SOLD" },
    { seatNo: "3", status: "EMPTY" },
    { seatNo: "4", status: "EMPTY" },
    { seatNo: "5", status: "EMPTY" },
    { seatNo: "6", status: "SOLD" },
    { seatNo: "7", status: "EMPTY" },

    { seatNo: "8", status: "SOLD" },
    { seatNo: "9", status: "EMPTY" },
    { seatNo: "10", status: "EMPTY" },
    { seatNo: "11", status: "EMPTY" },
    { seatNo: "12", status: "SOLD" },
    { seatNo: "13", status: "EMPTY" },
    { seatNo: "14", status: "EMPTY" },

    { seatNo: "15", status: "EMPTY" },
    { seatNo: "16", status: "SOLD" },
    { seatNo: "17", status: "EMPTY" },
    { seatNo: "18", status: "EMPTY" },
    { seatNo: "19", status: "EMPTY" },
    { seatNo: "20", status: "SOLD" },
    { seatNo: "21", status: "EMPTY" },

    { seatNo: "22", status: "SOLD" },
    { seatNo: "23", status: "EMPTY" },
    { seatNo: "24", status: "EMPTY" },
    { seatNo: "25", status: "EMPTY" },
    { seatNo: "26", status: "SOLD" },
    { seatNo: "27", status: "EMPTY" },
    { seatNo: "28", status: "EMPTY" },
];

export default busSeatData;
