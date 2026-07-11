import NavBar from "../../../NavBar";
import GlowingButton from "../../../Components/General/GlowingButton";
import { useEffect, useMemo, useState, type JSX } from "react";
import TodayPanel from "./Components/TodayPanel";
import type { Product } from "../../../utils/BarcodeScanner";
import AddFoodModal from "./Components/AddFoodModal";
import ManualFoodModal from "./Components/ManualFoodModal";
export const Panel = {
  PAST: "PAST",
  TODAY: "UPCOMMING",
  CREATE: "CREATE",
} as const;

export type ActivePanel = (typeof Panel)[keyof typeof Panel];

function NutritionPanel() {
  const [activePanel, setActivePanel] = useState<ActivePanel>(Panel.TODAY);
  const [manualBarcode, setManualBarcode] = useState<string | null>(null);
  const [foodIntake, setFoodIntake] = useState<any | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<{
    barcode: string;
    product: Product;
  } | null>(null);

  const [activityData, setActivityData] = useState<null | any>(null);

  const getActivityData = async (date: string) => {
    const res = await fetch(
      import.meta.env.DEV
        ? "http://192.168.1.201:3000/api/withings/activity?date=" + date
        : "https://api.kineticedge.liamjorgensen.dev/api/withings/activity?date=" +
            date,
      { credentials: "include" },
    );
    const data = await res.json();
    console.log(data);
    setActivityData(data);
  };

  const fetchData = async () => {
    const response = await fetch(
      import.meta.env.DEV
        ? "http://192.168.1.201:3000/get-all-foodIntake"
        : "https://api.kineticedge.liamjorgensen.dev/get-all-foodIntake",
      {
        credentials: "include",
      },
    );

    const data = await response.json();

    setFoodIntake(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const { today, past } = useMemo(() => {
    if (!foodIntake) {
      return {
        today: undefined,
        past: [],
      };
    }

    const now = new Date();
    const todayDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    getActivityData(todayDate);

    return {
      today: foodIntake.days.find((day: any) => day.date === todayDate) || {},

      past: foodIntake.days.filter((day: any) => day.date !== todayDate),
    };
  }, [foodIntake]);

  let activePanelElement: JSX.Element;

  switch (activePanel) {
    case Panel.TODAY:
      activePanelElement = (
        <TodayPanel
          foodIntakeToday={today}
          onProductFound={(barcode, product) => {
            setSelectedProduct({
              barcode,
              product,
            });
          }}
          onProductNotFound={(barcode) => {
            setManualBarcode(barcode);
          }}
          updateFoods={fetchData}
        />
      );

      break;

    case Panel.PAST:
      activePanelElement = <p className="text-white">Past</p>;

      break;

    default:
      activePanelElement = (
        <TodayPanel
          foodIntakeToday={today}
          onProductFound={(barcode, product) => {
            setSelectedProduct({
              barcode,
              product,
            });
          }}
          onProductNotFound={(barcode) => {
            setManualBarcode(barcode);
          }}
          updateFoods={fetchData}
        />
      );

      break;
  }

  return (
    <div className="">
      <NavBar />

      <main className="flex flex-col not-sm:px-3 px-10 gap-10 h-full pt-10 w-full">
        <section className="flex flex-col md:flex-row justify-between md:mx-10 overflow-hidden relative min-h-fit gap-5">
          <aside className="w-full md:w-full h-full flex flex-col md:gap-5">
            <p className="text-[#F3FFCA] text-xs w-min">
              {activePanel === Panel.CREATE ? "MAKE A WORKOUT" : "NUTRITION"}
            </p>

            <h2 className="text-white text-6xl not-sm:text-4xl font-black tracking-tighter">
              {activePanel === Panel.CREATE ? "CREATE WORKOUT" : "NUTRITION"}
            </h2>

            <div className="flex md:flex-row flex-col justify-between gap-5 w-full">
              <p className="text-[#ADAAAA]">
                Log your food to track your daily calories and nutrients
              </p>

              <div className="flex flex-wrap gap-5 not-sm:grid not-sm:grid-cols-3">
                <article className="h-20 w-30 bg-[#131313] rounded-2xl flex flex-col p-4 justify-center">
                  <h2 className="text-[#ADAAAA] text-xs">EXPENDITURE</h2>

                  <p className="text-[#F3FFCA] font-black text-sm">
                    {activityData === null
                      ? "Loading..."
                      : activityData!.totalCalories!.toFixed(0) + " KCAL"}{" "}
                  </p>
                </article>
                <article className="h-20 w-30 bg-[#131313] rounded-2xl flex flex-col p-4 justify-center">
                  <h2 className="text-[#ADAAAA] text-xs">INTAKE</h2>

                  <p className="text-[#F3FFCA] font-black text-sm">
                    {today
                      ? (today?.products
                          ?.reduce(
                            (sum: number, item: any) => sum + item.calories,
                            0,
                          )
                          .toFixed(0) ?? 0) + " KCAL"
                      : "Loading..."}{" "}
                  </p>
                </article>
                <article className="h-20 w-30 bg-[#131313] rounded-2xl flex flex-col p-4 justify-center">
                  <h2 className="text-[#ADAAAA] text-xs">
                    {activityData === null
                      ? "Loading..."
                      : activityData!.totalCalories! -
                            (today?.products
                              ?.reduce(
                                (sum: number, item: any) => sum + item.calories,
                                0,
                              )
                              .toFixed(0) ?? 0) >
                          0
                        ? "DEFICIT"
                        : "SURPLUS"}
                  </h2>

                  <p className="text-[#F3FFCA] font-black text-sm">
                    {activityData === null
                      ? "Loading..."
                      : Math.abs(
                          activityData!.totalCalories! -
                            (today?.products?.reduce(
                              (sum: number, item: any) => sum + item.calories,
                              0,
                            ) ?? 0),
                        ).toFixed(0) + " KCAL"}{" "}
                  </p>
                </article>
                <article className="h-20 w-30 bg-[#131313] rounded-2xl flex flex-col p-4 justify-center">
                  <h2 className="text-[#ADAAAA] text-xs">CARBS</h2>

                  <p className="text-[#F3FFCA] font-black text-sm">
                    {today?.products
                      ?.reduce(
                        (sum: number, item: any) =>
                          sum + item.carbohydratesGrams,
                        0,
                      )
                      .toFixed(0) ?? 0}
                    {"g "}
                  </p>
                </article>
                <article className="h-20 w-30 bg-[#131313] rounded-2xl flex flex-col p-4 justify-center">
                  <h2 className="text-[#ADAAAA] text-xs">FAT</h2>

                  <p className="text-[#F3FFCA] font-black text-sm">
                    {today?.products
                      ?.reduce(
                        (sum: number, item: any) => sum + item.fatsGrams,
                        0,
                      )
                      .toFixed(0) ?? 0}
                    {"g "}
                  </p>
                </article>
                <article className="h-20 w-30 bg-[#131313] rounded-2xl flex flex-col p-4 justify-center">
                  <h2 className="text-[#ADAAAA] text-xs">PROTEIN</h2>

                  <p className="text-[#F3FFCA] font-black text-sm">
                    {today?.products
                      ?.reduce(
                        (sum: number, item: any) => sum + item.proteinGrams,
                        0,
                      )
                      .toFixed(0) ?? 0}
                    {"g "}
                  </p>
                </article>

                <article className="h-20 w-30 bg-[#131313] rounded-2xl flex flex-col p-4 justify-center">
                  <h2 className="text-[#ADAAAA] text-xs">PRODUCTS</h2>

                  <p className="text-[#FF7441] font-black text-sm">
                    {today?.products?.length ?? 0}
                  </p>
                </article>
              </div>
            </div>
          </aside>
        </section>

        <section>
          <div className="w-full h-20 bg-[#131313] rounded-2xl flex items-center px-5 gap-5">
            <GlowingButton
              outline={false}
              onClick={() => setActivePanel(Panel.TODAY)}
              additionalClasses={`font-black tracking-tighter text-xs w-30! h-8! ${
                activePanel === Panel.TODAY
                  ? "bg-[#F3FFCA] !text-[#516700]"
                  : "bg-[#1A1A1A] !text-[#ADAAAA]"
              }`}
            >
              Today
            </GlowingButton>

            <GlowingButton
              outline={false}
              onClick={() => setActivePanel(Panel.PAST)}
              additionalClasses={`font-black tracking-tighter text-xs w-30! h-8! ${
                activePanel === Panel.PAST
                  ? "bg-[#F3FFCA] !text-[#516700]"
                  : "bg-[#1A1A1A] !text-[#ADAAAA]"
              }`}
            >
              Past
            </GlowingButton>
          </div>
        </section>

        {activePanelElement}

        {selectedProduct && (
          <AddFoodModal
            barcode={selectedProduct.barcode}
            product={selectedProduct.product}
            onClose={() => setSelectedProduct(null)}
            onAdded={async () => {
              await fetchData();

              setSelectedProduct(null);
            }}
          />
        )}
        {manualBarcode && (
          <ManualFoodModal
            barcode={manualBarcode}
            onClose={() => setManualBarcode(null)}
            onAdded={async () => {
              await fetchData();
              setManualBarcode(null);
            }}
          />
        )}
      </main>
    </div>
  );
}

export default NutritionPanel;
