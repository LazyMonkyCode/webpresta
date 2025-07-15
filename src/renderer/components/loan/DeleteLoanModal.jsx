
import React,{useEffect} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeModal,changeName } from '../../redux/slices/modalSlice';
import { Modal } from '../ui/modal';
import Label from '../../form/Label';
import Input from '../../form/input/InputField';
import Button from '../ui/button/Button';
import Alert from '../ui/alert/Alert';
import LoansService from '../../services/LoansService';
import Loan from '../../services/local/Loan';
import { toast } from 'react-toastify';
import { setLoading, setLoans } from '../../redux/slices/loansSlice';
import Spinner from '../Spinner';
import { setClientsStats } from '../../redux/slices/clientsSlice';
const DeleteLoanModal = ({ loan, onClose, onSave }) => {

    const loans = useSelector(state=>state.loans)
        const clients = useSelector(state=>state.clients)

   const dispatch = useDispatch()
     useEffect(() => {
       
 
    
     
       return () => {
         
       }
     }, [])

     async function deleteLoan(e){

        if(loans.selectedLoan){

            dispatch(setLoading(true))
            const service = new Loan({id:loans.selectedLoan.id})


            const result =await service.delete()

            console.log(result,"asdasdasd")
            
            setTimeout(()=>{

                if(result) {

                  const leftAmount = clients.left_amount >0 ? clients.left_amount-(loans.selectedLoan.amount+loans.selectedLoan.interest_amount)  : 0



                  dispatch(setLoans(loans.loans.filter((l)=>l.id!=loans.selectedLoan.id)))
                  dispatch(setClientsStats({
                    total_loans: clients.total_loans >0 ? clients.total_loans-1 : 0,
                    total_lend:clients.total_lend >0 ? clients.total_lend-loans.selectedLoan.amount : 0, 
                    left_amount:clients.left_amount >0 ? leftAmount : 0,
                    paid_amount:0,
                  }))
                  toast.success("Se ha eliminado el Prestamo !")}
                else toast.error("error al intentar borrar el prestamo")
                dispatch(closeModal())
                dispatch(setLoading(false))
            },1000)
        }
     }
  

    return (<Modal isFullscreen={false} name={"LOAN_DELETE"} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
           <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Eliminar Prestamo
            </h4>
            {/* <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p> */}
          </div> 

            <Alert variant={"error"} message={"Estas apunto de borrar un prestamo deseas proseguir?"} title={"advertencia"}></Alert>
            <div className='flex justify-between mt-8'>
                <Button
                onClick={()=>dispatch(closeModal())}
                variant='outline' >cerrar</Button>
            <Button
            
            onClick={deleteLoan}
            variant='danger' >
                {
                    loans.isLoading ? (<Spinner></Spinner>) : "Eliminar"
                }
            </Button>
            </div>
        </div>
      </Modal> )
}



export default DeleteLoanModal;