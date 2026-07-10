import type { Session } from "../../../../types/Session";

export async function updateSession(session: Session) {
  try {
    const response = await fetch(
      import.meta.env.DEV
        ? `http://192.168.1.201:3000/update-session`
        : "https://api.kineticedge.liamjorgensen.dev/update-session",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ session: session }),
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
