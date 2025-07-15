import React,{useEffect} from "react";
import EcommerceMetrics from "../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../components/ecommerce/MonthlyTarget";
import RecentOrders from "../components/ecommerce/RecentOrders";
import DemographicCard from "../components/ecommerce/DemographicCard";

import ClientsService from "../services/ClientsService";
import { useDispatch } from "react-redux";
import { setClients, setClientsStats } from "../redux/slices/clientsSlice";
import LoansService from "../services/LoansService";
import PaymentsService from "../services/PaymentsService";
import { useSelector } from "react-redux";
//
export default function     Dashboard() {

  const dispatch = useDispatch()
  const clients = useSelector(state=>state.clients)
  useEffect(() => {
    
    const fetchData  = async (params) => {
        const service  = new ClientsService()
        const loansService = new LoansService()
        const paymentsService = new PaymentsService()


       const clientsRsultData = await service.getTotalClients()
        const loansResulData = await  loansService.getActiveLoans()
        console.log(loansResulData,"loans data")
       
       
        dispatch(setClientsStats({
       // monthly_percent_paid:paymentsData,
        total_clients:clientsRsultData.total,
        total_active_loans:loansResulData.active_loans,

       }))
       console.log(clientsRsultData," result data")
    }

    fetchData()
    
    return () => {
      
    }
  }, [])
  

  return (
    <>
    {/*   <PageMeta
        title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      /> */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics />
           <MonthlySalesChart />
       
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-7">
         {/*  <RecentOrders /> */}
        </div> 
      </div>
    </>
  );
}
