import React, { useState } from "react";
import { toast } from "react-toastify";
import Loader from "../loader/Loader";
import { useNavigate } from "react-router-dom";
import supabase from "../../supabase/supabase";

const ChangeOrderStatus = ({ order }) => {
    const orderId = order?.id; // Ensure it gets the ID
    const [status, setStatus] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    console.log("Order Object:", order);
    console.log("Extracted Order ID:", orderId);

    const changeStatus = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!orderId) {
            toast.error("Error: Order ID is missing!");
            setIsLoading(false);
            return;
        }

        const orderDetails = {
            ...(order.userId && { userId: order.userId }),
            email: order.email,
            orderDate: order.orderDate,
            ...(order.orderTime && { orderTime: order.orderTime }),
            orderAmount: order.orderAmount,
            orderStatus: status,
            ...(order.cartItems && { cartItems: order.cartItems }),
            shippingAddress: order.shippingAddress,
            createdAt: order.createdAt,
            editedAt: new Date().toISOString(),
        };

        try {
            const { error } = await supabase
                .from("orders")
                .update(orderDetails)
                .eq("id", orderId); // Change "id" if your Supabase uses a different field name

            if (error) throw error;

            toast.success(`Order status changed to ${status}`);
            navigate("/admin/orders");
        } catch (error) {
            console.error("Supabase Error:", error);
            toast.error(`Update failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {isLoading && <Loader />}
            <div className="w-full md:w-96 p-2 rounded-sm shadow-lg">
                <h1 className="text-2xl">Update Order Status</h1>
                <form onSubmit={changeStatus} className="form-control">
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="select select-secondary w-full max-w-xs"
                    >
                        <option disabled>--Status---</option>
                        <option value="orderPlaced">Order Placed</option>
                        <option value="Processing...">Processing...</option>
                        <option value="Item(s) Shipped">Item(s) Shipped</option>
                        <option value="Item(s) Delivered">Item(s) Delivered</option>
                    </select>
                    <button type="submit" className="btn btn-primary-content btn-sm mt-2">
                        Update status
                    </button>
                </form>
            </div>
        </>
    );
};

export default ChangeOrderStatus;
