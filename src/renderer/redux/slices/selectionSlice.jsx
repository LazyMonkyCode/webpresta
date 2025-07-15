

import { createSlice } from "@reduxjs/toolkit";



const initialState = {
    
    items:[]
}


const selectionSlice = createSlice({
    name: 'selection',
    initialState,
    reducers: {
        addItem:(state,action)=>{

            state.items.push(action.payload)
        },
        removeItem:(state,action)=>{

            state.items = state.items.filter((item)=>action.payload!=item.id)
        }

    },
})



    export const {  addItem,removeItem   } = selectionSlice.actions;
export default  selectionSlice.reducer;