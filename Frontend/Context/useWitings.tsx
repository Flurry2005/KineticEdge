import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./useAuth";

type WithingsContextType = {
  measurements: any | undefined;
  //   setSessions: Dispatch<SetStateAction<Session[] | undefined>>;
  todaysActivity: any | undefined;
};

const WithingsContext = createContext<WithingsContextType | undefined>(
  undefined,
);

export function WithingsProvider({ children }: { children: React.ReactNode }) {
  const [measurements, setMeasurements] = useState<any | undefined>(undefined);
  const [todaysActivity, setTodaysActivity] = useState<any | undefined>(
    undefined,
  );

  const { user, logout } = useAuth();

  useEffect(() => {
    (async () => {
      if (!user) return;
      getMeasurements();
      getTodaysActivity();
    })();
  }, []);

  const getTodaysActivity = async () => {
    const now = new Date();
    const todayDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const res = await fetch(
      import.meta.env.DEV
        ? "http://192.168.1.201:3000/api/withings/activity?date=" + todayDate
        : "https://api.kineticedge.liamjorgensen.dev/api/withings/activity?date=" +
            todayDate,
      { credentials: "include" },
    );
    const data = await res.json();
    console.log(data);
    setTodaysActivity(data);
  };

  const getMeasurements = async () => {
    const response = await fetch(
      import.meta.env.DEV
        ? "http://192.168.1.201:3000/api/withings/measurements"
        : "https://api.kineticedge.liamjorgensen.dev/api/withings/measurements",
      {
        credentials: "include",
      },
    );

    if (!response.ok) {
      logout();
      return;
    }

    const json = await response.json();
    setMeasurements(json);
  };

  return (
    <WithingsContext.Provider value={{ measurements, todaysActivity }}>
      {children}
    </WithingsContext.Provider>
  );
}
export function useWithings() {
  const context = useContext(WithingsContext);
  if (!context)
    throw new Error("useWithings must be used within WithingsProvider");
  return context;
}
