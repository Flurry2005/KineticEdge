import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { useEffect, useRef, useState } from "react";

type Product = {
  product_name?: string;
  brands?: string;
  image_front_url?: string;
};

export default function BarcodeScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const foundRef = useRef(false);

  const [scanning, setScanning] = useState(false);
  const [found, setFound] = useState(false);

  const [barcode, setBarcode] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");

  function startScanner() {
    foundRef.current = false;

    setScanning(true);
    setFound(false);
    setError("");
  }

  useEffect(() => {
    if (!scanning || !videoRef.current) return;

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
            if (!result) return;

            if (foundRef.current) return;

            foundRef.current = true;

            const code = result.getText();

            setFound(true);
            setBarcode(code);

            // Let green animation play before exiting
            setTimeout(async () => {
              controlsRef.current?.stop();

              const stream = videoRef.current?.srcObject as MediaStream | null;

              stream?.getTracks().forEach((track) => track.stop());

              setScanning(false);

              try {
                const res = await fetch(
                  `https://world.openfoodfacts.org/api/v2/product/${code}.json`,
                );

                const data = await res.json();

                if (data.status === 1) {
                  setProduct(data.product);
                } else {
                  setError("Product not found");
                }
              } catch {
                setError("Lookup failed");
              }
            }, 500);
          },
        );
      } catch (e) {
        console.error("Camera error:", e);

        if (e instanceof DOMException) {
          setError(`${e.name}: ${e.message}`);
        } else {
          setError(String(e));
        }

        setScanning(false);
      }
    }

    start();

    return () => {
      controlsRef.current?.stop();

      const stream = videoRef.current?.srcObject as MediaStream | null;

      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [scanning]);

  function stopScanner() {
    controlsRef.current?.stop();

    const stream = videoRef.current?.srcObject as MediaStream | null;

    stream?.getTracks().forEach((t) => t.stop());

    setScanning(false);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {!scanning && (
        <button
          onClick={startScanner}
          className="px-6 py-3 rounded bg-black text-white"
        >
          Scan barcode
        </button>
      )}

      {scanning && (
        <div className="fixed inset-0 bg-black z-50">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Scanner box */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`
                w-72 h-40 rounded-xl border-4
                transition-all duration-300 ease-out
                ${
                  found
                    ? "border-green-400 bg-green-400/20 scale-105 shadow-[0_0_40px_15px_rgba(34,197,94,0.8)]"
                    : "border-white"
                }
              `}
            />
          </div>

          <button
            onClick={stopScanner}
            className="
              absolute bottom-10 left-1/2 -translate-x-1/2
              bg-white px-6 py-3 rounded
            "
          >
            Cancel
          </button>
        </div>
      )}

      <p>Barcode: {barcode || "Not scanned"}</p>

      {error && <p className="text-red-500">{error}</p>}

      {product && (
        <div className="text-center">
          <h2 className="text-xl font-bold">{product.product_name}</h2>

          <p>{product.brands}</p>

          {product.image_front_url && (
            <img src={product.image_front_url} className="w-48 mx-auto" />
          )}
        </div>
      )}
    </div>
  );
}
