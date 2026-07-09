import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../Context/useAuth.tsx";
import NavBar from "../../../NavBar.tsx";
import { useEffect } from "react";

function SettingsPanel() {
  const { user, login } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const withings = searchParams.get("withings");

  useEffect(() => {
    if (withings === "connected" && user) {
      const modified = user;
      user!.withings!.connected! = true;
      login({
        ...modified,
      });
      navigate("/settings");
    }
  }, []);
  return (
    <>
      <div>
        <NavBar />
        <main className="flex flex-col px-10 gap-10 h-full pt-10 w-full">
          <section className="flex flex-col lg:flex-row justify-between lg:px-10 gap-5 h-fit">
            <h2 className="text-3xl text-white font-black">SETTINGS</h2>
          </section>

          {/* Stats Board */}
          <main className="h-full w-full flex flex-col justify-around">
            {/* Heading */}
            <div className="flex items-center gap-2 mb-5">
              <span className="w-25 block bg-[#ADAAAA] h-0.5" />
              <p className="text-[#ADAAAA]">Connections</p>
            </div>
            <div className="flex gap-5 text-white font-bold items-center">
              Withings
              <img
                src="https://apps.homeycdn.net/app/com.nokia.health/15/76c66e96-83f6-4987-9d93-6da02f60e085/drivers/user/assets/images/large.png"
                alt=""
                className="w-8 h-8"
              />
              <button
                className={`text-white w-fit px-2 py-1 cursor-pointer rounded-2xl text-center flex items-center ${user?.withings.connected ? "bg-red-300" : "bg-green-300"}`}
                onClick={async () => {
                  if (user?.withings.connected) {
                    const baseUrl = import.meta.env.DEV
                      ? "http://localhost:3000"
                      : "https://api.kineticedge.liamjorgensen.dev";

                    const res = await fetch(
                      `${baseUrl}/api/auth/withings/disconnect`,
                      {
                        credentials: "include",
                        method: "PATCH",
                      },
                    );
                    if (res.ok) {
                      const updatedUser = {
                        ...user,
                        withings: { connected: false },
                      };
                      login(updatedUser);
                    }
                  } else {
                    window.location.href = import.meta.env.DEV
                      ? "http://localhost:3000/api/auth/withings/login"
                      : "https://api.kineticedge.liamjorgensen.dev/api/auth/withings/login";
                  }
                }}
              >
                {user?.withings.connected ? "Disconnect" : "Connect"}
              </button>
            </div>
          </main>
        </main>
      </div>
    </>
  );
}

export default SettingsPanel;
