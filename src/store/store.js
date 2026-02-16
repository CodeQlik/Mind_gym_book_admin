import { configureStore } from "@reduxjs/toolkit";
import appReducer from "./slices/appSlice";
import bookReducer from "./slices/bookSlice";
import userReducer from "./slices/userSlice";
import authReducer from "./slices/authSlice";
import categoryReducer from "./slices/categorySlice";

export const store = configureStore({
  reducer: {
    app: appReducer,
    books: bookReducer,
    users: userReducer,
    auth: authReducer,
    categories: categoryReducer,
  },
});

export default store;
