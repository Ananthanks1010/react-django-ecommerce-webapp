import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Trash2 } from "lucide-react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { useAuth } from "../components/authcontext";
import axios from "axios";

const CartPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId =
    user?.user_id || user?.id || (location?.state && location.state.user_id);

  useEffect(() => {
    const fetchCart = async () => {
      if (!userId) {
        console.warn("No user ID available — skipping cart fetch.");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.post("http://localhost:8000/cart/get/", {
          user_id: userId,
        });

        const productIds = res.data.product_ids || [];
        console.log("🛒 Product IDs in cart:", productIds);

        const items = await Promise.all(
          productIds.map(async (id) => {
            try {
              const detailRes = await axios.get(
                `http://localhost:8000/Product/product/${id}/`
              );
              const p = detailRes.data;
              const mappedItem = {
                id: p.product_id,
                name: p.product_name,
                price: p.product_price,
                image: p.image_url,
                quantity: 1,
              };
              console.log(`✅ Product ${id} mapped:`, mappedItem);
              return mappedItem;
            } catch (err) {
              console.warn(`⚠️ Failed to fetch product ${id}:`, err.message);
              return null;
            }
          })
        );

        const validItems = items.filter(Boolean);
        console.log("✅ Final cart items:", validItems);
        setCartItems(validItems);
      } catch (error) {
        console.error("Failed to load cart:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [userId]);

  const updateQuantity = (id, newQuantity) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = async (id) => {
    try {
      await axios.delete("http://localhost:8000/cart/remove/", {
        data: { user_id: userId, product_id: id },
      });
      setCartItems((items) => items.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    navigate("/payment", {
      state: {
        product_ids: cartItems.map((item) => item.id),
        user_id: userId,
      },
    });
  };

  return (
    <div>
      <NavBar />
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>

        {loading ? (
          <p className="text-center text-gray-500">Loading cart...</p>
        ) : !userId ? (
          <p className="text-center text-gray-500">
            Please log in to view your cart.
          </p>
        ) : cartItems.length === 0 ? (
          <p className="text-center text-gray-500">Your cart is empty.</p>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="grid grid-row-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-24 object-cover rounded"
                    />
                  </div>
                  <div className="sm:col-span-8">
                    <h2 className="text-xl font-semibold">{item.name}</h2>
                    <p className="text-gray-600">${item.price.toFixed(2)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <label htmlFor={`qty-${item.id}`} className="text-sm">
                        Qty:
                      </label>
                      <input
                        id={`qty-${item.id}`}
                        type="number"
                        min="1"
                        className="w-16 p-1 border rounded"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.id, parseInt(e.target.value) || 1)
                        }
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-1 flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="text-red-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            <Card className="p-6">
              <CardContent>
                <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm mb-2"
                  >
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-4 mt-4 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <Button className="mt-6 w-full" onClick={handleCheckout}>
                  Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;
