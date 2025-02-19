import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

const initialState = {
   cartItems: localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : [],
   totalQuantity: 0,
   totalAmount: 0,
};

const cartSlice = createSlice({
   name: "cart",
   initialState,
   reducers: {
      addToCart: (state, action) => {
         const itemIndex = state.cartItems.findIndex((item) => item.id === action.payload.id);

         if (itemIndex >= 0) {
            // If item exists, increase quantity
            state.cartItems[itemIndex].qty += 1;
            toast.info(`${action.payload.name} quantity increased`);
         } else {
            // New item - ensure name and imageURL are included
            const tempProduct = {
               id: action.payload.id,
               price: action.payload.price,
               qty: 1,
            };
            state.cartItems.push(tempProduct);
            toast.info(`${action.payload.name} added to cart`);
         }

         localStorage.setItem("cart", JSON.stringify(state.cartItems));
      },

      decreaseCart: (state, action) => {
         const itemIndex = state.cartItems.findIndex((item) => item.id === action.payload.id);

         if (itemIndex >= 0) {
            if (state.cartItems[itemIndex].qty > 1) {
               state.cartItems[itemIndex].qty -= 1;
               toast.error(`${action.payload.name} quantity decreased`);
            } else {
               // Remove item if quantity is 1
               state.cartItems = state.cartItems.filter((item) => item.id !== action.payload.id);
               toast.error(`${action.payload.name} removed from cart`);
            }
         }

         localStorage.setItem("cart", JSON.stringify(state.cartItems));
      },

      removeCartItem: (state, action) => {
         state.cartItems = state.cartItems.filter((item) => item.id !== action.payload.id);
         localStorage.setItem("cart", JSON.stringify(state.cartItems));
         toast.error(`${action.payload.name} removed from cart`);
      },

      clearCart: (state) => {
         state.cartItems = [];
         localStorage.setItem("cart", JSON.stringify(state.cartItems));
         toast.info(`All items removed from cart`);
      },

      calculateSubtotal: (state) => {
         let totalAmount = 0;
         state.cartItems.forEach((item) => {
            totalAmount += item.price * item.qty;
         });
         state.totalAmount = totalAmount;
      },

      calculateTotalQuantity: (state) => {
         let totalQty = 0;
         state.cartItems.forEach((item) => {
            totalQty += item.qty;
         });
         state.totalQuantity = totalQty;
      },
   },
});

export const {
   addToCart,
   decreaseCart,
   removeCartItem,
   clearCart,
   calculateSubtotal,
   calculateTotalQuantity,
} = cartSlice.actions;

export default cartSlice.reducer;
