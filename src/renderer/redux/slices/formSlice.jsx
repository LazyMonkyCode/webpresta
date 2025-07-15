import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    formName:null,
    inputs:{},
    errors:null,
    loading:false,
    success:false,
    messages:null,
                
}




const formSlice = createSlice({
    name: 'form',
    initialState,
    reducers: {
        resetForm: (state,action) => {
            state.formName =action.payload || null; // Reset formName to null or a specific value
            state.inputs = {};
            state.errors = null;
            state.loading = false;
            state.success = false;
            state.messages = null;
        },
        setInputs: (state, action) => {
            state.inputs = action.payload;
        },
        changeValue: (state, action) => {

           // console.log(action.payload)
            if (state.inputs) {
              //  console.log("Asdasdhakjsdasd")
                const newInputs = { ...state.inputs };
                newInputs[action.payload.key] = action.payload.value;
                state.inputs = newInputs;
            }
        },
        setFormName: (state, action) => {
            state.formName = action.payload;
        },
        setErrors: (state, action) => {
            state.errors = action.payload;
        },
        
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setSuccess: (state, action) => {
            state.success = action.payload;
        },
        setMessages: (state, action) => {
            state.messages = action.payload;
        },

       
    },
})

    export const { setInputs, setErrors, setLoading, setSuccess, setMessages,changeValue,setFormName,resetForm } = formSlice.actions;
    export default formSlice.reducer;