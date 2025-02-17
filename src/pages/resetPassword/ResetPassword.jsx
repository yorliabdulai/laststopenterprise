import React, { useState } from "react";
import { toast } from "react-toastify";
import  supabase  from "../../supabase/supabase"; // Ensure correct import
import Loader from "../../components/loader/Loader";

const ResetPassword = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [err, setErr] = useState("");

    const resetPasswordHandler = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErr("");
        
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password`, // Adjust as needed
        });
        
        if (error) {
            setErr(error.message);
            toast.error(error.message);
        } else {
            toast.info("Check email for reset link");
            setErr("Check your Registered email address for reset link *(Check Spam)*");
            setEmail("");
        }
        
        setIsLoading(false);
    };

    return (
        <>
            {isLoading && <Loader />}

            <main className="w-full page flex items-center justify-center">
                <div className="w-96 h-auto shadow-xl rounded-md px-4 py-6">
                    <h1 className="text-2xl font-bold text-center ">RESET PASSWORD</h1>
                    {err && (
                        <h1 className="alert shadow-lg text-gray-700 border-l-4 border-error my-4">
                            {err}
                        </h1>
                    )}
                    <div className="alert shadow-lg text-gray-700 border-l-4 border-primary my-4">
                        Please enter your registered Email address. You will receive an email
                        message with instructions on how to reset your password.
                    </div>

                    <form className="form-control" onSubmit={resetPasswordHandler}>
                        <label className="label-text font-bold mb-2 block">Email Address</label>
                        <input
                            type="email"
                            className="input input-bordered input-secondary w-full"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button type="submit" className="btn mt-3" disabled={isLoading}>
                            {isLoading ? "Processing..." : "Get new Password"}
                        </button>
                    </form>
                </div>
            </main>
        </>
    );
};

export default ResetPassword;
