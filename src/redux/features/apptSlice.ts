// import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { AppointmentItem } from "../../../interface";

// type AppointmentState = {
//   apptItems: AppointmentItem[];
// };

// const initialState: AppointmentState = { apptItems: [] };

// export const apptSlice = createSlice({
//   name: "appointment",
//   initialState,
//   reducers: {
//     addAppointment: (state, action: PayloadAction<AppointmentItem>) => {
//       const index = state.apptItems.findIndex(
//         (item) =>
//           item.dentist === action.payload.dentist &&
//           item.apptDate === action.payload.apptDate
//       );

//       if (index !== -1) {
//         state.apptItems[index] = action.payload;
//       } else {
//         state.apptItems.push(action.payload);
//       }
//     },

//     removeAppointment: (state, action: PayloadAction<AppointmentItem>) => {
//       const remainItems = state.apptItems.filter((item) => {
//         return !(
//           item.dentist === action.payload.dentist &&
//           item.apptDate === action.payload.apptDate &&
//           item.user === action.payload.user
//         );
//       });

//       state.apptItems = remainItems;
//     },
//   },
// });

// export const { addAppointment, removeAppointment } = apptSlice.actions;
// export default apptSlice.reducer;


import { createSlice,PayloadAction } from "@reduxjs/toolkit"
import { AppointmentItem } from "../../../interface"


type apptState ={
    appointmentItems : AppointmentItem[],
    error: string | null
}

const initialState:apptState = { 
    appointmentItems:[],
    error: null
}

export const apptSlice = createSlice({
    name: "appt",
    initialState,
    reducers:{
        addappt:(state,action:PayloadAction<AppointmentItem>)=>{
            const existingIndex = state.appointmentItems.findIndex(
                obj => obj.dentist === action.payload.dentist 
                    && obj.apptDate === action.payload.apptDate
            )
            if (existingIndex >= 0) {
                state.error = "Unable to make an appointment, Other user already appt at this time" //มีคนจองแล้ว
                return
            } else {
                state.appointmentItems.push(action.payload)  // เพิ่มใหม่
                state.error = null
            }
        },
        removeappt:(state,action:PayloadAction<AppointmentItem>)=>{
            const remainItems = state.appointmentItems.filter(obj =>{
                return ((obj._id !== action.payload._id))
            })
            state.appointmentItems = remainItems
        }
    }
})

export const {addappt,removeappt} = apptSlice.actions
export default apptSlice.reducer