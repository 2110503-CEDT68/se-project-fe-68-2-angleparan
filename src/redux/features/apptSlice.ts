import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AppointmentItem } from "../../../interface"

type apptState = {
    appointmentItems: AppointmentItem[],
    error: string | null
}

const initialState: apptState = {
    appointmentItems: [],
    error: null
}

export const apptSlice = createSlice({
    name: "appt",
    initialState,
    reducers: {
        addappt: (state, action: PayloadAction<AppointmentItem>) => {
            if (!state.appointmentItems) {
                state.appointmentItems = [];
            }

            const existingIndex = state.appointmentItems.findIndex(
                obj => obj.dentist === action.payload.dentist
                    && obj.apptDate === action.payload.apptDate
            )
            if (existingIndex >= 0) {
                state.error = "Unable to make an appointment, Other user already appt at this time"
                return
            } else {
                state.appointmentItems.push(action.payload)
                state.error = null
            }
        },
        removeappt: (state, action: PayloadAction<AppointmentItem>) => {
            if (!state.appointmentItems) {
                state.appointmentItems = [];
                return
            }
            const remainItems = state.appointmentItems.filter(obj => {
                return (obj._id !== action.payload._id)
            })
            state.appointmentItems = remainItems
        }
    }
})

export const { addappt, removeappt } = apptSlice.actions
export default apptSlice.reducer