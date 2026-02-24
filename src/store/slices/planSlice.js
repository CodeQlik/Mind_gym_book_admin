import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { planApi } from "../../api/planApi";

export const fetchPlans = createAsyncThunk(
  "plans/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await planApi.getAllPlans();
      return Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch plans",
      );
    }
  },
);

export const createPlan = createAsyncThunk(
  "plans/create",
  async (planData, { rejectWithValue }) => {
    try {
      const response = await planApi.createPlan(planData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create plan",
      );
    }
  },
);

export const updatePlan = createAsyncThunk(
  "plans/update",
  async ({ id, planData }, { rejectWithValue }) => {
    try {
      const response = await planApi.updatePlan(id, planData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update plan",
      );
    }
  },
);

export const deletePlan = createAsyncThunk(
  "plans/delete",
  async (id, { rejectWithValue }) => {
    try {
      await planApi.deletePlan(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete plan",
      );
    }
  },
);

export const togglePlanStatus = createAsyncThunk(
  "plans/toggleStatus",
  async (id, { rejectWithValue }) => {
    try {
      const response = await planApi.togglePlanStatus(id);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to toggle status",
      );
    }
  },
);

const initialState = {
  plans: [],
  loading: false,
  error: null,
};

const planSlice = createSlice({
  name: "plans",
  initialState,
  reducers: {
    clearPlanError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Plans
      .addCase(fetchPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Plan
      .addCase(createPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPlan.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.plans.unshift(action.payload);
        }
      })
      .addCase(createPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Plan
      .addCase(updatePlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePlan.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.plans.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.plans[index] = action.payload;
        }
      })
      .addCase(updatePlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Plan
      .addCase(deletePlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePlan.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = state.plans.filter((p) => p.id !== action.payload);
      })
      .addCase(deletePlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle Status
      .addCase(togglePlanStatus.fulfilled, (state, action) => {
        const index = state.plans.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.plans[index] = action.payload.data;
        }
      });
  },
});

export const { clearPlanError } = planSlice.actions;
export default planSlice.reducer;
