import React, { useState } from "react";
import type { Workout } from "../../../../types/Workout";
import GlowingButton from "../../../../Components/General/GlowingButton";
import { addSession } from "../Scripts/AddSession";
import { useSessions } from "../../../../Context/useSessions";

interface Props {
  closeSelector: () => void;
  workouts: Workout[];
}

function WorkoutSelector({ closeSelector, workouts }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="
          bg-[#131313]
          w-full
          max-w-3xl
          max-h-[85vh]
          rounded-3xl
          p-6
          overflow-y-auto
          shadow-2xl
        "
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-3xl font-black tracking-tight">
            YOUR WORKOUTS
          </h2>

          <button
            onClick={closeSelector}
            className="
              text-white/50
              hover:text-white
              text-xl
              transition
              cursor-pointer
            "
          >
            ✕
          </button>
        </div>

        <section className="flex flex-col gap-4">
          {workouts.map((workout) => (
            <WorkoutCard
              key={workout._id ?? workout.workoutName}
              workout={workout}
              closeSelector={closeSelector}
            />
          ))}
        </section>
      </div>
    </div>
  );
}

export default WorkoutSelector;

function WorkoutCard({
  workout,
  closeSelector,
}: {
  workout: Workout;
  closeSelector: () => void;
}) {
  const { updateSessions } = useSessions();

  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(today);

  async function handleAdd() {
    const selectedDate = new Date(date);

    if (isNaN(selectedDate.getTime())) return;

    await addSession(workout._id, selectedDate);

    updateSessions();

    closeSelector();
  }

  return (
    <article
      className="
        bg-[#1A1A1A]
        rounded-3xl
        p-5
        transition
        hover:bg-[#202020]
      "
    >
      <h3 className="text-white text-3xl font-black">{workout.workoutName}</h3>

      <div className="flex flex-wrap gap-2 mt-3">
        {workout.tags.map((tag) => (
          <span
            key={tag}
            className="
              bg-[#131313]
              text-white/70
              px-3
              py-1
              text-xs
              rounded-full
            "
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-4 mt-6">
        <label className="text-white/60 text-sm">Workout date</label>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="
            bg-[#131313]
            text-white
            rounded-xl
            px-4
            py-2
            outline-none
            border
            border-white/10
            focus:border-white/30
            cursor-pointer
          "
        />
      </div>

      <div className="mt-6">
        <GlowingButton
          outline={false}
          onClick={handleAdd}
          additionalClasses="
            text-black!
            w-full
          "
        >
          ADD SESSION
        </GlowingButton>
      </div>
    </article>
  );
}
