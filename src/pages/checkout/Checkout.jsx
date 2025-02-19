import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { addOrderedProducts} from "../../redux/slice/orderSlice";
import { clearCart } from "../../redux/slice/cartSlice";
import { formatPrice } from "../../utils/formatPrice";

const Checkout = () => {
    const dispatch = useDispatch();
    const cartItems = useSelector(state => state.cart.items);
    const totalAmount = useSelector(state => state.cart.totalAmount);
    const email = useSelector(state => state.user.email);
    const shippingAddress = useSelector(state => state.user.shippingAddress);
    const [isLoading, setIsLoading] = useState(false);

    const handlePlaceOrder = async () => {
        if (cartItems.length === 0) {
            toast.error("Your cart is empty.");
            return;
        }

        setIsLoading(true);

        try {
            const orderDetails = {
                items: cartItems.map(({ id, name, imageURL, price, qty, category }) => ({
                    id,
                    name,
                    imageURL,
                    price,
                    qty,
                    category
                })),
                email,
                shippingAddress,
                amount: totalAmount,
                description: `Payment of ${formatPrice(totalAmount / 100)} from ${email}`,
                orderStatus: "Pending",
            };

            // Save the order before payment
            const savedOrderId = await saveOrder(orderDetails);
            if (!savedOrderId) {
                toast.error("Failed to save order. Please try again.");
                setIsLoading(false);
                return;
            }

            sessionStorage.setItem("pendingOrderId", savedOrderId);

            // Dispatch order details to store
            dispatch(addOrderedProducts(orderDetails));
            dispatch(clearCart());

            // Proceed to payment
            await handlePaystackPayment(orderDetails);
        } catch (error) {
            console.error("Error placing order:", error);
            toast.error("Failed to place order. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePaystackPayment = async (orderDetails) => {
        try {
            console.log("Starting payment process...");

            const response = await fetch("https://laststopenterprise.onrender.com/initialize-transaction", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderDetails),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Fetch failed: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            if (data.authorization_url) {
                window.location.href = data.authorization_url;
            } else {
                toast.error("Failed to initiate payment. Please try again.");
            }
        } catch (error) {
            console.error("Error during payment initiation:", error);
            toast.error("Failed to process payment. Please try again.");
        }
    };

    return (
        <div className="checkout-container">
            <h2>Checkout</h2>
            <div className="order-summary">
                <p>Total: {formatPrice(totalAmount / 100)}</p>
            </div>
            <button onClick={handlePlaceOrder} disabled={isLoading} className="btn bg-blue-600 paystack-button">
                {isLoading ? "Processing..." : "Pay Now"}
            </button>
        </div>
    );
};

export default Checkout;
