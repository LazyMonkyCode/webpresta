
import { createSlice } from '@reduxjs/toolkit';



const initialState = {
  loans: [],  
    selectedLoan: null,
    
    isLoading: false,
    error: null,    
};  



const loansSlice = createSlice({
  name: 'loans',    
    initialState,   
    reducers: { 
        setLoans: (state, action) => {

            console.log(action.payload)
            state.loans = action.payload;
        },
        setSelectedLoan: (state, action) => {

            const loan = action.payload

            const {selectedLoan} = state

            console.log(selectedLoan,loan)
            
            state.selectedLoan = selectedLoan ? selectedLoan.id == loan.id ? null : loan : loan
        },
       
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
    /* extraReducers: (builder) => {
        builder
            .addCase('clients/fetchClients/pending', (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase('clients/fetchClients/fulfilled', (state, action) => {
                state.isLoading = false;
                state.clients = action.payload.clients;
                state.paginationData = action.payload.paginationData;
            })
            .addCase('clients/fetchClients/rejected', (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            });
    },  */     
});




export const {
  setLoans,
  setSelectedLoan,
 
  setLoading,
  setError,
} = loansSlice.actions;   


/* export const selectClients = (state) => state.clients.clients;
export const selectSelectedClient = (state) => state.clients.selectedClient;
 */

export default loansSlice.reducer;