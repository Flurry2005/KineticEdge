import { useState } from "react";

interface ManualFoodModalProps {
  barcode: string;
  onClose: () => void;
  onAdded: () => void;
}

export default function ManualFoodModal({
  barcode,
  onClose,
  onAdded,
}: ManualFoodModalProps) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    productName: "",
    productBrand: "",
    productImage: "",

    quantityGrams: 100,

    caloriesPer100g: 0,
    carbohydratesPer100g: 0,
    fatsPer100g: 0,
    proteinPer100g: 0,
  });

  const calories = (form.caloriesPer100g * form.quantityGrams) / 100;

  const carbohydratesGrams =
    (form.carbohydratesPer100g * form.quantityGrams) / 100;

  const fatsGrams = (form.fatsPer100g * form.quantityGrams) / 100;

  const proteinGrams = (form.proteinPer100g * form.quantityGrams) / 100;

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
      [key]: Number(value),
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
            barcode,

            productName: form.productName,

            productBrand: form.productBrand,

            productImage: form.productImage,

            quantityGrams: form.quantityGrams,

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
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-[420px] rounded-2xl bg-[#131313] p-6 space-y-4">
        <h2 className="text-xl font-black text-white">Add product manually</h2>

        <input
          placeholder="Product name"
          value={form.productName}
          onChange={(e) =>
            setForm({
              ...form,
              productName: e.target.value,
            })
          }
          className="w-full rounded bg-neutral-800 p-3 text-white"
        />

        <input
          placeholder="Brand"
          value={form.productBrand}
          onChange={(e) =>
            setForm({
              ...form,
              productBrand: e.target.value,
            })
          }
          className="w-full rounded bg-neutral-800 p-3 text-white"
        />

        <input
          placeholder="Image URL"
          value={form.productImage}
          onChange={(e) =>
            setForm({
              ...form,
              productImage: e.target.value,
            })
          }
          className="w-full rounded bg-neutral-800 p-3 text-white"
        />

        <label className="text-gray-400 text-sm">Quantity grams</label>

        <input
          type="number"
          value={form.quantityGrams}
          onChange={(e) => updateNumber("quantityGrams", e.target.value)}
          className="w-full rounded bg-neutral-800 p-3 text-white"
        />

        <p className="text-gray-400 text-sm">Nutrition per 100g</p>

        {[
          ["caloriesPer100g", "Calories"],
          ["carbohydratesPer100g", "Carbs"],
          ["fatsPer100g", "Fat"],
          ["proteinPer100g", "Protein"],
        ].map(([key, label]) => (
          <input
            key={key}
            type="number"
            placeholder={`${label} per 100g`}
            value={form[key as keyof typeof form]}
            onChange={(e) =>
              updateNumber(key as keyof typeof form, e.target.value)
            }
            className="w-full rounded bg-neutral-800 p-3 text-white"
          />
        ))}

        <div className="text-white space-y-1">
          <p>Calories: {calories.toFixed(0)} kcal</p>
          <p>Carbs: {carbohydratesGrams.toFixed(1)} g</p>
          <p>Fat: {fatsGrams.toFixed(1)} g</p>
          <p>Protein: {proteinGrams.toFixed(1)} g</p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded bg-neutral-700 px-4 py-2 text-white"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={addProduct}
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
