

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
 import formReducer from './slices/formSlice'; // Uncomment if you have a formSlice 
 import paginationReducer from './slices/pagination'  
 import modalReducer from './slices/modalSlice' 
 import appReducer from './slices/appSlice'; // Import the appSlice   
import clientsReducer from './slices/clientsSlice'; // Import the clientsSlice
import loansReducer from './slices/loansSlice'
import paymentsReducer from './slices/paymentsSlice'
import selectionReducer from './slices/selectionSlice'

const store = configureStore({
    reducer: {
        auth: authReducer,
        clients:clientsReducer, // Add the clientsSlice to the store
        form: formReducer, // Uncomment if you have a formSlice
        pagination:paginationReducer,
        modal:modalReducer,
        app: appReducer, // Add the appSlice to the store
        loans:loansReducer,
        payments:paymentsReducer,
        selection:selectionReducer
    },
});

export default store;   