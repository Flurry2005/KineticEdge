export async function getSessions() {
  try {
    const response = await fetch(
      import.meta.env.DEV
        ? `http://192.168.1.201:3000/get-sessions`
        : "https://api.kineticedge.liamjorgensen.dev/get-sessions",
      {
        method: "GET",
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
