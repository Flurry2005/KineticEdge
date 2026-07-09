import { useEffect, useMemo, useState } from "react";
import NavBar from "../../../NavBar.tsx";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Measure {
  type: number;
  value: number;
  unit: number;
}

interface MeasureGroup {
  date: number;
  measures: Measure[];
}

interface WeightPoint {
  timestamp: number;
  date: string;
  weight: number;
}

interface BodyFatPoint {
  timestamp: number;
  date: string;
  percent: number | null;
  kg: number | null;
}
interface MuscleMassPoint {
  timestamp: number;
  date: string;
  kg: number;
}

type Range = "all" | "year" | "month" | "week";
type BodyFatMode = "percent" | "kg";

function MeasurementsPanel() {
  const [weightData, setWeightData] = useState<WeightPoint[]>([]);
  const [bodyFatData, setBodyFatData] = useState<BodyFatPoint[]>([]);

  const [muscleMassData, setMuscleMassData] = useState<MuscleMassPoint[]>([]);

  const [range, setRange] = useState<Range>("all");
  const [bodyFatMode, setBodyFatMode] = useState<BodyFatMode>("percent");

  const [currentDate, setCurrentDate] = useState(new Date());

  const getData = async () => {
    const response = await fetch(
      import.meta.env.DEV
        ? "http://localhost:3000/api/withings/measurements"
        : "https://api.kineticedge.liamjorgensen.dev/api/withings/measurements",
      {
        credentials: "include",
      },
    );

    const json = await response.json();

    const weight: WeightPoint[] = json.body.measuregrps
      .map((group: MeasureGroup) => {
        const measure = group.measures.find((m) => m.type === 1);

        if (!measure) return null;

        return {
          timestamp: group.date,
          date: new Date(group.date * 1000).toLocaleDateString(),
          weight: measure.value * Math.pow(10, measure.unit),
        };
      })
      .filter((x): x is WeightPoint => x !== null)
      .sort((a, b) => a.timestamp - b.timestamp);

    const muscleMass: MuscleMassPoint[] = json.body.measuregrps
      .map((group: MeasureGroup) => {
        const measure = group.measures.find((m) => m.type === 76);

        if (!measure) return null;

        return {
          timestamp: group.date,
          date: new Date(group.date * 1000).toLocaleDateString(),
          kg: measure.value * Math.pow(10, measure.unit),
        };
      })
      .filter((x): x is MuscleMassPoint => x !== null)
      .sort((a, b) => a.timestamp - b.timestamp);

    setMuscleMassData(muscleMass);

    const bodyFat: BodyFatPoint[] = json.body.measuregrps
      .map((group: MeasureGroup) => {
        const percent = group.measures.find((m) => m.type === 6);
        const kg = group.measures.find((m) => m.type === 8);

        if (!percent && !kg) return null;

        return {
          timestamp: group.date,
          date: new Date(group.date * 1000).toLocaleDateString(),
          percent: percent ? percent.value * Math.pow(10, percent.unit) : null,
          kg: kg ? kg.value * Math.pow(10, kg.unit) : null,
        };
      })
      .filter((x): x is BodyFatPoint => x !== null)
      .sort((a, b) => a.timestamp - b.timestamp);

    setWeightData(weight);
    setBodyFatData(bodyFat);
  };

  useEffect(() => {
    getData();
  }, []);

  const filterData = <T extends { timestamp: number }>(data: T[]) => {
    if (range === "all") return data;

    const end = new Date(currentDate);
    let start = new Date(currentDate);

    switch (range) {
      case "year":
        start = new Date(end.getFullYear() - 1, end.getMonth(), end.getDate());
        break;

      case "month":
        start = new Date(end.getFullYear(), end.getMonth(), 1);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        break;

      case "week":
        start.setDate(end.getDate() - 7);
        break;
    }

    return data.filter((d) => {
      const date = new Date(d.timestamp * 1000);
      return date >= start && date <= end;
    });
  };

  const filteredWeight = useMemo(
    () => filterData(weightData),
    [weightData, range, currentDate],
  );
  const filteredMuscleMass = useMemo(
    () => filterData(muscleMassData),
    [muscleMassData, range, currentDate],
  );

  const filteredBodyFat = useMemo(
    () => filterData(bodyFatData),
    [bodyFatData, range, currentDate],
  );

  const weightBounds = useMemo(() => {
    if (!filteredWeight.length) return { min: 0, max: 100 };

    const values = filteredWeight.map((x) => x.weight);

    return {
      min: Math.floor(Math.min(...values)) - 1,
      max: Math.ceil(Math.max(...values)) + 1,
    };
  }, [filteredWeight]);
  const muscleMassBounds = useMemo(() => {
    if (!filteredMuscleMass.length) return { min: 0, max: 100 };

    const values = filteredMuscleMass.map((x) => x.kg);

    return {
      min: Math.floor(Math.min(...values)) - 1,
      max: Math.ceil(Math.max(...values)) + 1,
    };
  }, [filteredMuscleMass]);

  const bodyFatBounds = useMemo(() => {
    const values = filteredBodyFat
      .map((x) => (bodyFatMode === "percent" ? x.percent : x.kg))
      .filter((v): v is number => v !== null);

    if (!values.length) return { min: 0, max: 50 };

    return {
      min: Math.floor(Math.min(...values)) - 1,
      max: Math.ceil(Math.max(...values)) + 1,
    };
  }, [filteredBodyFat, bodyFatMode]);
  const bodyFatChartData = filteredBodyFat
    .map((point) => ({
      timestamp: point.timestamp,
      date: point.date,
      value: bodyFatMode === "percent" ? point.percent : point.kg,
    }))
    .filter(
      (
        point,
      ): point is {
        timestamp: number;
        date: string;
        value: number;
      } => point.value !== null,
    );

  const movePrevious = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);

      switch (range) {
        case "year":
          next.setFullYear(next.getFullYear() - 1);
          break;

        case "month":
          next.setMonth(next.getMonth() - 1);
          break;

        case "week":
          next.setDate(next.getDate() - 7);
          break;
      }

      return next;
    });
  };
  const moveNext = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);

      switch (range) {
        case "year":
          next.setFullYear(next.getFullYear() + 1);
          break;

        case "month":
          next.setMonth(next.getMonth() + 1);
          break;

        case "week":
          next.setDate(next.getDate() + 7);
          break;
      }

      return next;
    });
  };

  return (
    <div>
      <NavBar />

      <main className="flex flex-col px-10 gap-5 h-full pt-10 w-full">
        <section className="flex flex-wrap justify-between items-center gap-4">
          <h2 className="text-3xl font-black text-white">Measurements</h2>

          <div className="flex gap-2">
            {(["all", "year", "month", "week"] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-4 py-2 rounded-lg transition ${
                  range === r
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-800 text-zinc-300"
                }`}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </section>

        {range !== "all" && (
          <div className="flex justify-center items-center gap-6">
            <button
              onClick={movePrevious}
              className="bg-zinc-800 hover:bg-zinc-700 rounded-lg px-4 py-2 text-white"
            >
              ←
            </button>

            <span className="text-white text-lg font-semibold">
              {range === "year"
                ? currentDate.getFullYear()
                : range === "month"
                  ? currentDate.toLocaleDateString(undefined, {
                      month: "long",
                      year: "numeric",
                    })
                  : currentDate.toLocaleDateString()}
            </span>

            <button
              onClick={moveNext}
              className="bg-zinc-800 hover:bg-zinc-700 rounded-lg px-4 py-2 text-white"
            >
              →
            </button>
          </div>
        )}

        <section>
          <h2 className="text-3xl text-white font-black mb-4">
            Weight Progress
          </h2>

          <div className="bg-zinc-900 rounded-xl py-6 pr-10  h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredWeight}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="date" />

                <YAxis
                  domain={[weightBounds.min, weightBounds.max]}
                  unit=" kg"
                />

                <Tooltip
                  formatter={(value: number) => [
                    `${value.toFixed(1)} kg`,
                    "Weight",
                  ]}
                />

                <Line
                  dataKey="weight"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  type="natural"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl text-white font-black">Body Fat</h2>

            <div className="flex rounded-lg overflow-hidden border border-zinc-700">
              <button
                onClick={() => setBodyFatMode("percent")}
                className={`px-4 py-2 ${
                  bodyFatMode === "percent"
                    ? "bg-green-600 text-white"
                    : "bg-zinc-800 text-zinc-300"
                }`}
              >
                %
              </button>

              <button
                onClick={() => setBodyFatMode("kg")}
                className={`px-4 py-2 ${
                  bodyFatMode === "kg"
                    ? "bg-green-600 text-white"
                    : "bg-zinc-800 text-zinc-300"
                }`}
              >
                kg
              </button>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-xl py-6 pr-10  h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bodyFatChartData} className="focus:border-0">
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="date" />

                <YAxis
                  domain={[bodyFatBounds.min, bodyFatBounds.max]}
                  unit={bodyFatMode === "percent" ? "%" : " kg"}
                />

                <Tooltip
                  formatter={(value: number) => [
                    bodyFatMode === "percent"
                      ? `${value.toFixed(1)}%`
                      : `${value.toFixed(2)} kg`,
                    bodyFatMode === "percent" ? "Body Fat %" : "Fat Mass",
                  ]}
                />

                <Line
                  dataKey="value"
                  stroke="#22c55e"
                  strokeWidth={3}
                  type="natural"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section>
          <h2 className="text-3xl text-white font-black mb-4">Muscle Mass</h2>
          <div className="bg-zinc-900 rounded-xl py-6 pr-10  h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredMuscleMass}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="date" />

                <YAxis
                  domain={[muscleMassBounds.min, muscleMassBounds.max]}
                  unit=" kg"
                />

                <Tooltip
                  formatter={(value: number) => [
                    `${value.toFixed(2)} kg`,
                    "Muscle Mass",
                  ]}
                />

                <Line
                  dataKey="kg"
                  stroke="#f97316"
                  strokeWidth={3}
                  type="natural"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </main>
    </div>
  );
}

export default MeasurementsPanel;
