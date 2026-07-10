import { useState } from "react";
import BarcodeScanner from "../../../../utils/BarcodeScanner";
import type { Product } from "../../../../utils/BarcodeScanner";

interface TodayPanelProps {
  foodIntakeToday: any;
  onProductFound: (barcode: string, product: Product) => void;
}

export default function TodayPanel({
  foodIntakeToday,
  onProductFound,
}: TodayPanelProps) {
  const [showScanner, setShowScanner] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Today's Food</h2>

        <button
          onClick={() => setShowScanner(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
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

                {product.productBrand && (
                  <p className="text-sm text-gray-400">
                    {product.productBrand}
                  </p>
                )}

                <p className="text-sm text-gray-400">
                  {product.quantityGrams} g
                </p>

                <p className="text-sm text-gray-400">{product.calories} kcal</p>
              </div>
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
        />
      )}
    </div>
  );
}
