import { RotateCcw, ScanBarcode } from "lucide-react";
import React, { type Dispatch, type SetStateAction } from "react";

interface Props {
  setShowScanner: Dispatch<SetStateAction<boolean>>;
  setShowMethodSelection: Dispatch<SetStateAction<boolean>>;
  setShowRecentProducts: Dispatch<SetStateAction<boolean>>;
}

function AddProductMethodSelection({
  setShowScanner,
  setShowMethodSelection,
  setShowRecentProducts,
}: Props) {
  return (
    <div
      onClick={() => setShowMethodSelection(false)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
    >
      <section
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl border border-white/10 bg-zinc-900/90 p-5 shadow-2xl"
      >
        <h2 className="mb-5 text-center text-lg font-semibold text-white">
          Add Product
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => {
              setShowScanner(true);
              setShowMethodSelection(false);
            }}
            className="group flex flex-col items-center justify-center gap-3 rounded-2xl bg-zinc-800 p-5 text-white transition-all duration-200 hover:bg-blue-600 hover:scale-105 active:scale-95"
          >
            <ScanBarcode
              size={34}
              className="transition-transform duration-300 group-hover:scale-110"
            />
            <span className="font-medium">Scan</span>
          </button>

          <button
            onClick={() => {
              setShowRecentProducts(true);
              setShowMethodSelection(false);
            }}
            className="group flex flex-col items-center justify-center gap-3 rounded-2xl bg-zinc-800 p-5 text-white transition-all duration-200 hover:bg-emerald-600 hover:scale-105 active:scale-95"
          >
            <RotateCcw
              size={34}
              className="transition-transform duration-300 group-hover:-rotate-360"
            />
            <span className="font-medium">Recent</span>
          </button>
        </div>
      </section>
    </div>
  );
}

export default AddProductMethodSelection;
