







import React,{useState} from "react"

import {MoreHorizontal as MoreDotIcon,CreditCard, Calendar1Icon}from 'lucide-react'

import {Dropdown} from '../ui/dropdown/Dropdown'
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import Badge from "../ui/badge/Badge";
import { useSelector,useDispatch } from "react-redux";
import {addItem,removeItem}  from '../../redux/slices/selectionSlice'
import { formatAmount } from "../../common/funcs";
import { FaCreditCard, FaSackDollar } from "react-icons/fa6";
import { openModal } from "../../redux/slices/modalSlice";
import { setSelectedPayment } from "../../redux/slices/paymentsSlice";
import { FaCalendarAlt } from "react-icons/fa";



const PaymentListItem=({payment})=>{
  const [isOpen, setIsOpen] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  //console.log(payment)
  const dispatch = useDispatch()

  const selectedItems = useSelector(state=>state.selection)

 function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  
  function closeDropdown() {
    setIsOpen(false);
  }


  function setPaymentStatus(status){

    switch (status) {
      case "pending":
        return <Badge color="primary" variant="solid">pendiente</Badge>
        break;
    case "paid":
        return <Badge color="success" variant="solid">pagado</Badge>
        break;
    case "expired":
        return <Badge color="error" variant="solid">expirado</Badge>
        break;
    case "incomplete":
        return <Badge color="warning" variant="solid">incompleto</Badge>
        break;
    
      default:
        break;
    }

    
  }

  function selectItem(e){


    e.stopPropagation();

  const isCtrlPressed = e.ctrlKey || e.metaKey; // Mac usa metaKey

  if (isCtrlPressed) {
    console.log(payment,"selected payment")
    const isSelected = selectedItems.items.some(item => item.id === payment.id);
    
    if(isSelected){
      console.log("ya esta seleccionado")
          setIsSelected(false)

      dispatch(removeItem(payment.id))
    }else{
          setIsSelected(true)

       dispatch(addItem(payment));
    }
    // agregar a la selección múltiple

    console.log(selectedItems)
  } 

  }
    return (<div
    
    onClick={selectItem}
    
     
    className={`w-full mb-3 rounded-xl flex gap flex-row ${
      /* payment.status == "pending"  ? "bg-blue-500 text-white" : 
      payment.status == "paid" ? "bg-green-500 text-white  ": 
      payment.status == "expired" ? "bg-red-500 text-white" : "bg-yellow-400 text-white" */
      ""
    }  
    ${isSelected ? 'ring-4 ring-yellow-400 scale-[1.02] shadow-lg transition-all duration-200' : ''} // 👈 clase visual para selección
    justify-between items-center p-4 border border-gray-300 text-gray-500  shadow-md`}>

        <span className={`rounded-full ${
          /* payment.status == "pending"  ? "bg-blue-700 text-white" : 
      payment.status == "paid" ? "bg-green-400 text-white"  : 
      payment.status == "expired" ? "bg-red-400 text-white" : "bg-yellow-400 text-white" */
      "bg-blue-500 text-white"
        } p-2`}>
            <FaCreditCard></FaCreditCard>
        </span>
        <span className="">
            {payment.label}
        </span>
       
 
           
             <span className="flex gap-1 justify-center items-center bg-gray-400 text-gray-50 text-xs rounded-xl py-1 px-2">
           
              <FaSackDollar></FaSackDollar>
              {payment.loan_label}
        </span>
       
       
          <span className="flex gap-1 justify-center items-center bg-red-400 text-gray-50 text-xs rounded-xl py-1 px-2">
           
             <FaCalendarAlt></FaCalendarAlt>
              {payment.payment_date}
        </span>
       

        <ItemLabel>
        <span className="">
          {setPaymentStatus(payment.status)}
        </span>
        </ItemLabel>
        
         <ItemLabel>
        <span className="font-bold bg-white text-gray-800 rounded-full p-1">
            ${formatAmount(payment.total_amount)}
        </span>
        </ItemLabel>
        

        
        <span className="">
              <div className="relative inline-block">
          <button className="dropdown-toggle" onClick={toggleDropdown}>
            <MoreDotIcon className=" hover:text-gray-700 dark:hover:text-gray-300 size-6" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-40 p-2"
            position="bot-right"
          >
             {
              payment.status!="paid" && (<DropdownItem
              
              onClick={()=>{
                
                console.log(payment)
                dispatch(setSelectedPayment(payment))
                dispatch(openModal('PAY_PAYMENT_MODAL'))
              }}
             /*  onItemClick={closeDropdown} */
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              pagar
            </DropdownItem>)
             }
             <DropdownItem
              onClick={()=>dispatch(openModal('PAYMENT_EDIT_MODAL'))}
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              editar
            </DropdownItem>
            <DropdownItem
             onClick={()=>dispatch(openModal('PAYMENT_SHOW_MODAL'))}
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              ver
            </DropdownItem>
            <DropdownItem
             onClick={()=>dispatch(openModal('PAYMENT_DELETE_MODAL'))}
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              eliminar
            </DropdownItem>
          </Dropdown>
        </div>
        </span>
    </div>)
}


function  ItemLabel({children}){

  return ( <span className="flex justify-center w-1/6">
           
              {children}
        </span>)
}

export default PaymentListItem