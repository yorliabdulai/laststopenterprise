import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	isUserLoggedIn: false,
	email: null,
	userName: null,
	userId: null,
	profileImage: null,
};

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setActiveUser: (state, action) => {
			const { email, userName, userId, profileImage } = action.payload;
			state.isUserLoggedIn = true;
			state.email = email;
			state.userName = userName;
			state.userId = userId;
			state.profileImage = profileImage;
		},
		removeActiveUser: (state) => {
			state.isUserLoggedIn = false;
			state.email = null;
			state.userName = null;
			state.userId = null;
			state.profileImage = null;
		},
	},
});

export const selectAuthSlice = (store) => store.auth;

export const { setActiveUser, removeActiveUser } = authSlice.actions;

export default authSlice.reducer;
