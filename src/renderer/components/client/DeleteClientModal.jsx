
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
import Client from '../../services/local/Client';
import { setClient } from '../../redux/slices/clientsSlice';
import { useNavigate } from 'react-router';
const DeleteClientModal = ({  onClose, onSave }) => {

    const loans = useSelector(state=>state.loans)
        const client = useSelector(state=>state.clients.client)
        const navigate = useNavigate()

   const dispatch = useDispatch()
     useEffect(() => {
       
 
    
     
       return () => {
         
       }
     }, [])

     async function deleteClient(e){

            if(!client) return 

            dispatch(setLoading(true))
            const service = new Client({id:client.id})


            const result =await service.delete()

            console.log(result,"asdasdasd")
            dispatch(setClient(null))
            setTimeout(()=>{

                if(result) toast.success("Se ha eliminado el Cliente !")
                else toast.error("error al intentar borrar el Cliente")
                dispatch(closeModal())
                dispatch(setLoading(false))
                navigate("/clients")
            },1000)
       
     }
  

    return (<Modal isFullscreen={false} name={"CLIENT_DELETE"} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
           <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Eliminar Cliente
            </h4>
            {/* <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p> */}
          </div> 

            <Alert variant={"error"} message={"Estas apunto de borrar el cliente "+client.nickname+" deseas proseguir?"} title={"advertencia"}></Alert>
            <div className='flex justify-between mt-8'>
                <Button
                onClick={()=>dispatch(closeModal())}
                variant='outline' >cerrar</Button>
            <Button
            
            onClick={deleteClient}
            variant='danger' >
                {
                    loans.isLoading ? (<Spinner></Spinner>) : "Eliminar"
                }
            </Button>
            </div>
        </div>
      </Modal> )
}



export default DeleteClientModal;