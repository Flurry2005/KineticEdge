import { useEffect, useMemo, useState } from "react";
import NavBar from "../../../NavBar.tsx";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
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
  bodyFat: number;
}

function MeasurementsPanel() {
  const [weightData, setWeightData] = useState<WeightPoint[]>([]);
  const [bodyFatData, setBodyFatData] = useState<BodyFatPoint[]>([]);

  const getData = async () => {
    const response = await fetch(
      "http://localhost:3000/api/withings/measurements",
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
      .filter((item): item is WeightPoint => item !== null)
      .sort((a, b) => a.timestamp - b.timestamp);

    const bodyFat: BodyFatPoint[] = json.body.measuregrps
      .map((group: MeasureGroup) => {
        const measure = group.measures.find((m) => m.type === 6);

        if (!measure) return null;

        return {
          timestamp: group.date,
          date: new Date(group.date * 1000).toLocaleDateString(),
          bodyFat: measure.value * Math.pow(10, measure.unit),
        };
      })
      .filter((item): item is BodyFatPoint => item !== null)
      .sort((a, b) => a.timestamp - b.timestamp);

    setWeightData(weight);
    setBodyFatData(bodyFat);
  };

  useEffect(() => {
    getData();
  }, []);

  const { minWeight, maxWeight } = useMemo(() => {
    if (weightData.length === 0) {
      return { minWeight: 0, maxWeight: 100 };
    }

    const values = weightData.map((d) => d.weight);

    return {
      minWeight: Math.floor(Math.min(...values)) - 1,
      maxWeight: Math.ceil(Math.max(...values)) + 1,
    };
  }, [weightData]);

  const { minBodyFat, maxBodyFat } = useMemo(() => {
    if (bodyFatData.length === 0) {
      return { minBodyFat: 0, maxBodyFat: 50 };
    }

    const values = bodyFatData.map((d) => d.bodyFat);

    return {
      minBodyFat: Math.floor(Math.min(...values)) - 1,
      maxBodyFat: Math.ceil(Math.max(...values)) + 1,
    };
  }, [bodyFatData]);

  return (
    <div>
      <NavBar />

      <main className="flex flex-col px-10 gap-10 h-full pt-10 w-full">
        <section className="flex justify-between lg:px-10">
          <h2 className="text-3xl text-white font-black">Weight Progress</h2>
        </section>

        <div className="bg-zinc-900 rounded-xl p-6 h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="date" />

              <YAxis domain={[minWeight, maxWeight]} unit=" kg" />

              <Tooltip
                formatter={(value: number) => [
                  `${value.toFixed(1)} kg`,
                  "Weight",
                ]}
              />

              <Line
                dataKey="weight"
                type="natural"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <section className="flex justify-between lg:px-10">
          <h2 className="text-3xl text-white font-black">Body Fat %</h2>
        </section>

        <div className="bg-zinc-900 rounded-xl p-6 h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={bodyFatData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="date" />

              <YAxis domain={[minBodyFat, maxBodyFat]} unit="%" />

              <Tooltip
                formatter={(value: number) => [
                  `${value.toFixed(1)}%`,
                  "Body Fat",
                ]}
              />

              <Line
                dataKey="bodyFat"
                type="natural"
                stroke="#22c55e"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
}

export default MeasurementsPanel;
