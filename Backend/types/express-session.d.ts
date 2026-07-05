import "express-session";

declare module "express-session" {
  interface SessionData {
    withingsState?: string | null;
  }
}
