import { Package, Search, X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

interface ProductData {
  _id: string;
  product: {
    product_name: string;
    image_front_url?: string;
  };
  barcode: string;
}
export type Product = {
  product_name?: string;
  brands?: string;
  image_front_url?: string;
  nutriments?: any;
};

interface Props {
  onSelect: (barcode: number, product: Product) => void;
  onClose: () => void;
}

function RecentProductsSelection({ onSelect, onClose }: Props) {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchRecentProducts = async () => {
      try {
        const response = await fetch(
          import.meta.env.DEV
            ? "http://192.168.1.201:3000/get-recent-products"
            : "https://api.kineticedge.liamjorgensen.dev/get-recent-products",
          {
            credentials: "include",
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch recent products");
        }

        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const value = search.toLowerCase();

    return products.filter(
      (product) =>
        product.product.product_name.toLowerCase().includes(value) ||
        String(product.barcode).includes(search),
    );
  }, [products, search]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
    >
      <section
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl overflow-hidden"
      >
        <header className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Recent Products</h2>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-zinc-800"
          >
            <X className="text-white" />
          </button>
        </header>

        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2 rounded-xl bg-zinc-800 px-3 py-2">
            <Search className="text-zinc-400" size={18} />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full bg-transparent text-white outline-none"
            />
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <p className="p-6 text-center text-zinc-400">Loading...</p>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center gap-3 p-8 text-zinc-500">
              <Package size={42} />
              <p>No recent products.</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <button
                key={product._id}
                onClick={() => {
                  onSelect(Number(product.barcode), product.product);
                  onClose();
                }}
                className="flex w-full items-center gap-4 p-4 hover:bg-zinc-800 transition"
              >
                {product.product.image_front_url ? (
                  <img
                    src={product.product.image_front_url}
                    alt={product.product.product_name}
                    className="h-14 w-14 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-800">
                    <Package className="text-zinc-400" />
                  </div>
                )}

                <div className="text-left">
                  <h3 className="font-medium text-white">
                    {product.product.product_name}
                  </h3>
                  <p className="text-sm text-zinc-400">{product.barcode}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default RecentProductsSelection;
