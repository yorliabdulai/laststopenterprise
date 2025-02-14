import React, { useState } from "react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../loader/Loader";
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase/config";
import { useDispatch } from "react-redux";
import { setActiveUser } from "../../redux/slice/authSlice"; // Assuming you have this action

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        dispatch(setActiveUser({
          email: user.email,
          userName: user.displayName || "User",
          userId: user.uid,
        }));
  
        toast.success("Login Successful");
        setIsLoading(false);
        setIsLoggedIn(true);
        setTimeout(() => {
          document.getElementById("my-modal-4").checked = false;
          navigate("/");
        }, 2000);
      })
      .catch((error) => {
        toast.error(error.message);
        setIsLoading(false);
      });
  };

  const provider = new GoogleAuthProvider();
  const googleSignIn = () => {
    setIsLoading(true);
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        dispatch(setActiveUser({
          email: user.email,
          userName: user.displayName || "User",
          userId: user.uid,
        }));
        toast.success("Login Successful");
        setIsLoading(false);
        setIsLoggedIn(true);
        setTimeout(() => {
          document.getElementById("my-modal-4").checked = false;
          navigate("/");
        }, 2000);
      })
      .catch((error) => {
        toast.error(error.message);
        setIsLoading(false);
      });
  };

  const AllFieldsRequired = Boolean(email) && Boolean(password);

  if (isLoggedIn) {
    return (
      <div className="py-6 w-72 md:w-96">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mx-auto max-w-4xl p-8">
          <h2 className="text-2xl font-bold text-center text-green-600 mb-4">Login Successful!</h2>
          <p className="text-center text-gray-600">You will be redirected to the home page shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading && <Loader />}
      <div className="py-6 ">
        <div className="flex bg-white rounded-lg shadow-lg overflow-hidden mx-auto max-w-4xl">
          <div className="w-full px-8 pt-4 pb-6">
            <p className="text-xl text-gray-600 text-center">Welcome back</p>
            <div className="btn w-full mt-4 gap-2" onClick={googleSignIn}>
              <FcGoogle size={22} />
              Sign in with google
            </div>
            <div className="divider text-xs text-gray-400 uppercase">or login with email</div>
            <form className="form-control" onSubmit={handleSubmit}>
              <div>
                <label className="label-text font-bold mb-2 block">Email Address</label>
                <input
                  className="input input-bordered w-full border-2"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="mt-4 relative">
                <div className="flex justify-between">
                  <label className="label-text font-bold mb-2">Password</label>
                  <Link
                    to="/reset"
                    className="text-xs text-gray-500"
                    onClick={() => (document.getElementById("my-modal-4").checked = false)}
                  >
                    Forget Password?
                  </Link>
                </div>
                <input
                  className="input input-bordered w-full border-2"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span onClick={() => setShowPassword((prev) => !prev)}>
                  {showPassword ? (
                    <AiFillEye className="absolute top-10 right-3 " size={26} color="gray" />
                  ) : (
                    <AiFillEyeInvisible
                      className="absolute top-10 right-3 "
                      size={26}
                      color="gray"
                    />
                  )}
                </span>
              </div>
              <div className="mt-4 w-full flex flex-col items-center justify-center">
                <button type="submit" className="btn w-full" disabled={!AllFieldsRequired}>
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;