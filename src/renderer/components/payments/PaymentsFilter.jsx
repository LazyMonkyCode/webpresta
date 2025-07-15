import React,{useState,useEffect} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setFilter } from '../../redux/slices/pagination';

import {
  Filter,
  X,
  ChevronDown,
  CheckCircle,
  AlarmClock,
  Clock,
  AlertCircle
} from 'lucide-react';

import Checkbox from '../../form/input/Checkbox';
import Radio from '../../form/input/Radio';
import Pagination from '../Pagination';
import { FaSackDollar, FaTrash } from 'react-icons/fa6';
import { FaCreditCard, FaEdit, FaTrashAlt } from 'react-icons/fa';
import { openModal } from '../../redux/slices/modalSlice';

const cuotaEstados = ['pagadas', 'expiradas', 'pendientes', 'incompletas'];
const estadoPrestamos =[
  "En curso",
  "Completado",
  "Cancelado",
  "Pendiente",
]



const PaymentsFilter = () => {
  const [nombre, setNombre] = useState('');
  const [filtrosVisibles, setFiltrosVisibles] = useState(false);
  const [estadoCuotasSeleccionadas, setEstadoCuotasSeleccionadas] = useState([]);
  const [cantidadPrestamos, setCantidadPrestamos] = useState(1);
  const [filtrosActivos, setFiltrosActivos] = useState({});
  const [estadoPrestamoSeleccionadas, setEstadoPrestamoSeleccionadas] = useState([]);
  const dispatch = useDispatch();
  const selectedItems = useSelector(state=>state.selection)

  const { filter } = useSelector((state) => state.pagination);
    const loans = useSelector((state) => state.loans);

  useEffect(() => {
    // Inicializar filtros activos con valores por defecto
    dispatch(setFilter({
      nickname: '',
      payments: [],
      loans: [],
      loansLen: ''
    }));

  }, []);
  const estadoIcons = {
  pagadas: <CheckCircle className="w-4 h-4 text-green-500" />,
  expiradas: <AlarmClock className="w-4 h-4 text-red-500" />,
  pendientes: <Clock className="w-4 h-4 text-blue-500" />,
  incompletas: <AlertCircle className="w-4 h-4 text-orange-500" />
};


const cantidadPrestamosValues =["sin prestamos activos",1,3,5]



  const updateFiltro = (clave, valor) => {
    setFiltrosActivos((prev) => {
      const nuevos = { ...prev };
      if (valor === '' || (Array.isArray(valor) && valor.length === 0)) {
        delete nuevos[clave];
      } else {
        nuevos[clave] = valor;
      }
      return nuevos;
    });
  };

  // Nombre
  const handleNombreChange = (e) => {
    const value = e.target.value;
    setNombre(value);
    updateFiltro('nombre', value);
    dispatch(setFilter({
      ...filter,
      nickname: value,        
      
    }));
  };

  const toggleEstadoPrestamo = (estado) => {
    const nuevaLista = estadoPrestamoSeleccionadas.includes(estado)

      ? estadoPrestamoSeleccionadas.filter((e) => e !== estado)
      : [...estadoPrestamoSeleccionadas, estado];

    setEstadoPrestamoSeleccionadas(nuevaLista);
    updateFiltro('estadoPrestamo', nuevaLista);

    dispatch(setFilter({
      ...filter,
      loans: nuevaLista,        
      
    }));
  };
  // Estado de cuotas múltiple
  const toggleEstadoCuota = (estado) => {
    const nuevaLista = estadoCuotasSeleccionadas.includes(estado)
      ? estadoCuotasSeleccionadas.filter((e) => e !== estado)
      : [...estadoCuotasSeleccionadas, estado];

    setEstadoCuotasSeleccionadas(nuevaLista);
    updateFiltro('estadoCuota', nuevaLista);

     dispatch(setFilter({
      ...filter,
      payments: nuevaLista,        
      
    }));

  };

  // Cantidad de préstamos
  const handleCantidadChange = (e) => {
    const value = e;

   
     setCantidadPrestamos(value);
    updateFiltro('cantidadPrestamos', value); 
     dispatch(setFilter({
      ...filter,
      loansLen: value,        
      
    }));
  };

  const quitarFiltro = (clave, valor = null) => {
    const nuevos = { ...filtrosActivos };

    if (clave === 'estadoCuota' && valor) {
      const nuevaLista = nuevos.estadoCuota.filter((e) => e !== valor);
      if (nuevaLista.length > 0) {
        nuevos.estadoCuota = nuevaLista;
      } else {
        delete nuevos.estadoCuota;
      }
      setEstadoCuotasSeleccionadas(nuevaLista);
    } else {
      delete nuevos[clave];
      if (clave === 'nombre') {
        setNombre('');
      } else if (clave === 'cantidadPrestamos') {
        setCantidadPrestamos('');
      } else if (clave === 'estadoCuota') {
        setEstadoCuotasSeleccionadas([]);
      }
    }

    setFiltrosActivos(nuevos);
  };

  return (
    <div className="w-full  mx-auto ">
      {/* Input + botón de filtros */}
      <div className="flex gap-2 items-center  justify-between">
        
      <div className='flex gap-3'>
        <button
          onClick={() => setFiltrosVisibles((prev) => !prev)}
          className="flex items-center gap-1 px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-100"
        >
          <Filter className="w-3 h-3" />
          <span>filtros</span>
          <ChevronDown className="w-3 h-3" />
        </button>
        {
          loans.selectedLoan && (
            <div className='flex gap-2 justify-center items-center rounded-full   text-gray-500 px-2 py-1'>
             <span className='p-2 rounded-full bg-green-500 text-white'>  <FaSackDollar></FaSackDollar></span>
            <button 
            onClick={()=>{
              dispatch(openModal(
                "LOAN_DELETE"
                ))
            }}
            className='hover:text-red-500  rounded-md'>
              <FaTrashAlt></FaTrashAlt>
            </button>
            <button
            onClick={()=>{
              dispatch(openModal("LOAN_EDIT"))
            }}
            className='hover:text-yellow-500  rounded-md'>
              <FaEdit size={20}></FaEdit>
            </button>
        </div>
          )
        }


        {
          selectedItems.items.length ? (
            <div className='flex gap-2 justify-center items-center rounded-full  text-gray-500 px-2 py-1 '>
             <span className='p-2 rounded-full bg-blue-500 text-white'> <FaCreditCard></FaCreditCard></span>
            <button 
            onClick={()=>{
              dispatch(openModal(
                "PAYMENT_DELETE"
                ))
            }}
            className='hover:text-red-500  rounded-md transition-all'>
              <FaTrashAlt />
            </button>
            <button
            onClick={()=>{
              dispatch(openModal("PAYMENT_EDIT"))
            }}
            className='hover:text-yellow-500   rounded-md'>
              <FaEdit size={20}></FaEdit>
            </button>
        </div>
          ): (<></>)
        }
        
      </div>

        <Pagination size={"sm"}></Pagination>
      </div>

      {/* Dropdown de filtros */}
      {filtrosVisibles && (
        <div className=" mt-2 border border-gray-200 rounded-md p-4 shadow-md bg-white z-10 relative grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Columna: Cuotas */}
          <div>
            <h3 className="font-semibold mb-2">Estado de cuotas</h3>
            {cuotaEstados.map((estado) => (
            <label key={estado} className="flex items-center gap-2 mb-1 cursor-pointer">
              <Checkbox
               
                checked={estadoCuotasSeleccionadas.includes(estado)}
                onChange={() => toggleEstadoCuota(estado)}
              />
              <span className="flex items-center gap-1 capitalize">
                {estadoIcons[estado]} {estado}
              </span>
            </label>
          ))}
          </div>
          {/* Columna: estado de préstamos */}
          <div className=''>
            <h3 className="font-semibold mb-2">Estado Prestamos </h3>
            {
              estadoPrestamos.map((estado,index)=>(
              <label key={index} className="flex items-center gap-2 mb-1 cursor-pointer">
              <Checkbox
                checked={estadoPrestamoSeleccionadas.includes(estado)}
                onChange={() => toggleEstadoPrestamo(estado)}
              />
              <span className="flex items-center gap-1 capitalize">
                {estadoIcons[estado]} {estado}
              </span>
            </label>
              ))
            }
          </div>
          
          {/* Columna: Cantidad de préstamos */}
          <div className=''>
            <h3 className="font-semibold mb-2">Prestamos Activos</h3>
            {
              cantidadPrestamosValues.map((cant,index)=>(
              <label className='flex gap-1 mb-1' key={index}>
                <Radio
                value={cant}
                checked={cantidadPrestamos==cant }
                onChange={handleCantidadChange}
                ></Radio>
                <span className="flex items-center gap-1 capitalize">
                {/* estadoIcons[estado] */} {cant ==0 ? "Sin Prestamos" : cant == 5 ? "5 o mas": cant == 1 ? "1 o mas" : cant ==3 ? "3 o mas" : cant  }
              </span>
              </label>
              ))
            }
          </div>
        </div>
      )}

      {/* Etiquetas de filtros activos */}
      <div className="mt-4 flex flex-wrap gap-2">
        {filtrosActivos.nombre && (
          <Tag color="blue" onClose={() => quitarFiltro('nombre')}>
            Nombre: {filtrosActivos.nombre}
          </Tag>
        )}
        {filtrosActivos.estadoPrestamo &&
          filtrosActivos.estadoPrestamo.map((estado) => (
            <Tag key={estado} color="orange" onClose={() => quitarFiltro('estadoPrestamo', estado)}>
              Prestamo: {estado}
            </Tag>
          ))}

        {filtrosActivos.estadoCuota &&
          filtrosActivos.estadoCuota.map((estado) => (
            <Tag key={estado} color="green" onClose={() => quitarFiltro('estadoCuota', estado)}>
              Cuota: {estado}
            </Tag>
          ))}

        {filtrosActivos.cantidadPrestamos && (
          <Tag color="purple" onClose={() => quitarFiltro('cantidadPrestamos')}>
            Préstamos: {filtrosActivos.cantidadPrestamos != "sin prestamos activos" ?filtrosActivos.cantidadPrestamos+" o mas" : filtrosActivos.cantidadPrestamos}
          </Tag>
        )}
      </div>
    </div>
  );
};

// Etiqueta reutilizable con color dinámico
const Tag = ({ children, onClose, color }) => {
  const colorMap = {
    orange: 'bg-orange-100 text-orange-800',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className={`flex items-center px-3 py-1 rounded-full text-sm ${colorMap[color] || 'bg-gray-200 text-gray-800'}`}>
      <span className="mr-2">{children}</span>
      <button onClick={onClose} className="hover:text-red-600">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};



export default PaymentsFilter