import { useState } from "react";
import BarcodeScanner from "../../../../utils/BarcodeScanner";
import type { Product } from "../../../../utils/BarcodeScanner";
import { ChevronDown, Trash2 } from "lucide-react";

interface PastPanelProps {
  foodIntakes: any;
  onProductFound: (barcode: string, product: Product, _id: any) => void;
  onProductNotFound: (barcode: string, _id: any) => void;
  updateFoods: any;
}

export default function PastPanel({
  foodIntakes,
  onProductFound,
  onProductNotFound,
  updateFoods,
}: PastPanelProps) {
  const [showScanner, setShowScanner] = useState(false);
  const [selectedDayDate, setSelectedDayDate] = useState<any | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  const toggleDay = (date: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  };

  const getDayTotals = (products: any[]) =>
    products.reduce(
      (totals, product) => ({
        calories: totals.calories + (product.calories || 0),
        carbs: totals.carbs + (product.carbohydratesGrams || 0),
        fat: totals.fat + (product.fatsGrams || 0),
        protein: totals.protein + (product.proteinGrams || 0),
      }),
      { calories: 0, carbs: 0, fat: 0, protein: 0 },
    );

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
    <div className="space-y-4 mb-5">
      {foodIntakes?.length ? (
        foodIntakes.map((day: any, dayIndex: number) => {
          if (!day.products?.length) return null;

          const isExpanded = expandedDays.has(day.date);
          const totals = getDayTotals(day.products);

          return (
            <div
              key={day._id ?? dayIndex}
              className="overflow-hidden rounded-lg bg-neutral-800"
            >
              {/* Card header / summary — click to expand */}
              <button
                onClick={() => toggleDay(day.date)}
                className="flex w-full cursor-pointer items-center justify-between gap-4 p-4 text-left"
              >
                <div className="flex items-center gap-4">
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                  <div>
                    <h2 className="text-xl font-bold text-white">{day.date}</h2>
                    <p className="text-sm text-gray-400">
                      {day.products.length} product
                      {day.products.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="flex gap-5 text-right">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {totals.calories.toFixed(0)} kcal
                    </p>
                  </div>
                  <div className="hidden gap-5 sm:flex">
                    <p className="text-sm text-gray-400">
                      Carbs: {totals.carbs.toFixed(0)}g
                    </p>
                    <p className="text-sm text-gray-400">
                      Fat: {totals.fat.toFixed(0)}g
                    </p>
                    <p className="text-sm text-gray-400">
                      Protein: {totals.protein.toFixed(0)}g
                    </p>
                  </div>
                </div>
              </button>

              {/* Expanded product list */}
              {isExpanded && (
                <div className="space-y-3 border-t border-neutral-700 p-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDayDate(day.date);
                      setShowScanner(true);
                    }}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 cursor-pointer"
                  >
                    Add product
                  </button>

                  {day.products.map((product: any, index: number) => (
                    <div
                      key={product._id ?? index}
                      className="flex items-center gap-4 rounded-lg bg-neutral-900 p-4"
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
                        className="ml-auto rounded-xl bg-red-500/40 px-2 py-1 text-red-500 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveProduct(product._id, day.date);
                        }}
                      >
                        <Trash2 />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      ) : (
        <p className="text-gray-400">No past.</p>
      )}
      {showScanner && (
        <BarcodeScanner
          onClose={() => {
            setSelectedDayDate(null);
            setShowScanner(false);
          }}
          onProductFound={(barcode, product) => {
            setShowScanner(false);
            onProductFound(barcode, product, selectedDayDate);
          }}
          onProductNotFound={(barcode) => {
            setSelectedDayDate(null);
            setShowScanner(false);
            onProductNotFound(barcode, selectedDayDate);
          }}
        />
      )}
    </div>
  );
}
