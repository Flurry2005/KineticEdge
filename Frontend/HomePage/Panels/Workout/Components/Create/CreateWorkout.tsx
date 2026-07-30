import { useState } from "react";
import InputField from "../../../../../Components/General/InputField";
import { createWorkout } from "../../Scripts/CreateWorkout";
import GlowingButton from "../../../../../Components/General/GlowingButton";
import Exercise from "./Exercise";
import type { Exercice } from "../../../../../types/Exercice";

interface Props {
  exercices: Exercice[];
}

function CreateWorkout({ exercices }: Props) {
  const [selectedExercices, setSelectedExercices] = useState<Exercice[]>([]);

  const [tags, setTags] = useState<string[]>([]);

  const [showSuccess, setShowSuccess] = useState(false);

  return (
    <div
      className="
      relative
      bg-[#111111]
      border border-[#242424]
      rounded-3xl
      p-6
      shadow-xl
      "
    >
      {/* SUCCESS POPUP */}

      {showSuccess && (
        <div
          className="
            fixed
            top-6
            right-6
            z-50
            flex
            items-center
            gap-3
            bg-[#CAFD00]
            text-[#4A5E00]
            px-6
            py-4
            rounded-2xl
            font-black
            text-sm
            shadow-[0_0_30px_rgba(202,253,0,0.5)]
            animate-bounce
            "
        >
          <span className="text-lg">✓</span>
          Workout created successfully!
        </div>
      )}

      <form
        onSubmit={async (e) => {
          e.preventDefault();

          const form = e.currentTarget;

          const formData = new FormData(form);

          const workoutName = formData.get("workoutName")?.toString();

          const workoutDesc = formData.get("workoutDesc")?.toString();

          const res = await createWorkout(
            workoutName!,
            workoutDesc!,
            tags,
            selectedExercices,
          );

          if (res.success) {
            // clear inputs
            form.reset();

            // clear tags
            setTags([]);

            // clear exercises
            setSelectedExercices([]);

            // show popup
            setShowSuccess(true);

            setTimeout(() => {
              setShowSuccess(false);
            }, 3000);
          }
        }}
        method="POST"
        className="
        flex
        flex-col
        gap-8
        "
      >
        {/* HEADER */}
        <div>
          <h2
            className="
            text-white
            text-3xl
            font-black
            tracking-tighter
            "
          >
            Create Workout
          </h2>

          <p
            className="
            text-[#777]
            text-sm
            mt-1
            "
          >
            Build your custom training session
          </p>
        </div>
        {/* WORKOUT NAME */}
        <div
          className="
          flex
          flex-col
          gap-2
          "
        >
          <label
            className="
            text-white
            text-sm
            font-bold
            "
          >
            Workout Name
          </label>

          <InputField
            placeholder="Chest Focus"
            id="workoutName"
            name="workoutName"
            required={true}
            additionalClasses="
            bg-[#1A1A1A]
            border border-[#292929]
            rounded-2xl
            h-12
            w-full
            text-white
            text-sm
            placeholder:text-[#666]
            "
          />
        </div>
        {/* DESCRIPTION */}
        <div
          className="
          flex
          flex-col
          gap-2
          "
        >
          <label
            className="
            text-white
            text-sm
            font-bold
            "
          >
            Description
          </label>

          <InputField
            placeholder="Push workout focused on chest..."
            id="workoutDesc"
            name="workoutDesc"
            required={true}
            additionalClasses="
            bg-[#1A1A1A]
            border border-[#292929]
            rounded-2xl
            h-12
            w-full
            text-white
            text-sm
            placeholder:text-[#666]
            "
          />
        </div>{" "}
        {/* TAGS */}
        <div
          className="
          flex
          flex-col
          gap-3
          "
        >
          <p
            className="
            text-white
            text-sm
            font-bold
            "
          >
            Workout Focus
          </p>

          <div
            className="
            flex
            flex-wrap
            gap-3
            "
          >
            {["Chest", "Back", "Legs"].map((tag) => (
              <GlowingButton
                key={tag}
                outline={false}
                buttonType="button"
                onClick={() => {
                  if (tags.includes(tag)) {
                    setTags((prev) => prev.filter((t) => t !== tag));
                  } else {
                    setTags((prev) => [...prev, tag]);
                  }
                }}
                additionalClasses={`

                bg-none
                font-black
                text-xs
                rounded-full
                px-5
                py-2
                transition-all

                ${
                  tags.includes(tag)
                    ? `
                  !bg-[#F3FFCA]
                  !text-[#516700]
                  shadow-[0_0_15px_rgba(243,255,202,0.35)]
                  `
                    : `
                  !bg-[#1A1A1A]
                  !text-[#ADAAAA]
                  border border-[#292929]
                  `
                }

                `}
              >
                {tag}
              </GlowingButton>
            ))}
          </div>
        </div>
        {/* EXERCISES */}
        <div
          className="
          flex
          flex-col
          gap-3
          "
        >
          <div>
            <p
              className="
              text-white
              text-sm
              font-bold
              "
            >
              Exercises
            </p>

            <p
              className="
              text-[#777]
              text-xs
              "
            >
              Choose exercises for this workout
            </p>
          </div>

          <div
            className="
            bg-[#161616]
            border border-[#242424]
            rounded-3xl
            h-100
            p-4
            "
          >
            <Exercise
              exercices={exercices}
              selectedExercices={selectedExercices}
              setSelectedExercices={setSelectedExercices}
            />
          </div>
        </div>
        {/* CREATE BUTTON */}
        <GlowingButton
          outline={false}
          onClick={() => {}}
          additionalClasses="
          bg-none
          !bg-[#CAFD00]
          font-black
          tracking-tight
          text-xs
          !text-[#4A5E00]
          w-full!
          h-12
          rounded-2xl
          hover:scale-[1.02]
          transition-all
          shadow-[0_0_25px_rgba(202,253,0,0.3)]
          "
        >
          + CREATE WORKOUT
        </GlowingButton>
      </form>
    </div>
  );
}

export default CreateWorkout;
