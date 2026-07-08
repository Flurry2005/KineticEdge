import { Footprints } from "lucide-react";
import React, { act, useEffect, useState } from "react";

function DailyEnergyExpenditure() {
  const [activityData, setActivityData] = useState<null | any>(null);

  const getData = async () => {
    const res = await fetch(
      import.meta.env.DEV
        ? "http://localhost:3000/api/withings/activity"
        : "https://api.kineticedge.liamjorgensen.dev/api/withings/activity",
      { credentials: "include" },
    );
    const data = await res.json();
    console.log(data);
    setActivityData(data);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <article className="bg-[#131313] lg:w-80 h-60 rounded-3xl relative overflow-hidden px-5 flex justify-around flex-col py-5">
      <span className="w-full h-full absolute left-0 top-0 border-[#03e948] border-l-4"></span>
      <div className="flex justify-between">
        <Footprints className="text-[#03e948]" />
        <span className="text-[#03e948] bg-[#03e948]/10 px-2 py-1 flex justify-center items-center rounded-2xl text-xs font-bold">
          Calories and Steps
        </span>
      </div>
      <h2 className="text-white text-3xl font-black tracking-tighter leading-6 "></h2>
      <div className="flex justify-between">
        <p className="text-[#ADAAAA]">
          Calories Burned{" "}
          {activityData === null ? 0 : activityData!.activeCalories!}
        </p>
        <p className="text-white"></p>
      </div>
      <div className="flex justify-between">
        <p className="text-[#ADAAAA]">
          Steps {activityData === null ? 0 : activityData!.steps!}
        </p>
        <p className="text-[#FF7441]"></p>
      </div>
      <div className="flex justify-between">
        <p className="text-[#ADAAAA]">
          TOTAL CALORIES{" "}
          {activityData === null ? 0 : activityData!.totalCalories!}
        </p>
        <p className="text-[#FF7441]"></p>
      </div>
    </article>
  );
}

export default DailyEnergyExpenditure;
