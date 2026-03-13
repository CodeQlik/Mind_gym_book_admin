import { configureStore } from "@reduxjs/toolkit";
import appReducer from "./slices/appSlice";
import bookReducer from "./slices/bookSlice";
import userReducer from "./slices/userSlice";
import authReducer from "./slices/authSlice";
import categoryReducer from "./slices/categorySlice";
import notificationReducer from "./slices/notificationSlice";

import planReducer from "./slices/planSlice";
import subscriptionReducer from "./slices/subscriptionSlice";
import paymentReducer from "./slices/paymentSlice";
import orderReducer from "./slices/orderSlice";
import marketReducer from "./slices/marketSlice";
import analyticsReducer from "./slices/analyticsSlice";
import couponReducer from "./slices/couponSlice";
import supportReducer from "./slices/supportSlice";
import audiobookReducer from "./slices/audiobookSlice";

export const store = configureStore({
  reducer: {
    app: appReducer,
    books: bookReducer,
    users: userReducer,
    auth: authReducer,
    categories: categoryReducer,
    notifications: notificationReducer,
    plans: planReducer,
    subscriptions: subscriptionReducer,
    payments: paymentReducer,
    orders: orderReducer,
    marketplace: marketReducer,
    analytics: analyticsReducer,
    coupons: couponReducer,
    support: supportReducer,
    audiobooks: audiobookReducer,
  },
});

export default store;
