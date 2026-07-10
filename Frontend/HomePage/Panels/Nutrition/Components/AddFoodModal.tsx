import { useState } from "react";
import type { Product } from "../../../../utils/BarcodeScanner";

interface AddFoodModalProps {
  barcode: string;
  product: Product;
  onClose: () => void;
  onAdded: () => void;
}

export default function AddFoodModal({
  barcode,
  product,
  onClose,
  onAdded,
}: AddFoodModalProps) {
  const [quantityGrams, setQuantityGrams] = useState(100);
  const [loading, setLoading] = useState(false);

  const caloriesPer100g = Number(product.nutriments?.["energy-kcal_100g"]) || 0;

  const carbohydratesPer100g =
    Number(product.nutriments?.["carbohydrates_100g"]) || 0;

  const fatsPer100g = Number(product.nutriments?.["fat_100g"]) || 0;

  const proteinPer100g = Number(product.nutriments?.["proteins_100g"]) || 0;

  const calories = (caloriesPer100g * quantityGrams) / 100;

  const carbohydratesGrams = (carbohydratesPer100g * quantityGrams) / 100;

  const fatsGrams = (fatsPer100g * quantityGrams) / 100;

  const proteinGrams = (proteinPer100g * quantityGrams) / 100;

  async function addProduct() {
    try {
      setLoading(true);

      await fetch(
        import.meta.env.DEV
          ? "http://192.168.1.201:3000/add-food-product"
          : "https://api.kineticedge.liamjorgensen.dev/add-food-product",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            barcode,

            productName: product.product_name ?? "Unknown",

            productBrand: product.brands ?? "",

            productImage: product.image_front_url ?? "",

            quantityGrams,

            caloriesPer100g,

            carbohydratesPer100g,

            fatsPer100g,

            proteinPer100g,

            calories,

            carbohydratesGrams,

            fatsGrams,

            proteinGrams,
          }),
        },
      );

      onAdded();
    } catch (error) {
      console.error("Failed adding product:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-[420px] rounded-2xl bg-[#131313] p-6 space-y-5">
        {product.image_front_url && (
          <img
            src={product.image_front_url}
            className="mx-auto h-40 rounded object-contain"
          />
        )}

        <h2 className="text-xl font-black text-white">
          {product.product_name}
        </h2>

        <p className="text-gray-400">{product.brands}</p>

        <div>
          <label className="text-sm text-gray-400">Quantity grams</label>

          <input
            type="number"
            min={1}
            value={quantityGrams}
            onChange={(e) => setQuantityGrams(Number(e.target.value))}
            className="mt-2 w-full rounded-lg bg-neutral-800 p-3 text-white"
          />
        </div>

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
