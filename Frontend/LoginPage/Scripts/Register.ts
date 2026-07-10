/**
 * Registers a new user with the provided details.
 *
 * Performs basic validation on input fields before sending a request
 * to the backend API. If validation fails, no request is made.
 *
 * @async
 * @function Register
 *
 * @param {string} fullname - The user's full name.
 * @param {string} username - The user's chosen username.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password (must be longer than 8 characters).
 *
 * @returns {Promise<
 *   | { success: true; message: string }
 *   | { success: false; error?: string; data?: string }
 * >} A promise resolving to:
 * - `{ success: true, message }` when registration is successful
 * - `{ success: false, error }` when the API returns an error
 *
 * @throws {Error} Does not throw directly, but logs errors to the console
 * when network or unexpected failures occur.
 *
 * @example
 * const result = await Register(
 *   "John Doe",
 *   "johndoe",
 *   "john@example.com",
 *   "securePassword123"
 * );
 *
 * if (result.success) {
 *   console.log("Registered:", result.message);
 * } else {
 *   console.error("Registration failed:", result.error || result.data);
 * }
 */
export async function Register(
  fullname: string,
  username: string,
  email: string,
  password: string,
) {
  const emailRegex =
    /^(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:(?:\\[\x00-\x7F]|[^\\"]))*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}|(?:\[(?:\d{1,3}\.){3}\d{1,3}\]))$/;

  if (
    fullname.trim() === "" ||
    email.trim() === "" ||
    username.trim() === "" ||
    password.trim() === "" ||
    password.trim().length <= 8 ||
    !emailRegex.test(email)
  ) {
    console.error("Invalid fullname/email/password");
    return {
      success: false,
      error: "Invalid fullname/email/password",
    };
  }

  try {
    const response = await fetch(
      import.meta.env.DEV
        ? `http://192.168.1.201:3000/register`
        : "https://api.kineticedge.liamjorgensen.dev/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullname: fullname,
          username: username,
          email: email,
          password: password,
        }),
      },
    );

    const res = await response.json();

    if (res.success) {
      console.log(res.data);
      return { success: res.success, message: res.message };
    }

    return { success: res.success, error: res.error };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to contact server" };
  }
}
