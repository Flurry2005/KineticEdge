import { useState, type Dispatch, type SetStateAction } from "react";
import GlowingButton from "../../../../../Components/General/GlowingButton";
import InputField from "../../../../../Components/General/InputField";
import type { Exercice } from "../../../../../types/Exercice";

interface Props {
  exercices: Exercice[];
  selectedExercices: Exercice[];
  setSelectedExercices: Dispatch<SetStateAction<Exercice[]>>;
}

function Exercise({
  exercices,
  selectedExercices,
  setSelectedExercices,
}: Props) {
  const [search, setSearch] = useState<string>("");
  return (
    <article className="bg-[#131313] text-[#ADAAAA] px-5 py-5 h-full rounded-2xl flex flex-col">
      <InputField
        placeholder="Search for exercice..."
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        additionalClasses="max-w-full! !w-fit bg-[#1A1A1A] rounded! border-0 h-10 mb-5 w-full placeholder:text-[#ADAAAA]/60 placeholder:text-xs text-white text-xs"
      ></InputField>
      <li className="list-none flex gap-5 flex-wrap overflow-y-scroll h-full">
        {exercices
          .filter((exercice: Exercice) =>
            exercice.name.toLowerCase().includes(search.toLowerCase()),
          )
          .map((exercice: Exercice) => {
            return (
              <GlowingButton
                outline={false}
                buttonType="button"
                key={exercice.name}
                onClick={() => {
                  if (selectedExercices.includes(exercice)) {
                    setSelectedExercices((prev: Exercice[]) =>
                      prev.filter((tag) => tag !== exercice),
                    );
                  } else {
                    setSelectedExercices((prev: Exercice[]) => [
                      ...prev,
                      exercice,
                    ]);
                  }
                }}
                additionalClasses={`bg-none font-black tracking-tighter text-xs w-fit! h-8! rounded-4xl! ${
                  selectedExercices.includes(exercice)
                    ? "bg-[#F3FFCA] !text-[#516700]"
                    : "!bg-[#1A1A1A] !text-[#ADAAAA]"
                }`}
              >
                {exercice.name}
              </GlowingButton>
            );
          })}
      </li>
    </article>
  );
}

export default Exercise;

{
  /* <select
  name="Furnace"
  id="Furnace"
  className="p-1 border rounded"
  value={"Test"}
  onChange={(e: any) => console.log(e.target.value)}
>
  {["Hej", "tewst"].map((level: string, index) => (
    <option key={index} value={level}>
      {"Level " + level}
    </option>
  ))}
</select>; */
}
