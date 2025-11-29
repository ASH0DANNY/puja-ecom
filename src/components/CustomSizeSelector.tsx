import { useState } from "react";
import type { CustomDimensions, Product } from "../types/product";

interface CustomSizeSelectorProps {
  product: Product;
  onSelectSize: (size: string, customDimensions?: CustomDimensions) => void;
  selectedSize?: string;
  selectedCustomDimensions?: CustomDimensions;
}

const CustomSizeSelector = ({
  product,
  onSelectSize,
  selectedSize,
  selectedCustomDimensions,
}: CustomSizeSelectorProps) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customWidth, setCustomWidth] = useState(
    selectedCustomDimensions?.width.toString() || ""
  );
  const [customHeight, setCustomHeight] = useState(
    selectedCustomDimensions?.height.toString() || ""
  );
  const [customDepth, setCustomDepth] = useState(
    selectedCustomDimensions?.depth?.toString() || ""
  );
  const [error, setError] = useState("");

  if (!product.sizes || product.sizes.length === 0) {
    return null;
  }

  const standardSizes = product.sizes
    .filter(
      (size) =>
        typeof size === "string" ||
        (typeof size === "object" && size.isStandard)
    )
    .map((size) => (typeof size === "string" ? size : size.label));

  const hasCustomSizeOption =
    product.hasCustomSize &&
    product.sizes.some(
      (size) =>
        (typeof size === "object" && size.isCustomizable) ||
        (typeof size === "string" && size.toLowerCase().includes("custom"))
    );

  const handleStandardSizeSelect = (size: string) => {
    setShowCustomInput(false);
    setError("");
    onSelectSize(size);
  };

  const handleCustomSizeClick = () => {
    setShowCustomInput(true);
  };

  const handleCustomSizeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const width = parseFloat(customWidth);
    const height = parseFloat(customHeight);
    const depth = customDepth ? parseFloat(customDepth) : undefined;

    // Basic validation - only check that values are numbers
    if (isNaN(width) || isNaN(height)) {
      setError("Width and height are required");
      return;
    }

    if (width <= 0 || height <= 0) {
      setError("Width and height must be greater than 0");
      return;
    }

    if (depth !== undefined && depth <= 0) {
      setError("Depth must be greater than 0");
      return;
    }

    const customDimensions: CustomDimensions = {
      width,
      height,
      depth,
    };

    onSelectSize("Custom", customDimensions);
    setShowCustomInput(false);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Size</h3>

      {/* Standard Sizes */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Standard Sizes</h4>
        <div className="flex flex-wrap gap-3">
          {standardSizes.map((size) => {
            const sizeWithPrice = product.sizesWithPrices?.find(
              (swp) => swp.size === size
            );
            const price = sizeWithPrice?.price || 0;
            const weight = sizeWithPrice?.weight;
            const dimensions = sizeWithPrice?.dimensions;

            return (
              <div key={size} className="flex flex-col items-start">
                <button
                  onClick={() => handleStandardSizeSelect(size)}
                  className={`px-6 py-3 border-2 rounded-lg font-medium transition-all ${
                    selectedSize === size && !showCustomInput
                      ? "border-primary bg-primary text-white shadow-md"
                      : "border-gray-300 hover:border-primary hover:shadow-sm"
                  }`}
                >
                  {size}
                </button>
                {price > 0 && (
                  <span className="text-xs text-gray-600 mt-1">{price.toFixed(2)}</span>
                )}
                {(weight || dimensions) && (
                  <span className="text-xs text-gray-500 mt-0.5">
                    {weight && `${weight}`}
                    {weight && dimensions && " • "}
                    {dimensions}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Size Option */}
      {hasCustomSizeOption && (
        <div className="space-y-3 border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700">Custom Size</h4>
          <button
            onClick={handleCustomSizeClick}
            className={`w-full px-6 py-3 border-2 rounded-lg font-medium transition-all ${
              showCustomInput
                ? "border-primary bg-primary text-white shadow-md"
                : "border-gray-300 hover:border-primary hover:shadow-sm"
            }`}
          >
            {showCustomInput ? "✓ Custom Size Selected" : "Add Custom Size"}
          </button>

          {/* Custom Size Input Form */}
          {showCustomInput && (
            <form onSubmit={handleCustomSizeSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Width (cm)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                    placeholder="Enter width"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(e.target.value)}
                    placeholder="Enter height"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Depth (cm) - Optional
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={customDepth}
                    onChange={(e) => setCustomDepth(e.target.value)}
                    placeholder="Enter depth (leave empty for 2D products)"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border-2 border-red-300 rounded-lg">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all"
              >
                Confirm Custom Size
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomSizeSelector;
