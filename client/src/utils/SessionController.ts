import { createContext, useContext } from "react";
import { httpClient } from "./trpcClient";

export interface Session {
  username: string;
}

export const SessionContext = createContext<[Session | null, (x: Session | null) => void]>(undefined as any);

/**
 * Gets the sessionobject from context
 */
export function SessionController() {
  const [user, setUser] = useContext(SessionContext);

  async function login(d: { username: string; password: string }) {
    const e = await httpClient.user.login.mutate(d);
    setUser(e);
  }

  return { user, login };
}
