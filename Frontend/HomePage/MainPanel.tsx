import { useEffect, useState, type JSX } from "react";
import { useAuth } from "../Context/useAuth";
import ProfilePanel from "./Panels/Profile/ProfilePanel";
import DashboardPanel from "./Panels/Dashboard/DashboardPanel";
import GlowingButton from "../Components/General/GlowingButton";
import WorkoutsPanel from "./Panels/Workout/WorkoutsPanel";
import { SessionProvider } from "../Context/useSessions";
import { Link, useNavigate } from "react-router-dom";
import Home from "./Panels/Home/Home";
import { WorkoutProvider } from "../Context/useWorkouts";
import { useParams } from "react-router-dom";
import { ExerciceProvider } from "../Context/useExercices";
import SettingsPanel from "./Panels/Settings/SettingsPanel";
import {
  Apple,
  BicepsFlexed,
  Dumbbell,
  House,
  LayoutDashboard,
  Settings as SettingsIcon,
  UserPen,
} from "lucide-react";
import MeasurementsPanel from "./Panels/Measurements/MeasurementsPanel";
import NutritionPanel from "./Panels/Nutrition/NutritionPanel";
import { WithingsProvider } from "../Context/useWitings";

export const Panel = {
  HOME: "HOME",
  DASHBOARD: "DASHBOARD",
  WORKOUTS: "WORKOUTS",
  PROFILE: "PROFILE",
  MEASUREMENTS: "MEASUREMENTS",
  SETTINGS: "SETTINGS",
  NUTRITION: "NUTRITION",
} as const;

export type ActivePanel = (typeof Panel)[keyof typeof Panel];

interface Props {
  panel: (typeof Panel)[keyof typeof Panel];
}

function MainPanel({ panel }: Props) {
  const { user } = useAuth();
  const [activePanel, setActivePanel] = useState<ActivePanel>(panel);
  const { username } = useParams();
  const navigate = useNavigate();

  const [activePanelElement, setActivePanelElement] = useState<JSX.Element>(
    <Home />,
  );

  useEffect(() => {
    switch (activePanel) {
      case Panel.HOME: {
        setActivePanelElement(<Home />);
        break;
      }
      case Panel.PROFILE: {
        setActivePanelElement(
          <SessionProvider>
            <ProfilePanel />
          </SessionProvider>,
        );
        break;
      }
      case Panel.DASHBOARD: {
        setActivePanelElement(
          <WorkoutProvider>
            <SessionProvider>
              <WithingsProvider>
                <DashboardPanel />
              </WithingsProvider>
            </SessionProvider>
          </WorkoutProvider>,
        );
        break;
      }
      case Panel.WORKOUTS: {
        setActivePanelElement(
          <ExerciceProvider>
            <WorkoutProvider>
              <SessionProvider>
                <WorkoutsPanel />
              </SessionProvider>
            </WorkoutProvider>
            ,
          </ExerciceProvider>,
        );
        break;
      }
      case Panel.MEASUREMENTS: {
        setActivePanelElement(
          <WithingsProvider>
            <MeasurementsPanel />
          </WithingsProvider>,
        );
        break;
      }
      case Panel.NUTRITION: {
        setActivePanelElement(
          <WithingsProvider>
            <NutritionPanel />
          </WithingsProvider>,
        );
        break;
      }
      case Panel.SETTINGS: {
        setActivePanelElement(<SettingsPanel />);
        break;
      }
      default: {
        setActivePanelElement(<Home />);
      }
    }
  }, [activePanel]);

  return (
    <>
      <main className="w-screen min-h-screen flex flex-col md:flex-row">
        <aside className="bg-[#131313] md:w-70 md:min-h-screen px-5 pt-5 gap-10 flex flex-col z-10">
          <div>
            <h1 className="text-[#CCFF00] italic text-xl ">KINETIC</h1>
            <p className="text-[#ADAAAA] text-[8px]">ELITE PERFORMANCE</p>
          </div>
          <nav className="flex flex-col w-full">
            {!user ? (
              <Link
                to={"/"}
                onClick={() => setActivePanel(Panel.HOME)}
                className={`w-full h-10 flex px-2 gap-2 items-center ${activePanel === Panel.HOME ? "text-[#CCFF00] border-l-2 rounded bg-[#1A1A1A]" : "text-[#ADAAAA]"}`}
              >
                <House />
                Home
              </Link>
            ) : (
              <>
                <Link
                  to={"/dashboard"}
                  onClick={() => setActivePanel(Panel.DASHBOARD)}
                  className={`w-full h-10 flex px-2 gap-2 items-center cursor-pointer ${activePanel === Panel.DASHBOARD ? "text-[#CCFF00] border-l-2 rounded bg-[#1A1A1A]" : "text-[#ADAAAA]"}`}
                >
                  <LayoutDashboard />
                  Dashboard
                </Link>
                <Link
                  to={"/workouts"}
                  onClick={() => setActivePanel(Panel.WORKOUTS)}
                  className={`w-full h-10 flex px-2 gap-2 items-center cursor-pointer ${activePanel === Panel.WORKOUTS ? "text-[#CCFF00] border-l-2 rounded bg-[#1A1A1A]" : "text-[#ADAAAA]"}`}
                >
                  <Dumbbell />
                  Workouts
                </Link>
                <Link
                  to={"/nutrition"}
                  onClick={() => {
                    setActivePanel(Panel.NUTRITION);
                  }}
                  className={`w-full h-10 flex px-2 gap-2 items-center cursor-pointer ${activePanel === Panel.NUTRITION ? "text-[#CCFF00] border-l-2 rounded bg-[#1A1A1A]" : "text-[#ADAAAA]"}`}
                >
                  <Apple />
                  Nutrition
                </Link>
                <Link
                  to={"/measurements"}
                  onClick={() => {
                    setActivePanel(Panel.MEASUREMENTS);
                  }}
                  className={`w-full h-10 flex px-2 gap-2 items-center cursor-pointer ${activePanel === Panel.MEASUREMENTS ? "text-[#CCFF00] border-l-2 rounded bg-[#1A1A1A]" : "text-[#ADAAAA]"}`}
                >
                  <BicepsFlexed />
                  Measurements
                </Link>
                <Link
                  to={"/profile/" + user.username}
                  onClick={() => {
                    setActivePanel(Panel.PROFILE);
                  }}
                  className={`w-full h-10 flex px-2 gap-2 items-center cursor-pointer ${activePanel === Panel.PROFILE ? "text-[#CCFF00] border-l-2 rounded bg-[#1A1A1A]" : "text-[#ADAAAA]"}`}
                >
                  <UserPen />
                  Profile
                </Link>

                <Link
                  to={"/settings"}
                  onClick={() => {
                    setActivePanel(Panel.SETTINGS);
                  }}
                  className={`w-full h-10 flex px-2 gap-2 items-center cursor-pointer ${activePanel === Panel.SETTINGS ? "text-[#CCFF00] border-l-2 rounded bg-[#1A1A1A]" : "text-[#ADAAAA]"}`}
                >
                  <SettingsIcon />
                  Settings
                </Link>
              </>
            )}
          </nav>
          {user && (
            <GlowingButton
              outline={false}
              onClick={() => {
                setActivePanel(Panel.WORKOUTS);
                navigate("/workouts");
              }}
              additionalClasses="bg-none bg-[#CAFD00] font-black tracking-tighter text-xs !text-[#4A5E00] self-center mb-5 md:m-0 w-full!"
            >
              + LOG NEW WORKOUT
            </GlowingButton>
          )}
        </aside>
        <section className="bg-[#0E0E0E] w-full min-h-full ">
          {!user && username && activePanel === Panel.PROFILE
            ? activePanelElement
            : (user && activePanelElement) || <Home />}
        </section>
      </main>
    </>
  );
}

export default MainPanel;
