
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeModal, changeName } from '../../redux/slices/modalSlice';
import { Modal } from '../ui/modal';
import Label from '../../form/Label';
import Input from '../../form/input/InputField';
import Button from '../ui/button/Button';
import Switch from '../../form/switch/Switch';
import Radio from '../../form/input/Radio';
import PaymentsService from '../../services/PaymentsService';
import { setPayments } from '../../redux/slices/paymentsSlice';
import { setClientsStats } from '../../redux/slices/clientsSlice';
import Spinner from '../Spinner';
import { toast } from 'react-toastify';
import { setLoans } from '../../redux/slices/loansSlice';

const PayPaymentModal = ({ payment_amount=0 }) => {

    const [isIncomplete, setIsIncomplete] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState("cash")

        const payments = useSelector(state=>state.payments)
                const loans= useSelector(state=>state.loans)

            const error = payments.error
                const clients = useSelector(state=>state.clients)
        /* const [isLoading, setIsLoading] = useState(false ) */

        const [amount, setAmount] = useState(0 )
       
    const dispatch = useDispatch()
    useEffect(() => {


       // setAmount(payments.selectedPayment?.total_amount)

        return () => {

        }
    }, [amount])

    function compareDates(){

        const p_date = payments.selectedPayment?.payment_date 
        
        const now = new Date()
        const paid_date = new Date(now.toString())
        const payment_date = new Date(p_date)
        if(
            paid_date.getDate() === payment_date.getDate()
             && payment_date.getMonth() ==  paid_date.getMonth()
             &&   paid_date.getFullYear() ==  payment_date.getFullYear() 
        )return  <p className='text-green-500 text-xs'>Pagando Cuota en fecha </p> 
        return  paid_date.getTime() < payment_date.getTime() ? 
         <p className='text-green-500 text-xs'> Pagando Cuota por anticipado a la fecha de vencimineto del pago </p> 
        : <p className='text-red-500  text-xs'>Pagando cuota con atraso a la fecha de vencimiento del pago</p> 
        
    }

    return (<Modal name={"PAY_PAYMENT_MODAL"} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
            <div className="px-2 pr-14">
                <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                    Pagar Cuota
                </h4>
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                    
                </p>
            </div>
            <form className="flex flex-col">
                <div className="custom-scrollbar  overflow-y-auto px-2 pb-3">
                    <div className='flex flex-col gap-4'>
                            <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  {
                    compareDates()
                  }
                </h5>
                        <div className='flex gap-4'>

                            <div className='flex justify-between w-1/2  items-center '>
                                <Label>
                                    Pago Completo
                                </Label>
                                <Switch onChange={() => {
                                    setAmount(payments.selectedPayment.total_amount)
                                    setIsIncomplete(!isIncomplete)
                                }} defaultChecked={true}></Switch>
                            </div >
                            <div className='w-1/2'>
                                {
                                    isIncomplete && (
                                        <>
                                            
                                            <Input
                                            error={error?.amount ? true:false}
                                            placeholder={"ingresa el monto pagado "} onChange={(e)=>{
                                                
                                                console.log(payments.selectedPayment.total_amount)
                                                if(e.target.value<= payments.selectedPayment.total_amount && e.target.value >0){
                                                    setAmount(e.target.value)
                                                }
                                                

                                            }} value={amount} type='number' />
                                            {
                                                error?.amount && (<span className='text-red-500'>{error?.amount}</span>)
                                            }
                                        </>

                                    )
                                }
                            </div>
                        </div>


                        <div className=''>
                            <Label>Metodo de pago</Label>
                            <div className='flex flex-col gap-3'>
                                 <Radio checked={paymentMethod =="cash"} onChange={(e)=>setPaymentMethod(e)} value={"cash"} label={"efectivo"}></Radio>
                            <Radio checked={paymentMethod =="transfer"} onChange={(e)=>setPaymentMethod(e)} value={"transfer"} label={"transferencia"}></Radio>
                            </div>
                           
                        </div>
                       
                    </div>
                </div>
                <div className="flex justify-between items-center gap-3 px-2 mt-6 lg:justify-end">
                    <Button size="sm" variant="outline" onClick={() => dispatch(closeModal())}>
                        Close
                    </Button>
                    <Button size="sm" onClick={async ()=>{

                       dispatch(payPayment({
                        isIncomplete,
                        paid_amount:Number(amount),
                        payment_method:paymentMethod
                       }))
                       toast.success("Se ha elimando un pago")
                    }}>
                        {(payments.isLoading ? (<Spinner></Spinner>):"Pagar")}
                    </Button>
                </div>
            </form>
        </div>
    </Modal>)
}


import { payPayment } from '../../redux/slices/paymentsSlice';


export default PayPaymentModal;