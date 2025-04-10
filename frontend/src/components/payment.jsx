import React, { useRef, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { product_ids, user_id } = location.state || {};

  const [products, setProducts] = useState([]);
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [orderId, setOrderId] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);

  const receiptRef = useRef();

  useEffect(() => {
    if (!product_ids || !user_id) {
      navigate('/cart');
      return;
    }

    const fetchUserAndProducts = async () => {
      try {
        // ✅ Fetch username from DynamoDB via POST
        const userResponse = await axios.post('http://127.0.0.1:8000/Auth/get-username/', {
          user_id,
        });
        setUsername(userResponse.data.username);

        // ✅ Fetch product details
        const productResponse = await axios.post('http://localhost:8000/Product/get-by-ids', {
          product_ids,
        });
        setProducts(productResponse.data.products);
      } catch (error) {
        console.error("Failed to fetch user or product data:", error);
        alert("Error loading user or product details. Returning to previous page...");
        navigate(-1);
      }
    };

    fetchUserAndProducts();
  }, [product_ids, user_id, navigate]);

  const handleSubmit = async () => {
    if (!phoneNumber || !paymentMethod) {
      alert("Please fill all required fields.");
      return;
    }

    if (paymentMethod === 'cod') {
      try {
        const res = await axios.post('http://127.0.0.1:8000/cart/checkout/', {
          user_id,
          product_ids,
          phone_number: phoneNumber
        });

        setOrderId(res.data.receipt_id || 'ORDER-' + Date.now());
        setOrderPlaced(true);
      } catch (error) {
        console.error("Error placing order:", error);
        alert("Failed to place order.");
      }
    } else if (paymentMethod === 'card') {
      alert("Card payment is not available at the moment.");
    }
  };

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: `Order_${orderId}`,
    onAfterPrint: () => navigate('/')
  });

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-10">
      {!orderPlaced ? (
        <>
          <h2 className="text-2xl font-bold mb-4">Confirm Your Purchase</h2>
          <p className="mb-2"><strong>Buyer:</strong> {username}</p>

          <div className="space-y-4">
            {products.map((product, index) => (
              <div key={index} className="border p-4 rounded-lg bg-gray-50">
                <p><strong>Name:</strong> {product.name}</p>
                <p><strong>Color:</strong> {product.color}</p>
                <p><strong>Description:</strong> {product.product_description}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <label className="block font-semibold mb-1">Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter your phone number"
            />
          </div>

          <div className="mt-4">
            <label className="block font-semibold mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select</option>
              <option value="cod">Cash on Delivery (COD)</option>
              <option value="card">Credit/Debit Card</option>
            </select>
          </div>

          <button
            onClick={handleSubmit}
            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Confirm Payment
          </button>
        </>
      ) : (
        <>
          <div ref={receiptRef} className="bg-gray-50 p-4 rounded shadow-md">
            <h2 className="text-xl font-bold mb-2">Order Confirmation</h2>
            <p className="mb-1"><strong>Order ID:</strong> {orderId}</p>
            <p className="mb-1"><strong>Buyer:</strong> {username}</p>
            <p className="mb-1"><strong>Phone:</strong> {phoneNumber}</p>
            <div className="mt-4 space-y-2">
              {products.map((product, index) => (
                <div key={index}>
                  <p><strong>{product.name}</strong> - {product.color}</p>
                  <p className="text-sm">{product.product_description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={handlePrint}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              Download PDF
            </button>
            <button
              onClick={handleCancel}
              className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
