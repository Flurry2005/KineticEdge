import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { useEffect, useRef, useState } from "react";

export type Product = {
  product_name?: string;
  brands?: string;
  image_front_url?: string;
  nutriments?: any;
};

interface BarcodeScannerProps {
  onClose: () => void;
  onProductFound: (barcode: string, product: Product) => void;
}

export default function BarcodeScanner({
  onClose,
  onProductFound,
}: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const foundRef = useRef(false);

  const [found, setFound] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!videoRef.current) return;

    const hints = new Map<DecodeHintType, unknown>();

    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.CODE_128,
    ]);

    hints.set(DecodeHintType.TRY_HARDER, true);

    const reader = new BrowserMultiFormatReader(hints);

    async function start() {
      try {
        controlsRef.current = await reader.decodeFromConstraints(
          {
            video: {
              facingMode: "environment",
            },
          },
          videoRef.current!,
          async (result) => {
            if (!result || foundRef.current) return;

            foundRef.current = true;
            setFound(true);

            const barcode = result.getText();

            setTimeout(async () => {
              controlsRef.current?.stop();

              const stream = videoRef.current?.srcObject as MediaStream | null;
              stream?.getTracks().forEach((track) => track.stop());

              try {
                const res = await fetch(
                  `https://world.openfoodfacts.org/api/v3/product/${barcode}?fields=product_name,nutriments,brands,image_front_url`,
                );

                const data = await res.json();

                if (data.status === "success") {
                  onProductFound(barcode, data.product);
                  onClose();
                } else {
                  setError("Product not found");
                  foundRef.current = false;
                  setFound(false);
                }
              } catch {
                setError("Lookup failed");
                foundRef.current = false;
                setFound(false);
              }
            }, 500);
          },
        );
      } catch (e) {
        if (e instanceof DOMException) {
          setError(`${e.name}: ${e.message}`);
        } else {
          setError(String(e));
        }
      }
    }

    start();

    return () => {
      controlsRef.current?.stop();

      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`w-72 h-40 rounded-xl border-4 transition-all duration-300 ${
            found
              ? "border-green-400 bg-green-400/20 scale-105"
              : "border-white"
          }`}
        />
      </div>

      <button
        onClick={onClose}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 rounded bg-white px-6 py-3"
      >
        Cancel
      </button>

      {error && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 rounded bg-red-500 px-4 py-2 text-white">
          {error}
        </div>
      )}
    </div>
  );
}
