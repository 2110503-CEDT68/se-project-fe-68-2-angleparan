import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppointmentItem } from "../../../interface";

type AppointmentState = {
  apptItems: AppointmentItem[];
};

const initialState: AppointmentState = { apptItems: [] };

export const apptSlice = createSlice({
  name: "appointment",
  initialState,
  reducers: {
    addAppointment: (state, action: PayloadAction<AppointmentItem>) => {
      const index = state.apptItems.findIndex(
        (item) =>
          item.dentist === action.payload.dentist &&
          item.apptDate === action.payload.apptDate
      );

      if (index !== -1) {
        state.apptItems[index] = action.payload;
      } else {
        state.apptItems.push(action.payload);
      }
    },

    removeAppointment: (state, action: PayloadAction<AppointmentItem>) => {
      const remainItems = state.apptItems.filter((item) => {
        return !(
          item.dentist === action.payload.dentist &&
          item.apptDate === action.payload.apptDate &&
          item.user === action.payload.user
        );
      });

      state.apptItems = remainItems;
    },
  },
});

export const { addAppointment, removeAppointment } = apptSlice.actions;
export default apptSlice.reducer;
