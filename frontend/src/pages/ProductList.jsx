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
        navigate("/"); // redirect to homepage if no IDs
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Product List</h1>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-red-600">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.product_id}
              className="border rounded-xl shadow-md p-4 hover:shadow-lg transition bg-white flex flex-row"
            >
              {/* Image */}
              <img
                src={product.image || "https://via.placeholder.com/150"}
                alt={product.name}
                className="w-full h-48 object-contain mb-4 rounded"
              />

              {/* Info */}
              <div>
              <h2 className="text-lg font-semibold mb-1">{product.name || "Unnamed Product"}</h2> <br />
              <p className="text-gray-700 mb-1">{product.product_description}</p> <br />
              <p className="text-sm text-gray-500 mb-2">ID: {product.product_id}</p> <br />
              </div>
              <button
                onClick={() => navigate(`/product/${product.product_id}`)}
                className="mt-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                View Product
              </button>
            </div>

          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
