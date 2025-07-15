import React, { useState, useEffect } from "react";
import Button from "../ui/button/Button";
import Badge from "../ui/badge/Badge";
import PaymentCard from "./PayentsCard";
import PaymentListItem from "./PaymentListItem";
import Pagination from '../Pagination';
import { resetPaginationData } from "../../redux/slices/pagination";
import {
    Filter,
    X,
    ChevronDown,
    CheckCircle,
    AlarmClock,
    Clock,
    AlertCircle
} from 'lucide-react';
import PaymentsFilter from "./PaymentsFilter";
import { useSelector } from "react-redux";

const PaymentsList = ({ client, handleEdit }) => {

    const {payments} = useSelector(state=>state.payments)
    
   /*  useEffect(() => {

        const fetchPayments = async (params) => {

        }

        fetchPayments()
        return () => {

        }


    }, []) */


   /*  const [payments, setPayments] = useState([
        {
            id: 1,
            amount: 12323
        },
        {
            id: 2,
            amount: 12323
        },
        {
            id: 3,
            amount: 12323
        }
    ]) */

    return (

        <div className="flex flex-col gap-6 ">


            <div className="flex justify-between">
                <PaymentsFilter></PaymentsFilter>
               {/*   */}
            </div>
            <div className="w-full ">

                {
                    payments.map((payment) => (<PaymentListItem payment={payment} key={(payment.id)+Math.random()*100}></PaymentListItem>))
                }
            </div>



        </div>

    );
}








export default PaymentsList