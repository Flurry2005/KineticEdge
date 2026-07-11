import { Footprints, Road, WavesVertical } from "lucide-react";
import { useWithings } from "../../../../Context/useWitings";

function DailyEnergyExpenditure() {
  const { todaysActivity } = useWithings();

  return (
    <article className="bg-[#131313] lg:w-80 h-60 rounded-3xl relative overflow-hidden px-5 flex justify-around flex-col py-5">
      <span className="w-full h-full absolute left-0 top-0 border-[#03e948] border-l-4"></span>
      <div className="flex justify-between">
        <Footprints className="text-[#03e948]" />
        <span className="text-[#03e948] bg-[#03e948]/10 px-2 py-1 flex justify-center items-center rounded-2xl text-xs font-bold">
          Calories and Steps
        </span>
      </div>
      <h2 className="text-white text-3xl font-black tracking-tighter leading-6 ">
        TODAY
      </h2>
      <div className="flex justify-between">
        <p className="text-[#ADAAAA] flex items-center gap-3">
          Calories Burned{" "}
          {todaysActivity === undefined
            ? "Loading..."
            : todaysActivity!.activeCalories!}{" "}
          <WavesVertical className="text-orange-400 w-4 h-4" />
        </p>
        <p className="text-white"></p>
      </div>
      <div className="flex justify-between">
        <p className="text-[#ADAAAA] flex gap-3 items-center">
          Steps{" "}
          {todaysActivity === undefined ? "Loading..." : todaysActivity!.steps!}
          <Footprints className="text-[#d1be0f]" />
        </p>
        <p className="text-[#FF7441]"></p>
      </div>
      <div className="flex justify-between">
        <p className="text-[#ADAAAA] flex gap-3 items-center">
          Distance{" "}
          {todaysActivity === undefined
            ? "Loading..."
            : (todaysActivity!.distance! / 1000).toFixed(2)}{" "}
          KM
          <Road className="text-[#b11c23]" />
        </p>
        <p className="text-[#FF7441]"></p>
      </div>
      <div className="flex justify-between">
        <p className="text-[#ADAAAA]">
          TOTAL CALORIES{" "}
          {todaysActivity === undefined
            ? "Loading..."
            : todaysActivity!.totalCalories!}
        </p>
        <p className="text-[#FF7441]"></p>
      </div>
    </article>
  );
}

export default DailyEnergyExpenditure;
