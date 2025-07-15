
import React, { useState } from "react"
import { User, User2 as GroupIcon, ArrowBigDown as ArrowUpIcon, Handshake } from 'lucide-react'
import { useSelector, useDispatch } from "react-redux";
import { openModal } from '../../redux/slices/modalSlice'
import Button from "../ui/button/Button";
import ClientFilter from "./ClientFilter";
import Badge from "../ui/badge/Badge";
import { Link } from "react-router";
import Pagination from '../Pagination';
import { FaCreditCard, FaSackDollar } from "react-icons/fa6";
function ClientsList() {
  // const [clients,setClients] = useState([{id:1,name:"pedro"},{id:2,name:"juan"}])
  const { clients } = useSelector(state => state.clients)
  // const {clients} = useSelector(state => state.clients)    
  const dispatch = useDispatch()
  const pagination = useSelector(state => state.pagination);



  if (!clients.length && !pagination.filter) return (
    <div className="h-screen-70 flex justify-center flex-col text-gray-400 items-center border border-gray-200 rounded-2xl">
      <span className="text-3xl p-5 bg-gray-300 rounded-full"><User className=""></User></span>
      <h1 className="font-bold text-2xl">No tienes clientes registrados</h1>
      <p className="mb-2">Agrega  tu primer cliente al sistema</p>
      <Button onClick={() => dispatch(openModal())} >nuevo cliente</Button>
      {/* <button className="p-2 rounded-md bg-success-500 text-white" ></button>
 */}
    </div>)
  return (
    <div className="rounded-2xl border   border-gray-200 bg-white ">
      <ClientFilter></ClientFilter>
      <div className="flex justify-between">
        <div className="ml-4">
          <Button onClick={() => dispatch(openModal())} size="sm" >nuevo cliente</Button>
        </div>
        <Pagination size={"md"}></Pagination>
      </div>

      {clients.length === 0 && (
        <div className="h-screen-70 flex justify-center flex-col text-gray-400 items-center border border-gray-200 rounded-2xl">
          <span className="text-3xl p-5 bg-gray-300 rounded-full"><User className=""></User></span>
          <h1 className="font-bold text-2xl">No se econtraron clientes</h1>

        </div>)}
      <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 lg:grid-cols-3   md:gap-6 mb-5  sm:grid-cols-1 sm:gap-2 rounded-2xl  p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        {/*  <div className="col-span-12">
           <Pagination  />
        </div> */}



        {clients.map(client => (<ClientCard key={client.id} client={client}></ClientCard>))

        }


      </div>
    </div>
  )
}

import { FaStar } from "react-icons/fa6";

import { CreditCard, DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react';

import { UserRound, CalendarDays } from 'lucide-react';

const ClientCard = ({ client }) => {
  const { id, nickname } = client;

  const reputationScore = (() => {
    const totalPayments =
      client.total_paid_payments +
      client.total_expired_payments +
      client.total_pending_payments +
      client.total_incomplete_payments;

    if (totalPayments === 0) return 0;

    const score = (client.total_paid_payments / totalPayments) * 100;
    return Math.round(score);
  })();

  return (
    <div className="bg-blue-500 text-white sm:mb-2 shadow-lg rounded-xl py-4 px-4 w-full max-w-md border border-gray-100">
      <div className=" flex justify-between p-0 gap-4">
        <div className="flex flex-col items-center">
          {/* Icono de usuario */}
          <div className="size-20 p-3 bg-blue-600 text-white rounded-full flex items-center justify-center">
            <UserRound size={34} />
          </div>

          {/* Reputación */}
          <div className="w-20 mt-2">
            <div className="flex items-center justify-center gap-1">
              <FaStar className="text-yellow-400" />
              <span className="text-white text-xs">{reputationScore}%</span>
            </div>
            <div className="w-full bg-white h-2 rounded-full overflow-hidden mt-1">
              <div
                className={`h-full transition-all duration-300 ${reputationScore > 80
                    ? "bg-green-500"
                    : reputationScore > 50
                      ? "bg-yellow-400"
                      : "bg-red-500"
                  }`}
                style={{ width: `${reputationScore}%` }}
              ></div>
            </div>
          </div>
        </div>


        <div className="w-2/4">
          <Link to={"/clients/" + client.id}><h2 className="text-md font-semibold">{nickname}</h2></Link>
          <Badge variant="solid" className="w-1/2" color={client.total_active_loans ? "success" : "primary"}>{
            client.total_active_loans ? "activo" : "no activo"
          }</Badge>
          {/* <div className="flex gap-2 mt-2 items-center">
            <span className="bg-success-500 p-2  flex items-center justify-center rounded-full">
              <FaSackDollar className="text-white text-xl" />
            </span>
            <div>
              <span className="bg-white border border-gray-300 p-2 rounded-full ">
                <label className="text-sm text-success-500 font-semibold">1</label>
                <label className="">/10</label>
              </span>
            </div>
          </div> */}
          <div className="flex flex-col justify-between">
            <div className="p-2">
              something
            </div>
            <div className="flex gap-2  items-center">
              <span className="bg-blue-600 p-2 border border-white  flex items-center justify-center rounded-full">
                <FaCreditCard className="text-white " />
              </span>
              <div className="flex gap-2">
                <span className=" w-6 h-6 flex items-center  border border-gray-300 justify-center bg-red-500  rounded-full text-white ">
                  {client.total_expired_payments}
                </span>
                <span className=" w-6 h-6 flex items-center  border border-gray-300 justify-center bg-green-600  rounded-full text-white ">
                  {client.total_paid_payments}
                </span>
                <span className=" w-6 h-6 flex items-center border border-gray-300  justify-center bg-blue-600  rounded-full text-white ">
                  {client.total_pending_payments}
                </span>

                <span className=" w-6 h-6 flex items-center  border border-gray-300 justify-center bg-yellow-600  rounded-full text-white ">
                  {client.total_incomplete_payments}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white text-black border border-gray-300 p-1 rounded-lg">
          <div className="flex flex-col  gap-1 mt-2 items-center ">
            <span className="   flex flex-col items-center justify-center rounded-full">
              <FaSackDollar className=" text-xl" />
              <span className="text-xs">prestamos</span>
            </span>
            <div>
              <span className="flex items-ceter justify-center gap-1 bg-white w-full p-2 rounded-full ">
                <label className="flex items-end text-sm text-success-500 font-semibold">{client.total_completed_loans}</label>
                <label className="font-semibold">/{client.total_loans}</label>

              </span>

            </div>
            <div className="flex gap-2">
              <span className="text-blue-600 font-semibold"> {client.total_active_loans}</span>
              <span className="text-yellow-400 font-semibold"> {client.total_pending_loans}</span>
            </div>

          </div>
        </div>

      </div>

      {/*  <div className="mt-6 flex items-center gap-2 text-sm text-gray-600">
        <CalendarDays size={18} className="text-blue-500" />
        <span>Próximo pago: </span>
        <span className="font-medium text-gray-800">{"12/12/2012"}</span>
      </div> */}
      {/* Barra de reputación */}
      {/* <div className="mt-6">
  <label className="text-sm font-medium text-white">Reputación</label>
  <div className="w-full bg-white h-3 rounded-full overflow-hidden mt-1">
    <div
      className={`h-full transition-all duration-300 ${
        reputationScore > 80
          ? "bg-green-500"
          : reputationScore > 50
          ? "bg-yellow-400"
          : "bg-red-500"
      }`}
      style={{ width: `${reputationScore}%` }}
    ></div>
  </div>
  <span className="text-xs text-white mt-1 block text-right">{reputationScore}%</span>
</div> */}
    </div>
  );
};



/* 
function ClientCard({id,name}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">

     <div className="flex gap-2">
       <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
        <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
       
      </div>
      <span className="font-bold text-lg flex flex-col mb-3">
        <Link to={"/clients/"+id}>
          {name}
        </Link>

         <span className="text-sm text-gray-500 dark:text-gray-400 flex  items-center justify-center gap-2 bg-green-400 text-white p-1 rounded-md">
            <Handshake></Handshake> 
            <span className="bg-white text-gray-500 rounded-full p-1"><label >1</label> 
              /10</span>
            <span>
              <label className="text-xs ">activos</label> 9</span>
          </span>
      </span>
     </div>

      <div className="flex items-end justify-between mt-5">
        <div>
         
          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
            204
          </h4>
        </div>
        <Badge color="success">
          <ArrowUpIcon />
          11.01%
        </Badge>
      </div>
    </div>
  )
}
 */




export default ClientsList