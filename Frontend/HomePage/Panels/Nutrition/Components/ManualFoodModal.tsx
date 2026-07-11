import { useState } from "react";

interface ManualFoodModalProps {
  date: any;
  barcode: string;
  onClose: () => void;
  onAdded: () => void;
}

export default function ManualFoodModal({
  date,
  barcode,
  onClose,
  onAdded,
}: ManualFoodModalProps) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    productName: "",
    productBrand: "",
    productImage: "",

    quantityGrams: "100",

    caloriesPer100g: "",
    carbohydratesPer100g: "",
    fatsPer100g: "",
    proteinPer100g: "",
  });

  const toNumber = (value: string) => {
    return Number(value) || 0;
  };

  const quantityGrams = toNumber(form.quantityGrams);

  const calories = (toNumber(form.caloriesPer100g) * quantityGrams) / 100;

  const carbohydratesGrams =
    (toNumber(form.carbohydratesPer100g) * quantityGrams) / 100;

  const fatsGrams = (toNumber(form.fatsPer100g) * quantityGrams) / 100;

  const proteinGrams = (toNumber(form.proteinPer100g) * quantityGrams) / 100;

  function updateText(
    key: "productName" | "productBrand" | "productImage",
    value: string,
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function updateNumber(
    key:
      | "quantityGrams"
      | "caloriesPer100g"
      | "carbohydratesPer100g"
      | "fatsPer100g"
      | "proteinPer100g",
    value: string,
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function addProduct() {
    try {
      setLoading(true);

      const response = await fetch(
        import.meta.env.DEV
          ? "http://192.168.1.201:3000/add-food-product"
          : "https://api.kineticedge.liamjorgensen.dev/add-food-product",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            date,
            barcode,

            productName: form.productName || "Unknown",
            productBrand: form.productBrand,
            productImage: form.productImage,

            quantityGrams,

            caloriesPer100g: toNumber(form.caloriesPer100g),
            carbohydratesPer100g: toNumber(form.carbohydratesPer100g),
            fatsPer100g: toNumber(form.fatsPer100g),
            proteinPer100g: toNumber(form.proteinPer100g),

            calories,
            carbohydratesGrams,
            fatsGrams,
            proteinGrams,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed adding product");
      }

      onAdded();
    } catch (error) {
      console.error("Failed adding manual product:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-[420px] max-h-[90vh] overflow-y-auto rounded-2xl bg-[#131313] p-6 space-y-4">
        <h2 className="text-xl font-black text-white">Add product manually</h2>

        <input
          placeholder="Product name"
          value={form.productName}
          onChange={(e) => updateText("productName", e.target.value)}
          className="w-full rounded-lg bg-neutral-800 p-3 text-white"
        />

        <input
          placeholder="Brand"
          value={form.productBrand}
          onChange={(e) => updateText("productBrand", e.target.value)}
          className="w-full rounded-lg bg-neutral-800 p-3 text-white"
        />

        <input
          placeholder="Image URL"
          value={form.productImage}
          onChange={(e) => updateText("productImage", e.target.value)}
          className="w-full rounded-lg bg-neutral-800 p-3 text-white"
        />

        <div>
          <label className="text-sm text-gray-400">Quantity grams</label>

          <input
            placeholder="Quantity grams"
            type="text"
            inputMode="numeric"
            value={form.quantityGrams}
            onChange={(e) =>
              updateNumber(
                "quantityGrams",
                e.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "") ||
                  "0",
              )
            }
            className="w-full rounded-lg bg-neutral-800 p-3 text-white"
          />
        </div>

        <p className="text-sm text-gray-400">Nutrition per 100g</p>

        <input
          type="text"
          inputMode="numeric"
          placeholder="Calories per 100g"
          value={form.caloriesPer100g}
          onChange={(e) =>
            updateNumber(
              "caloriesPer100g",
              e.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "") || "0",
            )
          }
          className="w-full rounded-lg bg-neutral-800 p-3 text-white"
        />

        <input
          type="text"
          inputMode="numeric"
          placeholder="Carbs per 100g"
          value={form.carbohydratesPer100g}
          onChange={(e) =>
            updateNumber(
              "carbohydratesPer100g",
              e.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "") || "0",
            )
          }
          className="w-full rounded-lg bg-neutral-800 p-3 text-white"
        />

        <input
          type="text"
          inputMode="numeric"
          placeholder="Fat per 100g"
          value={form.fatsPer100g}
          onChange={(e) =>
            updateNumber(
              "fatsPer100g",
              e.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "") || "0",
            )
          }
          className="w-full rounded-lg bg-neutral-800 p-3 text-white"
        />

        <input
          type="text"
          inputMode="numeric"
          placeholder="Protein per 100g"
          value={form.proteinPer100g}
          onChange={(e) =>
            updateNumber(
              "proteinPer100g",
              e.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "") || "0",
            )
          }
          className="w-full rounded-lg bg-neutral-800 p-3 text-white"
        />

        <div className="space-y-1 text-white">
          <p>Calories: {calories.toFixed(0)} kcal</p>

          <p>Carbs: {carbohydratesGrams.toFixed(1)} g</p>

          <p>Fat: {fatsGrams.toFixed(1)} g</p>

          <p>Protein: {proteinGrams.toFixed(1)} g</p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-neutral-700 px-4 py-2 text-white"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={addProduct}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white"
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
