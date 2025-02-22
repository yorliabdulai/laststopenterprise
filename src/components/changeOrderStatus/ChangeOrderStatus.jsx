import React, { useState } from "react";
import { toast } from "react-toastify";
import Loader from "../loader/Loader";
import { useNavigate } from "react-router-dom";
import supabase from "../../supabase/supabase";

const ChangeOrderStatus = ({ order, onUpdate }) => {
    const orderId = order?.id;
    const [status, setStatus] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

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
    
        try {
            // Ensure the order exists
            const { data: existingOrder, error: fetchError } = await supabase
                .from("orders")
                .select("id")
                .eq("id", String(orderId))
                .single();
    
            if (fetchError || !existingOrder) {
                toast.error("Order not found in database!");
                setIsLoading(false);
                return;
            }
    
            // Update the order status
            const { data, error } = await supabase
                .from("orders")
                .update({ "orderStatus": status, "editedAt": new Date().toISOString() })
                .eq("id", String(orderId))
                .select("id, orderStatus");
    
            if (error) {
                console.error("❌ Supabase Error:", error);
                toast.error(`Update failed: ${error.message || "Unknown error"}`);
                return;
            }
    
            toast.success(`✅ Order status changed to ${status}`);
            if (onUpdate) onUpdate(); // Trigger rerender if onUpdate callback is passed
        } catch (error) {
            console.error("🚨 Network or Fetch Error:", error);
            toast.error(`Network error: ${error.message}`);
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
                    <button type="submit" className="btn btn-primary btn-sm mt-2">
                        Update Status
                    </button>
                </form>
            </div>
        </>
    );
};

export default ChangeOrderStatus;
