import React, { useState, useEffect } from "react";
import Loader from "../../components/loader/Loader";
import { useSelector, useDispatch } from "react-redux";
import { calculateSubtotal, calculateTotalQuantity, clearCart } from "../../redux/slice/cartSlice";
import { storeOrders } from "../../redux/slice/orderSlice";
import { formatPrice } from "../../utils/formatPrice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import supabase from "../../supabase/supabase";
import "./paystack.css";

const CheckoutForm = () => {
    const { cartItems, totalQuantity, totalAmount } = useSelector((store) => store.cart);
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
        const reference = urlParams.get('reference');
        
        if (reference) {
            verifyTransaction(reference);
        }
    }, []);

    const fetchProductDetails = async (cartItems) => {
        try {
            // Use id from cart items since that's what your cart is using
            const productIds = [...new Set(cartItems.map(item => item.id))];
            
            const { data: products, error } = await supabase
                .from('products')
                .select('id, name, imageURL')
                .in('id', productIds);

            if (error) throw error;

            return products.reduce((acc, product) => {
                acc[product.id] = product;
                return acc;
            }, {});
        } catch (error) {
            console.error("Error fetching product details:", error);
            throw error;
        }
    };

    const constructOrderItems = async (cartItems) => {
        try {
            const productDetails = await fetchProductDetails(cartItems);
            
            return cartItems.map(item => ({
                productId: item.id, // Use id as productId for order items
                name: productDetails[item.id]?.name || 'Product Name Not Found',
                imageUrl: productDetails[item.id]?.imageURL || '',
                price: item.price,
                qty: item.qty,
                subtotal: item.qty * item.price
            }));
        } catch (error) {
            console.error("Error constructing order items:", error);
            throw error;
        }
    };

    const saveOrder = async (orderDetails) => {
        if (!orderDetails.email) {
            console.error("User email not found. Cannot save order.");
            toast.error("User email not found. Cannot save order.");
            return null;
        }

        try {
            const items = await constructOrderItems(orderDetails.cartItems);
            
            const completeOrder = {
                email: orderDetails.email,
                userId: orderDetails.userId,
                orderDate: orderDetails.orderDate,
                amount: orderDetails.orderAmount,
                orderStatus: orderDetails.orderStatus,
                shippingAddress: orderDetails.shippingAddress,
                items,
                reference: orderDetails.reference
            };

            const { data, error } = await supabase
                .from("orders")
                .insert([completeOrder])
                .select();
            
            if (error) throw error;

            // Update Redux store with new order
            const { data: allOrders, error: fetchError } = await supabase
                .from("orders")
                .select('*')
                .eq('userId', orderDetails.userId);

            if (!fetchError && allOrders) {
                dispatch(storeOrders(allOrders));
            }

            toast.success("Order saved successfully!");
            return data[0]?.id;
        } catch (error) {
            console.error("Error saving order to Supabase:", error);
            toast.error("Failed to save order. Please try again.");
            return null;
        }
    };

    const handlePaystackPayment = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("https://laststopenterprise.onrender.com/initialize-transaction", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: cartItems.map(item => ({ price: item.price, qty: item.qty })),
                    email,
                    shippingAddress,
                    amount: totalAmount/100,
                    description: `Payment of ${formatPrice(totalAmount/100)} from ${email}`,
                }),
            });

            const data = await response.json();

            if (data.authorization_url) {
                const orderDetails = {
                    email,
                    userId: userId || "guest",
                    orderDate: new Date().toISOString(),
                    orderAmount: totalAmount/100,
                    orderStatus: "Pending Payment",
                    cartItems,
                    shippingAddress,
                    reference: data.reference
                };

                const orderId = await saveOrder(orderDetails);
                
                if (orderId) {
                    sessionStorage.setItem('pendingOrderId', orderId);
                    window.location.href = data.authorization_url;
                } else {
                    throw new Error("Failed to save order");
                }
            } else {
                toast.error("Failed to initiate payment. Please try again.");
            }
        } catch (error) {
            console.error("Payment process failed:", error);
            toast.error("Failed to process payment. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const verifyTransaction = async (reference) => {
        try {
            const response = await fetch(`https://laststopenterprise.onrender.com/verify-transaction?reference=${reference}`);
            const data = await response.json();

            if (data.success) {
                const pendingOrderId = sessionStorage.getItem('pendingOrderId');
                
                if (pendingOrderId) {
                    await updateOrderStatus(pendingOrderId, "Completed");
                    
                    // Fetch updated orders and update Redux store
                    const { data: orders } = await supabase
                        .from("orders")
                        .select('*')
                        .eq('userId', userId);
                    
                    if (orders) {
                        dispatch(storeOrders(orders));
                    }

                    dispatch(clearCart());
                    sessionStorage.removeItem('pendingOrderId');
                    toast.success("Payment successful and order completed!");
                    navigate("/checkout-success");
                } else {
                    throw new Error("Pending order ID not found");
                }
            } else {
                toast.error("Transaction verification failed.");
            }
        } catch (error) {
            console.error("Error verifying transaction:", error);
            toast.error("Error verifying payment.");
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const { error } = await supabase
                .from("orders")
                .update({
                    orderStatus: newStatus,
                    updatedAt: new Date().toISOString()
                })
                .eq("id", orderId);
            
            if (error) throw error;
        } catch (error) {
            console.error("Error updating order status:", error);
            toast.error("Failed to update order status. Please contact support.");
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

export default CheckoutForm;