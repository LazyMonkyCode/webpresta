import React from "react";

import { useSelector, useDispatch } from "react-redux";

import Badge from "../ui/badge/Badge";
import { FaSackDollar } from "react-icons/fa6";

import { FaMoneyBillWave } from "react-icons/fa6";
import { formatAmount } from "../../common/funcs";
import { FaHandHoldingUsd, FaCheckCircle } from 'react-icons/fa';
const ClientStatCards = () => {


  const clients = useSelector(state=>state.clients)




  return (<div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 md:gap-6 mb-6">

    {/* <!-- Metric Item Start --> */}
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex gap-3  items-center">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
       <FaSackDollar className="text-gray-800 size-6 dark:text-white/90" />
      </div>
       <h4 className="text-center w-full mt-2 font-bold text-gray-800 text-2xl dark:text-white/90">
            {clients.total_loans}
          </h4>
      </div>

      <div className="flex items-end justify-between mt-5">
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total Prestamos en curso
          </span>
         
        </div>
        <Badge color="success">
          {/* <ArrowUpIcon />
          11.01% */}
        </Badge>
      </div>
    </div>
    {/* <!-- Metric Item End --> */}

    {/* <!-- Metric Item Start --> */}
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
       <div className="flex gap-3  items-center">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
       < FaMoneyBillWave className="text-gray-800 size-6 dark:text-white/90" /> 
      </div>
       <h4 className="text-center w-full mt-2 font-bold text-gray-800 text-2xl dark:text-white/90">
            ${formatAmount(clients.total_lend)}
          </h4>
      </div>
      <div className="flex items-end justify-between mt-5">
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total Prestado
          </span>
         {/*  <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
            ${formatAmount(clients.total_lend)}
          </h4> */}
        </div>

        {/* <Badge color="error">
          {/*  <ArrowDownIcon />
          9.05% 
        </Badge> */}
      </div>
    </div>
    {/* <!-- Metric Item End --> */}

    {/* <!-- Metric Item Start --> */}
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      
       <div className="flex gap-3  items-center">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
       <FaCheckCircle className="text-gray-800 size-6 dark:text-white/90" />
      </div>
       <h4 className="text-center w-full mt-2 font-bold text-gray-800 text-2xl dark:text-white/90">
             ${formatAmount(clients.paid_amount)}
          </h4>
      </div>
     

      <div className="flex items-end justify-between mt-5">
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total Devuelto
          </span>
          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
           
          </h4>
        </div>
        {/*  <Badge color="success">
         <ArrowUpIcon />
          11.01% 
        </Badge>*/}
      </div>
    </div>
    {/* <!-- Metric Item End --> */}

    {/* <!-- Metric Item Start --> */}
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      
      <div className="flex gap-3  items-center">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
      <FaHandHoldingUsd className="text-gray-800 size-6 dark:text-white/90" /> 
      </div>
       <h4 className="text-center w-full mt-2 font-bold text-gray-800 text-2xl dark:text-white/90">
              ${formatAmount(clients.left_amount)}

          </h4>
      </div>
     

      <div className="flex items-end justify-between mt-5">
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Restante Por devolver
          </span>
          
        </div>
        <Badge color="success">
          {/* <ArrowUpIcon />
          11.01% */}
        </Badge>
      </div>
    </div>
    {/* <!-- Metric Item End --> */}
  </div>)
}





export function MoneyBagIcon({ size = 24, color = 'currentColor', ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 1 L8 5 L12 9 L16 5 L12 1 Z" /> {/* Knot of the bag */}
      <path d="M8 5 C4 8, 4 16, 12 23 C20 16, 20 8, 16 5 Z" /> {/* Bag */}
      <path d="M12 11 L12 17" /> {/* Dollar sign vertical */}
      <path d="M10 13 H14" />   {/* Dollar sign horizontal top */}
      <path d="M10 15 H14" />   {/* Dollar sign horizontal bottom */}
    </svg>
  );
}




export default ClientStatCards