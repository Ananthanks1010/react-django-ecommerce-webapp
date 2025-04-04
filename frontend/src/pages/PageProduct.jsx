import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function PageProduct() {
  const { productId } = useParams(); // Get product ID from URL
  console.log("Received productId:", productId); // Debugging

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/Product/product/${productId}/`) // Replace with your actual API
      .then((response) => {
        console.log(response.data);
        setProduct(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching product:", error);
        setError("Failed to load product");
        setLoading(false);
      });
  }, [productId]);

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div>
      <div className="min-h-screen flex flex-col gap-4 p-4 bg-gray-200">
        <div className="w-full h-screen bg-white shadow-lg rounded-lg overflow-hidden flex flex-col">
          {/* Scrollable Product Images */}
          <div className="bg-gray-200 flex overflow-x-auto p-4 space-x-2 scrollbar-hide">
            {product?.thumbnail_url?.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Product ${idx + 1}`}
                className="w-1/2 h-auto object-cover rounded-md flex-shrink-0"
              />
            ))}
          </div>
  
          {/* Product Info Section - Split Layout */}
          <div className="flex flex-row p-4">
            {/* Product Details on Left */}
            <div className="w-1/2 p-4">
              <h2 className="text-2xl font-semibold text-gray-800">{product?.product_name}</h2>
              <p className="text-gray-600 mt-2">{product?.product_description}</p>
              <span className="text-3xl font-bold text-gray-900 mt-4 block">${product?.product_price}</span>
              
              {/* Add to Cart Button */}
              <button className="mt-6 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                Add to Cart
              </button>
            </div>
            
            {/* Size Selector on Right */}
            <div className="w-1/2 p-4">
              <h3 className="text-sm font-medium text-black">Size</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {product?.product_sizes?.map((size, idx) => (
                  <button key={idx} className="px-3 py-1 border rounded text-black hover:bg-black hover:text-white">
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}