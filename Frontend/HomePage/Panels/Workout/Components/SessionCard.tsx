import { useState } from "react";
import GlowingButton from "../../../../Components/General/GlowingButton";
import type { Session } from "../../../../types/Session";
import { updateSession } from "../Scripts/UpdateSession";
import type { Workout } from "../../../../types/Workout";
import type { Set } from "../../../../types/Set";
import InputField from "../../../../Components/General/InputField";
import { useSessions } from "../../../../Context/useSessions";
import { useAuth } from "../../../../Context/useAuth";

interface Props {
  session: Session;
  day: string;
  month: string;
  year: string;
  workout: Workout;
  tags: string[];
}

function SessionCard({ session, day, month, year, workout, tags }: Props) {
  const [showDetails, setShowDetails] = useState(false);

  const [sessionData, setSessionData] = useState<Session>(session);

  const { setSessions } = useSessions();
  const { logout } = useAuth();

  const updateSessionApi = async (s: Session) => {
    const res = await updateSession(s);

    if (!res.success) {
      logout();
    }
  };

  const saveSession = (updatedSession: Session) => {
    updateSessionApi(updatedSession);

    setSessionData(updatedSession);

    setSessions((prev: Session[] | undefined) => {
      if (!prev) return prev;

      return prev.map((sessionS) =>
        sessionS._id === session._id ? updatedSession : sessionS,
      );
    });
  };

  return (
    <div
      className="
      bg-[#111111]
      border border-[#242424]
      rounded-3xl
      p-6
      shadow-xl
      hover:border-[#3a3a3a]
      transition
      "
    >
      {/* HEADER */}

      <section
        className="
        flex
        flex-col
        xl:flex-row
        gap-6
        items-center
        "
      >
        {/* DATE */}

        <div className="flex flex-col items-center min-w-20">
          <p
            className="
          text-5xl
          font-black
          text-white
          tracking-tighter
          "
          >
            {day}
          </p>

          <p
            className="
          text-xs
          font-bold
          text-[#8b8b8b]
          "
          >
            {month.toUpperCase()}
          </p>

          <p
            className="
          text-xs
          text-[#555]
          "
          >
            {year}
          </p>
        </div>

        <div
          className="
          hidden
          xl:block
          h-20
          w-px
          bg-[#292929]
          "
        />

        {/* INFO */}

        <div className="flex-1 flex flex-col gap-2">
          <span
            className={`
            w-fit
            px-4
            py-2
            rounded-full
            text-xs
            font-black
            ${
              sessionData.completed
                ? "bg-lime-300/10 text-lime-300"
                : "bg-orange-400/10 text-orange-400"
            }
            `}
          >
            {sessionData.completed ? "COMPLETED" : "NOT COMPLETED"}
          </span>

          <h2
            className="
            text-4xl
            text-white
            font-black
            tracking-tighter
            "
          >
            {workout.workoutName ?? "Unknown workout"}
          </h2>

          <p
            className="
            text-sm
            text-[#8b8b8b]
            "
          >
            {workout.workoutDesc}
          </p>

          <div
            className="
          flex
          flex-wrap
          gap-2
          mt-2
          "
          >
            {tags.map((tag) => (
              <span
                key={tag}
                className="
                  px-3
                  py-1
                  rounded-full
                  text-xs
                  bg-[#1c1c1c]
                  border border-[#2c2c2c]
                  text-gray-300
                  "
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* EXPAND BUTTON */}

        <button
          className="
          bg-[#1d1d1d]
          hover:bg-[#292929]
          w-12
          h-12
          rounded-full
          flex
          justify-center
          items-center
          transition
          cursor-pointer
          "
          onClick={() => setShowDetails(!showDetails)}
        >
          <img
            src="RightArrowIcon.png"
            alt=""
            className={`
            w-3
            transition-transform
            duration-300
            ${showDetails ? "-rotate-90" : "rotate-90"}
            `}
          />
        </button>
      </section>
      {showDetails && (
        <div
          className="
          mt-8
          border-t
          border-[#252525]
          pt-8
          "
        >
          <div
            className="
            grid
            grid-cols-1
            lg:grid-cols-2
            gap-6
            "
          >
            {sessionData.exercices.map((exercise, exerciseIndex) => (
              <article
                key={exerciseIndex}
                className="
                  bg-[#161616]
                  border border-[#252525]
                  rounded-3xl
                  p-5
                  "
              >
                <h3
                  className="
                    text-white
                    font-black
                    text-xl
                    tracking-tight
                    mb-5
                    w-fit
                    "
                >
                  {exercise.name.toUpperCase()}
                </h3>

                <div className="flex flex-col gap-3">
                  {exercise.sets?.map((set: Set, index: number) => (
                    <div
                      key={index}
                      className="
                        flex
                        items-center
                        gap-3
                        bg-[#101010]
                        rounded-2xl
                        p-3
                        "
                    >
                      {/* SET NUMBER */}

                      <span
                        className="
                          bg-lime-300/10
                          text-lime-300
                          px-3
                          py-1
                          rounded-full
                          text-xs
                          font-black
                          text-center
                          "
                      >
                        SET {index + 1}
                      </span>

                      {/* REPS */}

                      <div className="flex-1 w-full">
                        <p
                          className="
                            text-[10px]
                            text-gray-500
                            "
                        >
                          REPS
                        </p>

                        <InputField
                          placeholder="0"
                          value={set.reps}
                          additionalClasses="
                            bg-[#1b1b1b]
                            border-none
                            rounded-xl
                            h-8
                            text-white
                            text-xs
                            w-full
                            "
                          onChange={(e) => {
                            const value = Number(e.target.value);

                            if (isNaN(value)) return;

                            const updatedSession = {
                              ...sessionData,

                              exercices: sessionData.exercices.map((ex) =>
                                ex === exercise
                                  ? {
                                      ...ex,

                                      sets: ex.sets?.map((s, i) =>
                                        i === index
                                          ? {
                                              ...s,
                                              reps: value,
                                            }
                                          : s,
                                      ),
                                    }
                                  : ex,
                              ),
                            };

                            saveSession(updatedSession);
                          }}
                        />
                      </div>

                      {/* WEIGHT */}

                      <div className="flex-1 w-full">
                        <p
                          className="
                            text-[10px]
                            text-gray-500
                            "
                        >
                          KG
                        </p>

                        <InputField
                          placeholder="0"
                          value={set.weight}
                          additionalClasses="
                            bg-[#1b1b1b]
                            border-none
                            rounded-xl
                            h-8
                            text-white
                            text-xs
                            w-full
                            "
                          onChange={(e) => {
                            const value = Number(e.target.value);

                            if (isNaN(value)) return;

                            const updatedSession = {
                              ...sessionData,

                              exercices: sessionData.exercices.map((ex) =>
                                ex === exercise
                                  ? {
                                      ...ex,

                                      sets: ex.sets?.map((s, i) =>
                                        i === index
                                          ? {
                                              ...s,
                                              weight: value,
                                            }
                                          : s,
                                      ),
                                    }
                                  : ex,
                              ),
                            };

                            saveSession(updatedSession);
                          }}
                        />
                      </div>

                      {/* REMOVE SET */}

                      <button
                        className="
                          bg-red-500/10
                          text-red-400
                          hover:bg-red-500/20
                          rounded-xl
                          w-8
                          h-8
                          transition
                          "
                        onClick={() => {
                          if (!window.confirm("Remove this set?")) return;

                          const updatedSession = {
                            ...sessionData,

                            exercices: sessionData.exercices.map((ex) =>
                              ex === exercise
                                ? {
                                    ...ex,

                                    sets: ex.sets?.filter(
                                      (_, i) => i !== index,
                                    ),
                                  }
                                : ex,
                            ),
                          };

                          saveSession(updatedSession);
                        }}
                      >
                        -
                      </button>
                    </div>
                  ))}
                </div>

                {/* ADD SET */}

                <button
                  className="
                    mt-5
                    w-full
                    bg-lime-300/10
                    text-lime-300
                    border border-lime-300/20
                    rounded-2xl
                    py-3
                    font-black
                    text-xs
                    hover:bg-lime-300/20
                    transition
                    cursor-pointer
                    "
                  onClick={() => {
                    const defaultSet: Set = {
                      reps: 0,

                      weight: 0,
                    };

                    const updatedSession = {
                      ...sessionData,

                      exercices: sessionData.exercices.map((ex) =>
                        ex === exercise
                          ? {
                              ...ex,

                              sets: [...(ex.sets ?? []), defaultSet],
                            }
                          : ex,
                      ),
                    };

                    saveSession(updatedSession);
                  }}
                >
                  + ADD SET
                </button>
              </article>
            ))}
          </div>

          {/* COMPLETE BUTTON */}

          <div
            className="
            flex
            justify-center
            mt-8
            "
          >
            <GlowingButton
              outline={false}
              onClick={() => {
                const updatedSession = {
                  ...sessionData,

                  completed: !sessionData.completed,
                };

                saveSession(updatedSession);
              }}
              additionalClasses={`
  bg-none
  !bg-lime-400
  rounded-2xl
  px-5
  py-3
  tracking-tight
  font-black
  cursor-pointer
  !text-[#4A5E00]
  w-fit
  text-xs
  transition-all
  duration-300
  hover:scale-105
  hover:shadow-[0_0_20px_rgba(163,230,53,0.45),0_0_40px_rgba(163,230,53,0.25)]

  ${
    sessionData.completed
      ? `
        !bg-red-400
        !text-red-950
        hover:shadow-[0_0_20px_rgba(248,113,113,0.6),0_0_40px_rgba(248,113,113,0.3)]
      `
      : ""
  }
`}
            >
              {sessionData.completed
                ? "UNCOMPLETE WORKOUT"
                : "COMPLETE WORKOUT"}
            </GlowingButton>
          </div>
        </div>
      )}
    </div>
  );
}

export default SessionCard;
