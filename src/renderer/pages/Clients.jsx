import React, { useEffect } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
//import PageMeta from "../components/common/PageMeta";

import { useSelector } from "react-redux";
import { useModal } from "../hooks/useModal";

import { setPaginationData,setTotalItems } from "../redux/slices/pagination"
import AddClientModal from "../components/clients/AddClientModal";
import ClientsList from "../components/clients/ClientsList"
import ClientsService from "../services/ClientsService";
import LoansService from "../services/LoansService";
import { useLoaderData } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setClients } from "../redux/slices/clientsSlice";
import {setLoans} from '../redux/slices/loansSlice'

export const clientsLoader= async () => {
    
   /*  try {
    const clientsService = new ClientsService();
    const clients = await clientsService.getClients();
    
    return clients
    } catch (error) {
      return []
    } */
     
    return {}
}


export default function Clients() {


  const data = useLoaderData();
  const dispatch = useDispatch();
  const { clients } = useSelector(state => state.clients);
        const { isOpen, openModal, closeModal } = useModal();
  const pagination = useSelector(state => state.pagination);
  
  
  useEffect(() => {
    
    async function fetchClients() { 
      try {

        //console.log("pagination", pagination)
        const clientsService = new ClientsService();
        const clientsData = await clientsService.getClients(pagination.filter,pagination.page, pagination.limitPerPage);
        
        console.log(clientsData)
        dispatch(setClients(clientsData.clients || []));
        dispatch(setTotalItems(clientsData.total || 0));
       // dispatch(setPaginationData(clientsData.paginationData));

      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    }

    fetchClients();

  }, [data, dispatch,pagination.page,pagination.filter]);




  

  useEffect(() => {
    console.log(isOpen)
    setPaginationData({
      page: 1,
      totalItems: 20,
      limit: 10,
    })

  },[])
  return (
    <div>
      {/* <PageMeta
        title="React.js Blank Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Blank Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      /> */}
      
      <PageBreadcrumb pageTitle="Clientes" />

     {/*  <ClientPageCards></ClientPageCards> */}
      {/* <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[630px] text-center">
          <h3 className="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            Card Title Here
          </h3>

          <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-base">
            Start putting content on grids or panels, you can also use different
            combinations of grids.Please check out the dashboard and other pages
          </p>
        </div>
      </div> */}

      {/*  <FilterClients></FilterClients> */}
      <ClientsList></ClientsList>
     <AddClientModal ></AddClientModal>
    </div>
  );
}














