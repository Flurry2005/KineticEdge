import type { User } from "../../../../types/User";

export async function updateUser(user: User) {
  try {
    const response = await fetch(
      import.meta.env.DEV
        ? `http://192.168.1.201:3000/update-user`
        : "https://api.kineticedge.liamjorgensen.dev/update-user",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...user }),
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
