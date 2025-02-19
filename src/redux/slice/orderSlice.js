import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	orderHistory: [],
	totalAmount: null,
	orderedProducts: [],
};

const orderSlice = createSlice({
	name: "orders",
	initialState,
	reducers: {
		storeOrders: (state, action) => {
			state.orderHistory = action.payload.map(order => ({
				...order,
				amount: order.amount , 
			}));
		},
		totalOrderAmount: (state, action) => {
			const newArray = [];
			state.orderHistory.map((item) => {
				const { amount } = item;
				newArray.push(amount);
			});
			const total = newArray.reduce((total, curr) => total + curr, 0);
			state.totalAmount = total;
		},
		addOrderedProducts(state, action) {
      state.orderedProducts = action.payload;
    },
	},
});

export const { storeOrders, totalOrderAmount, addOrderedProducts } = orderSlice.actions;

export default orderSlice.reducer;
