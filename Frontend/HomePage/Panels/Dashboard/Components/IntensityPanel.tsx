import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Line,
} from "recharts";
import { formatWeight } from "../../../../utils/FormatWeight";
import { useSessions } from "../../../../Context/useSessions";
import type { Session } from "../../../../types/Session";

function IntensityPanel() {
  const { sessions } = useSessions();
  const now = new Date();

  const startOfWeek = new Date(now);
  const day = now.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday start
  startOfWeek.setDate(now.getDate() + diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const weekVolumeData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);

    const volume =
      sessions?.reduce((acc, session) => {
        if (!session.completed) return acc;

        const sessionDate = new Date(session.date);

        const sameDay =
          sessionDate.getFullYear() === date.getFullYear() &&
          sessionDate.getMonth() === date.getMonth() &&
          sessionDate.getDate() === date.getDate();

        if (!sameDay) return acc;

        const sessionVolume = session.exercices.reduce(
          (exerciseAcc, exercise) => {
            return (
              exerciseAcc +
              (exercise.sets ?? []).reduce((setAcc, set) => {
                return setAcc + (set.weight ?? 0) * (set.reps ?? 0);
              }, 0)
            );
          },
          0,
        );

        return acc + sessionVolume;
      }, 0) ?? 0;

    return {
      date: date.toLocaleDateString("en-US", { weekday: "short" }),
      volume,
    };
  });

  const maxVolume = Math.max(...weekVolumeData.map((d) => d.volume), 100);

  return (
    <article className="bg-[#131313] lg:w-120 h-75 rounded-2xl justify-between p-6 flex flex-col gap-2">
      <h2 className="text-[#F3FFCA] font-extrabold text-xs">
        WEEKLY INTENSITY
      </h2>
      <div>
        <div className="flex items-end gap-2">
          <h2 className="text-3xl text-white font-extrabold">
            {formatWeight(
              sessions === undefined
                ? 0
                : sessions
                    .filter((session: Session) => {
                      const now = new Date();
                      const sessionDate = new Date(session.date);

                      const startOfWeek = new Date(now);
                      const day = now.getDay();
                      const diff = (day === 0 ? -6 : 1) - day;
                      startOfWeek.setDate(now.getDate() + diff);
                      startOfWeek.setHours(0, 0, 0, 0);

                      const endOfWeek = new Date(startOfWeek);
                      endOfWeek.setDate(startOfWeek.getDate() + 7);

                      return (
                        session.completed &&
                        sessionDate >= startOfWeek &&
                        sessionDate < endOfWeek
                      );
                    })
                    .reduce((sessionAcc, session) => {
                      return (
                        sessionAcc +
                        session.exercices.reduce((exerciseAcc, exercise) => {
                          return (
                            exerciseAcc +
                            (exercise.sets ?? []).reduce((setAcc, set) => {
                              return (
                                setAcc + (set.weight || 0) * (set.reps || 0)
                              );
                            }, 0)
                          );
                        }, 0)
                      );
                    }, 0),
            )}
          </h2>
          <p className="text-[#ADAAAA]">TOTAL KGs MOVED</p>
        </div>
      </div>
      {/* Graph */}
      <div className="bg-zinc-900 rounded-xl p-2 h-[450px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={weekVolumeData}>
            <XAxis dataKey="date" />

            <YAxis domain={[0, Math.ceil(maxVolume * 1.1)]} unit=" kg" />

            <Tooltip
              formatter={(value: number) => [
                `${formatWeight(value)} kg`,
                "Volume",
              ]}
            />

            <Line
              dataKey="volume"
              stroke="#84cc16"
              strokeWidth={3}
              type="monotone"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

export default IntensityPanel;
