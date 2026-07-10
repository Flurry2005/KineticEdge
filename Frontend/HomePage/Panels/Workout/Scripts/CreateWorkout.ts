import type { Exercice } from "../../../../types/Exercice";

export async function createWorkout(
  workoutName: string,
  workoutDesc: string,
  tags: string[],
  exercices: Exercice[],
) {
  if (workoutName.trim() === "" || workoutName.trim().length <= 2) {
    //invalid formats
    console.error("Invalid workout name");
    return { success: false, error: "Invalid workout name" };
  }

  try {
    const response = await fetch(
      import.meta.env.DEV
        ? `http://192.168.1.201:3000/create-workout`
        : "https://api.kineticedge.liamjorgensen.dev/create-workout",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workoutName: workoutName,
          workoutDesc: workoutDesc,
          tags,
          exercices,
        }),
        credentials: "include",
      },
    );

    const res = await response.json();

    if (res.success) {
      return { success: res.success, data: res.data };
    } else {
      return { success: res.success, error: res.error };
    }
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to contact server" };
  }
}
