import { LuArmchair } from "react-icons/lu";

const SeatLegend = () => {
  return (
    <div className="w-full flex flex-wrap items-center justify-center gap-8 border-b border-neutral-300 pb-2 mb-2">
      {/* Empty */}
      <div className="flex flex-col items-center gap-y-0.5 group cursor-pointer">
        <LuArmchair className="text-lg text-primary transition-transform duration-200 group-hover:scale-110 group-hover:text-blue-900" />
        <p className="text-xs text-primary font-medium group-hover:text-blue-900">
          Empty
        </p>
      </div>

      {/* Sold */}
      <div className="flex flex-col items-center gap-y-0.5 group cursor-pointer">
        <LuArmchair className="text-lg text-neutral-500 transition-transform duration-200 group-hover:scale-110 group-hover:text-neutral-700" />
        <p className="text-xs text-neutral-500 font-medium group-hover:text-neutral-700">
          Sold
        </p>
      </div>

      {/* Selected */}
      <div className="flex flex-col items-center gap-y-0.5 group cursor-pointer">
        <LuArmchair className="text-lg text-red-400 transition-transform duration-200 group-hover:scale-110 group-hover:text-red-600" />
        <p className="text-xs text-red-400 font-medium group-hover:text-red-600">
          Selected
        </p>
      </div>
    </div>
  );
};

export default SeatLegend;
