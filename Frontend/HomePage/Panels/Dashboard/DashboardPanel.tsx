import NavBar from "../../../NavBar";
import { formatWeight } from "../../../utils/FormatWeight";
import { useSessions } from "../../../Context/useSessions";
import type { Session } from "../../../types/Session";
import { useWorkouts } from "../../../Context/useWorkouts";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import IntensityPanel from "./Components/IntensityPanel";
import DailyEnergyExpenditure from "./Components/DailyEnergyExpenditure";

function DashboardPanel() {
  const { sessions } = useSessions();
  const { workouts } = useWorkouts();
  const latestSession: Session | undefined = sessions?.reduce(
    (closest, session) => {
      const now = Date.now();
      const sessionTime = new Date(session.date).getTime();

      if (sessionTime > now || !session.completed) return closest;

      if (!closest) return session;

      const closestTime = new Date(closest.date).getTime();

      return sessionTime > closestTime ? session : closest;
    },
    undefined as Session | undefined,
  );

  return (
    <div className="w-full">
      <NavBar></NavBar>
      <main className="flex flex-col px-10  lg:px-10 gap-10 h-full pt-10 w-full">
        <section className="flex justify-between rounded-2xl overflow-hidden relative w-full h-fit">
          <div className="w-full h-60 absolute border-b-4 left-0 bg-linear-to-b from-neutral-500/70 to-black/90 border-lime-600 rounded"></div>
          <h2 className="absolute left-10 top-25 text-white text-xl sm:text-3xl lg:text-5xl xl:text-6xl font-black tracking-tighter text-nowrap">
            WELCOME BACK, CHAMP.
          </h2>
          <p className="absolute left-10 top-33 md:top-35  lg:top-42 text-[#ADAAAA] pr-5">
            You've hit 85% of your weekly volume target. One more session to
            peak performance.
          </p>
          <img
            src="./dashboardPicture.png"
            alt=""
            className="max-w-full w-full h-60 aspect-square object-cover rounded-2xl"
          />
        </section>
        <section className="flex gap-10 flex-col pb-10 md:pb-0 md:flex-row">
          <IntensityPanel />
          <article className="bg-[#131313] lg:w-80 h-60 rounded-3xl relative overflow-hidden px-5 flex justify-around flex-col py-5">
            <span className="w-full h-full absolute left-0 top-0 border-[#FF7441] border-l-4"></span>
            <div className="flex justify-between">
              <img src="latestIcon.png" alt="" className="h-6" />
              <span className="text-[#FF7441] bg-[#FF7441]/10 px-2 py-1 flex justify-center items-center rounded-2xl text-xs font-bold">
                {latestSession
                  ? (() => {
                      const now = new Date();
                      const sessionDate = new Date(latestSession.date);

                      const today = new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        now.getDate(),
                      );

                      const target = new Date(
                        sessionDate.getFullYear(),
                        sessionDate.getMonth(),
                        sessionDate.getDate(),
                      );

                      const diffDays = Math.round(
                        (target.getTime() - today.getTime()) /
                          (1000 * 60 * 60 * 24),
                      );

                      if (diffDays === 0) return "TODAY";
                      if (diffDays === -1) return "YESTERDAY";

                      const days = Math.abs(diffDays);
                      return `${days} DAY${days > 1 ? "S" : ""} AGO`;
                    })()
                  : "No Previous Session"}
              </span>
            </div>
            <h2 className="text-white text-3xl font-black tracking-tighter leading-6 ">
              {latestSession
                ? workouts?.filter(
                    (workout) => workout._id === latestSession.workoutId,
                  )[0].workoutName
                : "NO PREVIOUS SESSION"}
            </h2>
            <div className="flex justify-between">
              <p className="text-[#ADAAAA]">Exercices</p>
              <p className="text-white">
                {latestSession ? latestSession.exercices.length : "None"}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-[#ADAAAA]">Sets</p>
              <p className="text-[#FF7441]">
                {latestSession
                  ? latestSession.exercices.reduce(
                      (acc, exercise) => acc + (exercise.sets?.length ?? 0),
                      0,
                    )
                  : "None"}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-[#ADAAAA]">TOTAL VOLUME</p>
              <p className="text-[#FF7441]">
                {latestSession
                  ? formatWeight(
                      latestSession.exercices.reduce((acc, exercise) => {
                        return (
                          acc +
                          (exercise.sets?.reduce((setAcc, set) => {
                            return setAcc + (set.weight || 0) * (set.reps || 0);
                          }, 0) ?? 0)
                        );
                      }, 0),
                    ) + " KG"
                  : "None"}
              </p>
            </div>
          </article>
          <DailyEnergyExpenditure />
        </section>
      </main>
    </div>
  );
}

export default DashboardPanel;
