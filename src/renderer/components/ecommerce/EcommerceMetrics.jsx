  import React from 'react'


import {
  ArrowDown as ArrowDownIcon,    // para ArrowDownIcon
  ArrowUp as ArrowUpIcon,      // para ArrowUpIcon
  Box as BoxIconLine,         // para BoxIconLine (no hay BoxIconLine exacto, pero Box es similar)
  Users as  GroupIcon,        // para GroupIcon (en lucide se llama Users)
} from "lucide-react";
import Badge from "../ui/badge/Badge";
import { useSelector } from 'react-redux';

export default function EcommerceMetrics() {


  const clients = useSelector(state=>state.clients)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Clientes
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {clients.total_clients}
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
           {/*  11.01% */}
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Prestamos Activos
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {clients.total_active_loans}
            </h4>
          </div>

          <Badge color="error">
            <ArrowDownIcon />
           {/*  9.05% */}
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  );
}
