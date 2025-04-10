import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Trash2 } from "lucide-react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const initialCartItems = [
  {
    id: 1,
    name: "Gucci",
    price: 399.99,
    quantity: 1,
    image: "https://tobiramasset.s3.us-east-1.amazonaws.com/products/9/image1.png"
  },
  {
    id: 2,
    name: "Brad_ford",
    price: 199.99,
    quantity: 2,
    image: "https://tobiramasset.s3.us-east-1.amazonaws.com/products/8/image1.png"
  }
];

const CartPage = () => {
  const [cartItems, setCartItems] = useState(initialCartItems);

  const updateQuantity = (id, newQuantity) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div >
        < NavBar/>
    <div className="max-w-3xl mx-auto p-6 space-y-6">
        
      <h1 className="text-3xl font-bold">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <p className="text-center text-gray-500">Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="grid grid-row-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-3">
                  <img src={item.image} alt={item.name} className="w-full h-24 object-cover rounded" />
                </div>
                <div className="sm:col-span-8">
                  <h2 className="text-xl font-semibold">{item.name}</h2>
                  <p className="text-gray-600">${item.price.toFixed(2)}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <label htmlFor={`qty-${item.id}`} className="text-sm">Qty:</label>
                    <input
                      id={`qty-${item.id}`}
                      type="number"
                      min="1"
                      className="w-16 p-1 border rounded"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>
                <div className="sm:col-span-1 flex justify-end">
                  <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
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
                <div key={item.id} className="flex justify-between text-sm mb-2">
                  <span>{item.name} x {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-4 mt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Button className="mt-6 w-full">Checkout</Button>
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
