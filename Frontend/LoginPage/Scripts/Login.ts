/**
 * Attempts to authenticate a user with the provided credentials.
 *
 * Validates the email and password format before sending a request
 * to the backend API. If validation fails, no request is made.
 *
 * @async
 * @function Login
 *
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password (must be longer than 8 characters).
 *
 * @returns {Promise<
 *   | { success: true; data: any }
 *   | { success: false; error: string }
 * >} A promise resolving to:
 * - `{ success: true, data }` when login is successful
 * - `{ success: false, error }` when validation or request fails
 *
 * @throws {Error} Does not throw directly, but logs errors to the console
 * when network or unexpected failures occur.
 *
 * @example
 * const result = await Login("test@example.com", "password123");
 *
 * if (result.success) {
 *   console.log("User data:", result.data);
 * } else {
 *   console.error("Login failed:", result.error);
 * }
 */
export async function Login(email: string, password: string) {
  const emailRegex =
    /^(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:(?:\\[\x00-\x7F]|[^\\"]))*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}|(?:\[(?:\d{1,3}\.){3}\d{1,3}\]))$/;
  console.log(email, password);
  if (
    email.trim() === "" ||
    password.trim() === "" ||
    password.trim().length <= 8 ||
    !emailRegex.test(email)
  ) {
    //invalid formats
    console.error("Invalid email/password");
    return { success: false, error: "Invalid email/password" };
  }

  try {
    const response = await fetch(
      import.meta.env.DEV
        ? `http://192.168.1.201:3000/login`
        : "https://api.kineticedge.liamjorgensen.dev/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email, password }),
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
