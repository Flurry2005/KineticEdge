import { useState } from "react";
import BarcodeScanner from "../../../../utils/BarcodeScanner";
import type { Product } from "../../../../utils/BarcodeScanner";
import { Trash2 } from "lucide-react";

interface TodayPanelProps {
  foodIntakeToday: any;
  onProductFound: (barcode: string, product: Product) => void;
  onProductNotFound: (barcode: string) => void;
  updateFoods: any;
}

export default function TodayPanel({
  foodIntakeToday,
  onProductFound,
  onProductNotFound,
  updateFoods,
}: TodayPanelProps) {
  const [showScanner, setShowScanner] = useState(false);

  const handleRemoveProduct = async (_id: any, date: any) => {
    const res = await fetch(
      import.meta.env.DEV
        ? "http://192.168.1.201:3000/remove-food-product"
        : "https://api.kineticedge.liamjorgensen.dev/remove-food-product",
      {
        credentials: "include",
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
          _id,
        }),
      },
    );
    if (res.ok) {
      updateFoods();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Today's Food</h2>

        <button
          onClick={() => setShowScanner(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 cursor-pointer"
        >
          Add product
        </button>
      </div>

      {foodIntakeToday?.products?.length ? (
        <div className="space-y-3">
          {foodIntakeToday.products.map((product: any, index: number) => (
            <div
              key={product._id ?? index}
              className="flex items-center gap-4 rounded-lg bg-neutral-800 p-4"
            >
              {product.productImage && (
                <img
                  src={product.productImage}
                  alt={product.productName}
                  className="h-16 w-16 rounded object-cover"
                />
              )}

              <div>
                <h3 className="font-semibold text-white">
                  {product.productName}
                </h3>

                <div className="flex gap-5">
                  {/* Overview */}
                  <div>
                    {product.productBrand && (
                      <p className="text-sm text-gray-400">
                        {product.productBrand}
                      </p>
                    )}
                    <p className="text-sm text-gray-400">
                      {product.quantityGrams} g
                    </p>
                    <p className="text-sm text-gray-400">
                      {product.calories.toFixed(0)} kcal
                    </p>
                  </div>
                  {/* Nutrients */}
                  <div>
                    {product.carbohydratesGrams >= 0 && (
                      <p className="text-sm text-gray-400">
                        Carbs: {product.carbohydratesGrams} g
                      </p>
                    )}
                    <p className="text-sm text-gray-400">
                      Fat: {product.fatsGrams} g
                    </p>
                    <p className="text-sm text-gray-400">
                      Protein: {product.proteinGrams} g
                    </p>
                  </div>
                </div>
              </div>
              <button
                className="text-red-500 bg-red-500/40 px-2 py-1 rounded-xl cursor-pointer"
                onClick={() =>
                  handleRemoveProduct(product._id, foodIntakeToday.date)
                }
              >
                <Trash2 />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">No products added today.</p>
      )}

      {showScanner && (
        <BarcodeScanner
          onClose={() => setShowScanner(false)}
          onProductFound={(barcode, product) => {
            setShowScanner(false);

            onProductFound(barcode, product);
          }}
          onProductNotFound={(barcode) => {
            setShowScanner(false);

            onProductNotFound(barcode);
          }}
        />
      )}
    </div>
  );
}
