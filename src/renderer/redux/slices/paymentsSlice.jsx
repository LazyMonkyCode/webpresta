
import { createSlice } from '@reduxjs/toolkit';



const initialState = {
    payments: [],
    selectedPayment: null,
    selectedPayments: [],
    isLoading: false,
    error: null,
};

import { setClientsStats } from './clientsSlice';

import { setLoans } from './loansSlice';
import PaymentsService from '../../services/PaymentsService';
import { closeModal } from './modalSlice';
import { nowLocale } from '../../common/funcs';

/* 
export const payPayment= createAsyncThunk(
  'app/pay-payment',
  async (userData, { dispatch }) => {
    const fetchedSettings = {
      theme: 'dark',
      language: 'es',
    };

    dispatch(setUser(userData));
    dispatch(setSettings(fetchedSettings));
  }
);
 */

const paymentsSlice = createSlice({
    name: 'payments',
    initialState,
    reducers: {
        setPayments: (state, action) => {
            state.payments = action.payload;
        },
        setSelectedpayments: (state, action) => {
            state.selectedPayments = action.payload;
        },
        setSelectedPayment: (state, action) => {
            console.log(action.payload, "selected payment")
            state.selectedPayment = action.payload;
        },
        setIsLoading: (state, action) => {
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
                state.payments = action.payload.payments;
                state.paginationData = action.payload.paginationData;
            })
            .addCase('clients/fetchClients/rejected', (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            });
    },
});




export const  {
    setPayments,
    setSelectedpayments,
    setLoading,
    setError,
    setSelectedPayment,
} = paymentsSlice.actions;




export const payPayment = ({isIncomplete,paid_amount,payment_method}) => async (dispatch, getState) => {

    const  {
    setPayments,
    setError,
    setIsLoading
    } = paymentsSlice.actions;

     const {payments,loans,clients} = getState();

    if (isIncomplete && paid_amount <= 0) return dispatch(setError({ nickname: "Este valo no puede ser menor a 0" }))
    dispatch(setError({ qamount: "" }))


    dispatch(setIsLoading(true))

    try {
        const service = new PaymentsService()

        window.electron.messages.onMessage((title, message, data) => {
            console.log(title, message, data)
        })

        
        const updateData = {
            paid_amount: isIncomplete ? paid_amount : payments.selectedPayment.total_amount,
            paid_date: nowLocale(),
            status: isIncomplete ? "incomplete" : "paid",
            left_amount: !isIncomplete ? 0 : payments.selectedPayment.total_amount - paid_amount,
            payment_method: payment_method,
            loan_id: payments.selectedPayment.loan_id
        }

        console.log(updateData,"update data",payments.selectedPayment.total_amount,paid_amount)
        const result = await service.payPayment(payments.selectedPayment.id, updateData)
        console.log(result)
        if(!result) dispatch(setError(result))

       if (result) {
            //console.log(result,"rallsidhq,3ebkas  sdnwedijs")
            delete updateData.paid_date



          /*   setTimeout(() => {  */
 
               dispatch(setPayments(payments.payments.map((p) => {
                    if (p.id == payments.selectedPayment.id) {
                        return {
                            ...payments.selectedPayment,
                            ...updateData
                        }
                    }
                    return p
                })))

                const paid = isIncomplete ? amount : payments.selectedPayment.total_amount

                dispatch(setClientsStats({
                    left_amount: clients.left_amount - paid,
                    paid_amount: clients.paid_amount + paid
                }))

                dispatch(setLoans(loans.loans.map((l) => {

                    if (payments.selectedPayment.loan_id == l.id) {
                        console.log(updateData,l)
                        return {
                            ...l,
                            paid_amount: l.paid_amount + paid,
                            left_amount: l.left_amount - paid,
                            paid_installments:updateData.status ==='paid' ? (Number(l.paid_installments) + 1 ): l.paid_installments ,
                            status:(Number(l.paid_installments)+1) == l.installments  &&  updateData.status == "paid" ?  "completed" : l.status

                        }
                    }
                })))  
                
                dispatch(closeModal())
                dispatch(setIsLoading(false)) 
          /* }, 1000); */
        } 




    } catch (error) {
        console.log(error)
    }

}

/* export const selectClients = (state) => state.clients.clients;
export const selectSelectedClient = (state) => state.clients.selectedClient;
 */

export default paymentsSlice.reducer;