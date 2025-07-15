import React, { useEffect,useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
//import PageMeta from "../components/common/PageMeta";

import { useSelector, useDispatch } from "react-redux";
//import { useModal } from "../hooks/useModal";

import { openModal, closeModal } from "../redux/slices/modalSlice";

import ClientsService from "../services/ClientsService";
import LoansService from "../services/LoansService";
import PaymentsService from "../services/PaymentsService";
import { setClient, setStats } from "../redux/slices/clientsSlice";
import { useParams } from 'react-router-dom';
import { setLoans } from '../redux/slices/loansSlice'
//import EditModalClient from "../components/client/EditModalClient";
import ClientMetaCard from "../components/client/ClientMetaCard";
import { setPayments } from '../redux/slices/paymentsSlice'
import Badge from "../components/ui/badge/Badge";
import LoansList from "../components/client/LoansList";
import { resetPaginationData } from "../redux/slices/pagination";
//import PaymentsList from "../components/client/PaymentsList";

import PaymentsList from "../components/payments/PaymentsList";
import ClientStatCards from "../components/client/ClientStatCards";
import { FaSackDollar } from "react-icons/fa6";
import DeleteLoanModal from "../components/loan/DeleteLoanModal";
import EditLoanModal from "../components/loan/EditLoanModal";
import DeleteClientModal from "../components/client/DeleteClientModal";
import PayPaymentModal from "../components/payments/PayPaymentModal";
export default function ClientPage() {

  const { id } = useParams();

  const dispatch = useDispatch();

  const client = useSelector((state) => state.clients.client);
  const pagination = useSelector((state) => state.pagination);

  const { selectedLoan } = useSelector((state) => state.loans);

  const [totalItems ,setTotalItems ] = useState()

  useEffect(() => {


    //console.log(id)

    async function fetchClient() {
      try {

        //  console.log("pagination", pagination)
        const clientsService = await new ClientsService();
        const clientData = await clientsService.getClientById(id);
        console.log("clientData", clientData)
        /* dispatch(setClients(clientsData.clients || []));
        dispatch(setTotalItems(clientsData.total || 0)); */
        // dispatch(setPaginationData(clientsData.paginationData));
        dispatch(setClient(clientData || {}));


      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    }

    fetchClient();

  }, [/* data, dispatch,pagination.page,pagination.filter */]);



  useEffect(() => {

    async function fetchLoansClients() {
      try {

        //console.log("pagination", pagination)
        const loansService = new LoansService()

        const loansData = await loansService.getClientLoans({
          client_id: id
        })


        console.log(loansData, "loansasdasda")

        dispatch(setLoans(loansData.loans))

        dispatch(setStats({
          total_loans: loansData.loans.filter((l) => l.status == "active").length,
          total_lend: loansData.loans.reduce((acc, current) => acc += current.amount, 0),
          paid_amount: loansData.loans.reduce((acc, current) => acc += current.paid_amount, 0),
          left_amount: loansData.loans.reduce((acc, current) => acc += current.left_amount, 0),
        }))

        /*  dispatch(setClients(clientsData.clients || []));
         dispatch(setTotalItems(clientsData.total || 0)); */
        // dispatch(setPaginationData(clientsData.paginationData));

      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    }

    fetchLoansClients();

  }, []);


  useEffect(() => {

    async function fetchLoanPayments() {
      try {



        //console.log("pagination", pagination)
        const paymentsService = new PaymentsService()
        let paymentssData

        console.log(selectedLoan, "selected loan")
        if (selectedLoan) {
          paymentssData = await paymentsService.getLoanPayments({
            loan_id: selectedLoan.id
          }, pagination.page, pagination.limitPerPage)
          console.log(paymentssData, "selected loanasdasd")
        } else {
          paymentssData = await paymentsService.getClientPayments({
            client_id: id
          }, pagination.page, pagination.limitPerPage)
        }

        setTotalItems(paymentssData.total)
        console.log(paymentssData, "peiments")


        if(totalItems!= paymentssData.total){
          dispatch(resetPaginationData({
          
          totalItems: paymentssData.total,
        }))
        }
        

        console.log(paymentssData.payments, "lpaymentsasdasdasdasda")
        dispatch(setPayments(paymentssData.payments))
        /*  dispatch(setClients(clientsData.clients || []));
         dispatch(setTotalItems(clientsData.total || 0)); */
        // dispatch(setPaginationData(clientsData.paginationData));

      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    }


    fetchLoanPayments()
  }, [selectedLoan,pagination]);



  return (
    <div>
      <PageBreadcrumb pageTitle={"Cliente"} />
      <ClientStatCards></ClientStatCards>
      <div className="grid grid-cols-12 gap-5">
        <ClientLoansPayments />
        <ClientMetaCard></ClientMetaCard>
      </div>
      <EditLoanModal></EditLoanModal>
      <DeleteLoanModal></DeleteLoanModal>
      <DeleteClientModal></DeleteClientModal>
      <PayPaymentModal></PayPaymentModal>
    </div>
  );
}


const ClientLoansPayments = () => {

  const { loans } = useSelector(state => state.loans)
  return (<div className="flex flex-col gap-3 xl:col-span-8 sm:col-span-12 lg:col-span-12  sm:order-2 md:order-2 lg:col-span-12 p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">

    {

      loans.length ? (<>
        <LoansList></LoansList>
        <PaymentsList></PaymentsList>
      </>)

        : (<div className="h-[400px] flex gap-3 flex-col justify-center items-center">

          <span className="p-4 bg-gray-200 text-lg text-gray-400  rounded-full">

            <FaSackDollar></FaSackDollar>
          </span>

          <h1 className="text-2xl font-bold text-gray-500">este eliente no posee prestamos</h1>
          <p className="text-gray-400">Agrega un prestamo a este cliente desde el boton agregar prestamo</p>
        </div>)

    }
  </div>)
}






