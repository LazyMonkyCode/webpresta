

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { openModal, closeModal } from '../../redux/slices/modalSlice';
import EditModalClient from './EditModalClient';
import Button from '../ui/button/Button';
// import { closeModal } from '../../redux/slices/modalSlice';
// import { Modal } from '../ui/modal';
import { FaMoneyBillWave, FaPiggyBank } from "react-icons/fa";

import AddClientModal from '../clients/AddClientModal';
import AddLoanModal from './AddLoanModal';
import { User2 } from 'lucide-react';
import Badge from '../ui/badge/Badge';
import Tabs from '../Tabs';
import LoanChart from '../loan/LoanChart';
import { FaSackDollar } from 'react-icons/fa6';
import PaymentClientStateChart from '../payments/PaymentClientStateChart';
function ClientMetaCard() {
  //const { isOpen, openModal, closeModal } = useModal();
  const dispatch = useDispatch();
  const client = useSelector(state => state.clients.client);
  const loans = useSelector(state => state.loans);
  const gananciaBruta = 20000;
  const gananciaNeta = 3000;
  const handleSave = () => {
    // Handle save logic here
    console.log("Saving changes...");
    dispatch(closeModal())
  };

 


  return (
    <div className="col-span-4 sm:col-span-12 lg:col-span-12 p-5 xl:col-span-4 sm:order-1  md:order-1 xl:order-2 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">


      <div className="flex flex-col gap-6  lg:items-start lg:justify-between">


        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          {/* Cliente info */}
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 text-white text-2xl p-4 rounded-full">
              <User2 />
            </div>
            <div>
              <h1 className="text-lg font-bold mb-1">{client.nickname}</h1>
              <Badge variant="solid" color={loans.loans.length ? "success" : "primary"}>
                {loans.loans.length ? "Activo" : "No activo"}
              </Badge>
            </div>
          </div>

          {/* Botón prestar dinero */}
          <Button
            size='xs'
            className="inline-flex items-center gap-2  text-white font-medium px-4 py-2 rounded-lg shadow transition"
            onClick={() => dispatch(openModal('ADD_LOAN'))}
          >
            <FaSackDollar className="text-lg" />

          </Button>
        </div>

        <div>

          <Tabs
            defaultTab="info"
            tabs={[
              {
                id: 'info',
                label: 'Información',
                content: (

                  <TabInfo></TabInfo>
                ),
              },
              {
                id: 'chart',
                label: 'Gráfico',
                content: (
                  <TabStatsGrafico></TabStatsGrafico>
                ),
              },
              {
                id: 'settings',
                label: 'Configuraciones',
                content: (
                  <TabSettings></TabSettings>
                ),
              },

            ]}
          />

          {/* 
          <div className='flex  justify-between items-center mb-6'>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 ">
              Personal Information
            </h4>



          </div> */}

          {/*  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                First Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                Musharof
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Last Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                Chowdhury
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Email address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                randomuser@pimjo.com
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Phone
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                +09 363 398 46
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Bio
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                Team Manager
              </p>
            </div>
          </div> */}

        </div>
      </div>

      <AddLoanModal ></AddLoanModal>


      <EditModalClient onSave={handleSave}></EditModalClient>
    </div>
  );
}



const TabSettings = () => {

  const dispatch = useDispatch();
  const client = useSelector(state => state.clients.client);
  const loans = useSelector(state => state.loans);
  const gananciaBruta = 20000;
  const gananciaNeta = 3000;

   const [settings, setSettings] = useState({
    notificationsEnabled: true,
    isBlocked: false,
  });


    const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  return (

    <div className="space-y-6 text-sm text-gray-700 dark:text-white/80">
      <div className="flex items-center justify-between">
        <span>Recibir notificaciones</span>
        <button
          onClick={() => toggleSetting('notificationsEnabled')}
          className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${settings.notificationsEnabled ? 'bg-green-500' : 'bg-gray-400'
            }`}
        >
          <div
            className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${settings.notificationsEnabled ? 'translate-x-6' : ''
              }`}
          ></div>
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span>Cliente bloqueado</span>
        <button
          onClick={() => toggleSetting('isBlocked')}
          className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${settings.isBlocked ? 'bg-red-500' : 'bg-gray-400'
            }`}
        >
          <div
            className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${settings.isBlocked ? 'translate-x-6' : ''
              }`}
          ></div>
        </button>
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => {
            dispatch(openModal("CLIENT_DELETE"))
          }}
          className="text-red-600 hover:underline text-sm font-medium"
        >
          Eliminar cliente
        </button>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400">
        Estos cambios se aplican sólo en la interfaz. Debes conectarlos a tu backend o Redux para que sean persistentes.
      </div>
    </div>)

}




const TabStatsGrafico = () => {

  const dispatch = useDispatch();
  const client = useSelector(state => state.clients.client);
  const loans = useSelector(state => state.loans);
  const gananciaBruta = 20000;
  const gananciaNeta = 3000;

  return (

    <div>
     {/*  <LoanChart
        type="area"
        title="Historial de Pagos del Cliente"
        categories={['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']}
        series={[
          { name: 'Pagos', data: [200, 300, 250, 400, 350, 500] },
          { name: 'Préstamos', data: [300, 400, 350, 450, 500, 600] },
        ]}
      /> */}
      <PaymentClientStateChart cuotas={{
        pagadas: 10,
        pendientes: 5,
        expiradas: 2,
        incompletas: 1,
      }}></PaymentClientStateChart>
    </div>)

}


const TabInfo = () => {

  const dispatch = useDispatch();
  const client = useSelector(state => state.clients.client);
  const loans = useSelector(state => state.loans);
  const gananciaBruta = 20000;
  const gananciaNeta = 3000;

  return (<div>
    <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">

      {/* <div className="bg-white rounded-lg shadow p-6 flex items-center">
                        <div className="p-4 bg-green-100 text-green-600 rounded-full mr-4">
                          <FaMoneyBillWave size={24} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Ganancia Bruta</p>
                          <p className="text-2xl font-semibold">${gananciaBruta.toLocaleString()}</p>
                        </div>
                      </div>

                     
                      <div className="bg-white rounded-lg shadow p-6 flex items-center">
                        <div className="p-4 bg-blue-100 text-blue-600 rounded-full mr-4">
                          <FaPiggyBank size={24} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Ganancia Neta</p>
                          <p className="text-2xl font-semibold">${gananciaNeta.toLocaleString()}</p>
                        </div>
                      </div> */}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
      <div>
        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">First Name</p>
        <p className="text-sm font-medium text-gray-800 dark:text-white/90">{client.name || (<Badge className="text-gray-300" color='light' variant='light'  >sin info</Badge>)}</p>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Last Name</p>
        <p className="text-sm font-medium text-gray-800 dark:text-white/90">{client.lastname || (<Badge color='light' variant='light'  >sin info</Badge>)}</p>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Email address</p>
        <p className="text-sm font-medium text-gray-800 dark:text-white/90">{client.email || (<Badge color='light' variant='light'  >sin info</Badge>)}</p>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Phone</p>
        <p className="text-sm font-medium text-gray-800 dark:text-white/90">{client.phone || (<Badge color='light' variant='light'  >sin info</Badge>)}</p>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">address</p>
        <p className="text-sm font-medium text-gray-800 dark:text-white/90">{client.address || (<Badge color='light' variant='light'  >sin info</Badge>)}</p>
      </div>

    </div>

    <div>
      <button
        onClick={() => dispatch(openModal('CLIENT_EDIT'))}
        className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium  text-yellow-400 rounded-lg shadow"
      >
        Editar información
      </button>
    </div>
  </div>)

}

export default ClientMetaCard;