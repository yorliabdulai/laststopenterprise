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

        if (!status) {
            toast.error("Please select a status before updating.");
            setIsLoading(false);
            return;
        }

        console.log("Updating order status to:", status);

        try {
            const { error } = await supabase
                .from("orders")
                .update({ orderStatus: status, editedAt: new Date().toISOString() })
                .eq("id", orderId);

            if (error) throw error;

            console.log(`Order status updated to: ${status}`);

            // Fetch updated order to confirm change
            const { data, error: fetchError } = await supabase
                .from("orders")
                .select("orderStatus")
                .eq("id", orderId)
                .single();

            if (fetchError) throw fetchError;

            console.log("Updated order data:", data);
            if (data?.orderStatus === status) {
                toast.success(`Order status changed to ${status}`);
                navigate("/admin/orders");
            } else {
                toast.warn("Order status update may not have applied. Please refresh.");
            }
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
                        <option disabled value="">--Status---</option>
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
