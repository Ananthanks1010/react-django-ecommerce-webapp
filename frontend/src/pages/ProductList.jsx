import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const ProductList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const productIds = location.state?.productIds || [];

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProductData = async () => {
      if (productIds.length === 0) {
        navigate("/");
        return;
      }

      try {
        const response = await axios.post("http://localhost:8000/Product/get-by-ids", {
          product_ids: productIds,
        });

        setProducts(response.data.products || []);
      } catch (error) {
        console.error("Error fetching product data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productIds, navigate]);

  return (
    <div className="px-4 py-8 max-w-screen-xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Product List</h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-center text-red-500">No products found.</p>
      ) : (
        <div className="grid flex flex-row md:flex-col gap-6 grid-cols-1 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <div
              key={product.product_id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex flex-row md:flex-col overflow-hidden"
            >
              <div className="h-48 overflow-hidden flex items-center justify-center bg-gray-100">
                <img
                  src={product.image || "https://via.placeholder.com/200"}
                  alt={product.name}
                  className="h-full w-auto object-contain"
                />
              </div>

              <div className="p-4 flex flex-col flex-grow">
                <h2 className="text-lg font-semibold mb-1">{product.name}</h2>
                <p className="text-sm text-gray-600 mb-2">{product.product_description}</p>
                <p className="text-xs text-gray-400 mb-4">ID: {product.product_id}</p>
                <button
                  onClick={() => navigate(`/product/${product.product_id}`)}
                  className="mt-auto bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded"
                >
                  View Product
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
