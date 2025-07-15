
import { createSlice } from '@reduxjs/toolkit';



const initialState = {
  clients: [], 
  client:{}, 
    selectedClient: null,
    paginationData: {   
        page: 1,
        totalItems: 0,
        limit: 10,
        },
    monthly_stats:{
        percent_paid:0,
        expected_amount:0,
        paid_amount:0
    },
    
    total_active_loans:0, 
    total_clients:0,
    total_loans:0,
    total_lend:0,
    left_amount:0,
    paid_amount:0,
    net_gains:0,
    brute_gains:0,
    loans_state:{
        pending:0,
        completed:0,
        active:0,
        cancelled:0
    },
    payments_state:{
        pending:0,
        expired:0,
        paid:0,
        incomplete:0
    },
    isLoading: false,
    error: null,    
};  



const clientsSlice = createSlice({
  name: 'clients',    
    initialState,   
    reducers: { 

        setClientsStats(state, action) {
        for (const key in action.payload) {
            if (Object.prototype.hasOwnProperty.call(state, key)) {
            const val = action.payload[key];

            state[key] = val;
            }
        }
        },
        setStats(state, action) {
        for (const key in action.payload) {
            if (Object.prototype.hasOwnProperty.call(state, key)) {
            const val = action.payload[key];

            state[key] = val;
            }
        }
        },

        setClient: (state, action) => {
            state.client=action.payload;
        },
        addClient: (state, action) => {
            state.clients.unshift(action.payload);
        },
        updateClient: (state, action) => { 
            const index = state.clients.findIndex(client => client.id === action.payload.id);
            if (index !== -1) {
                state.clients[index] = action.payload;
            }       
        },
        deleteClient: (state, action) => {
            state.clients = state.clients.filter(client => client.id !== action.payload);
        },
        setClients: (state, action) => {
            state.clients = action.payload;
        },
        setSelectedClient: (state, action) => {
            state.selectedClient = action.payload;
        },
        setPaginationData: (state, action) => {
            state.paginationData = action.payload;
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
    extraReducers: (builder) => {
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
    },      
});




export const {
  setClients,
  setSelectedClient,
  setPaginationData,
  setLoading,
  setError,
  setClientsStats,
addClient,
setClient,
setStats
} = clientsSlice.actions;   


export const selectClients = (state) => state.clients.clients;
export const selectSelectedClient = (state) => state.clients.selectedClient;



export default clientsSlice.reducer;