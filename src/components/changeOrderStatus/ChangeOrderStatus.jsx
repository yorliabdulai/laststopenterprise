import React, { useState } from "react";
import { toast } from "react-toastify";
import Loader from "../loader/Loader";
import { useNavigate } from "react-router-dom";
import supabase from "../../supabase/supabase";


const ChangeOrderStatus = ({ order}) => {
    const orderId = order?.id;
    const [status, setStatus] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const changeStatus = async (e) => {
        e.preventDefault();
        setIsLoading(true);

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
                .eq("id", orderId);
            
            if (error) throw error;
            toast.success(`Order status changed to ${status}`);
            navigate("/admin/orders");
        } catch (error) {
            toast.error(error.message);
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
