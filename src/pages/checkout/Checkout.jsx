import React, { useState, useEffect } from "react"; 
import Loader from "../../components/loader/Loader";
import { useSelector, useDispatch } from "react-redux";
import { calculateSubtotal, calculateTotalQuantity, clearCart } from "../../redux/slice/cartSlice";
import { formatPrice } from "../../utils/formatPrice";
import supabase from "../../supabase/supabase"; 
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./paystack.css";

const Checkout = () => {
    const { cartItems, totalAmount } = useSelector((store) => store.cart);
    const { shippingAddress } = useSelector((store) => store.checkout);
    const { email, userId } = useSelector((store) => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        dispatch(calculateSubtotal());
        dispatch(calculateTotalQuantity());
    }, [dispatch, cartItems]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const reference = urlParams.get("reference");

        if (reference) {
            ;
            verifyTransaction(reference);
        }
    }, []);

    const saveOrder = async (orderDetails) => {
        ;

        if (!orderDetails.email) {
            toast.error("User email not found. Cannot save order.");
            return null;
        }

        try {
            const { data, error } = await supabase
                .from("orders")
                .insert([{ ...orderDetails, createdAt: new Date().toISOString() }])
                .select("id")
                .single();

            if (error) throw error;

            ;
            toast.success("Order saved successfully!");
            return data.id;
        } catch (error) {
            console.error("Error saving order:", error);
            toast.error(`Failed to save order: ${error.message}`);
            return null;
        }
    };

    const handlePaystackPayment = async () => {
        setIsLoading(true);
        try {
            ;
            ;

            const orderDetails = {
                items: cartItems.map((item) => ({
                    id: item.id,
                    name: item.name, 
                    imageURL: item.imageURL,
                    price: item.price,
                    qty: item.qty,
                    category: item.category, 
                    brand: item.brand,  
                    description: item.description, 
                })),
                email,
                shippingAddress,
                amount: totalAmount,  // Ensure correct amount
                description: `Payment of ${formatPrice(totalAmount)} from ${email}`,
                orderStatus: "Pending",
            };

            ;

            // Save the order before initiating the payment
            const savedOrderId = await saveOrder(orderDetails);
            if (!savedOrderId) {
                toast.error("Failed to save order. Please try again.");
                return;
            }

            sessionStorage.setItem("pendingOrderId", savedOrderId);

            const response = await fetch("https://laststopenterprise.onrender.com/initialize-transaction", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderDetails),
            });

            ;

            const data = await response.json();
            ;

            if (data.authorization_url) {
                window.location.href = data.authorization_url;
            } else {
                toast.error("Failed to initiate payment. Please try again.");
            }
        } catch (error) {
            console.error("Error during payment initiation:", error);
            toast.error("Failed to process payment. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const verifyTransaction = async (reference) => {
        ;

        try {
            const response = await fetch(`https://laststopenterprise.onrender.com/verify-transaction?reference=${reference}`);

            if (!response.ok) {
                throw new Error(`Transaction verification failed with status ${response.status}`);
            }

            const data = await response.json();
            ;

            if (data.success) {
                const pendingOrderId = sessionStorage.getItem("pendingOrderId");

                if (pendingOrderId) {
                    ;
                    await updateOrderStatus(pendingOrderId, "Completed");
                    dispatch(clearCart());
                    sessionStorage.removeItem("pendingOrderId");
                    toast.success("Payment successful and order completed!");
                    navigate("/checkout-success");
                } else {
                    throw new Error("Pending order ID not found in session storage");
                }
            } else {
                toast.error("Transaction verification failed.");
            }
        } catch (error) {
            console.error("Error verifying transaction:", error);
            toast.error(`Error verifying payment: ${error.message}`);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        ;

        try {
            const { error } = await supabase
                .from("orders")
                .update({ orderStatus: newStatus, updatedAt: new Date().toISOString() })
                .eq("id", orderId);

            if (error) throw error;

            ;
        } catch (error) {
            console.error("Error updating order status:", error);
            toast.error(`Failed to update order status: ${error.message}`);
        }
    };

    return (
        <main>
            {isLoading && <Loader />}
            <div className="rounded-md shadow-xl pt-4 pb-8 px-10">
                <h1 className="text-3xl font-light mb-2">Paystack Checkout</h1>
                <button onClick={handlePaystackPayment} disabled={isLoading} className="btn bg-blue-600 paystack-button">
                    {isLoading ? "Processing..." : "Pay Now"}
                </button>
            </div>
        </main>
    );
};

export default Checkout;
