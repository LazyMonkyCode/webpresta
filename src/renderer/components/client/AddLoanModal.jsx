
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeModal, changeName } from '../../redux/slices/modalSlice';
import { Modal } from '../ui/modal';
import Label from '../../form/Label';
import Input from '../../form/input/InputField';
import Button from '../ui/button/Button';
import DatePicker from '../../form/date-picker';
import Select from '../../form/Select';
import { Calendar as CalenderIcon } from "lucide-react";
import useValidation from '../../hooks/useValidator'
import Spinner from '../Spinner';
import { useState } from 'react';
import { changeValue, setInputs, setLoading } from '../../redux/slices/formSlice';
import Loan from '../../services/local/Loan';
import { useParams } from 'react-router';
import Checkbox from '../../form/input/Checkbox';
import { use } from 'react';
import { toast } from 'react-toastify';

const AddLoanModal = ({ client, onClose, onSave }) => {

  const { id } = useParams()
  const modal = useSelector(state => state.modal)
  const { user } = useSelector(state => state.auth)
  const clients = useSelector(state => state.clients)
const loans = useSelector(state => state.loans)

  const dispatch = useDispatch()
  const { validate, validations, errors } = useValidation()
  const [isLoading, setIsLoading] = useState(false)
  const [isCustom, setIsCustom] = useState(false)
  const { inputs } = useSelector(state => state.form)
  const options = [
    { value: "daily", label: "diario" },
    { value: "weekly", label: "semanal" },
    { value: "monthly", label: "mensual" },
    { value: "fortnightly", label: "quincenal" },
    { value: "custom", label: "personalizado" },
  ];


  useEffect(() => {

    //console.log(id)
    dispatch(setInputs({
      amount: 50000,
      interest_rate: 30,
      disbursement_date: new Date().toISOString(),
      first_payment_date: new Date().toISOString(),
      term: "daily",
      installments: 1,
      client_id: id,
      user_id: user.id,
      sunday: false,
      customValues: []
    }))
    //dispatch(changeName("ADD_LOAN"))



    return () => {

    }
  }, [])


  function addCustomValues({ index, amount, date }) {

    let newCustom = [...inputs.customValues];
    //const loans = useSelector(state=>state.loans.loans)
    if (inputs.customValues[index]) newCustom[index] = { amount, date }
    else newCustom.push({
      amount,
      date
    })

    dispatch(changeValue({ key: "customValues", value: newCustom }))
  }

  async function onSubmit(e) {
  //  e.eventPreventDefault()
    setIsLoading(true)
    const _errors = await validate({
      amount: [
        validations.required({ message: "Este valor es requerido" }),
        validations.numeric(),
        validations.minValue({ value: 10000 }),
        validations.maxValue({ value: 10000000 })
      ],
      interest_rate: [
        validations.required({ message: "Este valor es requerido" }),
        validations.numeric({ message: "Este valor debe ser un numero" }),
        validations.minValue({ value: 0 }),
        validations.maxValue({ value: 100 })
      ],
      installments: [
        validations.required({ message: "Este valor es requerido" }),
        validations.numeric(),
        validations.minValue({ value: 1 }),
        validations.maxValue({ value: 100 })
      ],
      term: [
        validations.required({ message: "Este valor es requerido" }),
        validations.alpha(),
       // validations.matchValues({ match: ["daily", "weekly", "monthly", "fortnightly", "custom"] })

      ],
      disbursement_date: [
        validations.required(),

      ],
      first_payment_date: [
        validations.required(),
      ]
    })


    if (Object.keys(_errors).length) {
      return
    }

    console.log(inputs)
     const _loan = new Loan({
      amount: inputs.amount,
      interest_rate: inputs.interest_rate,
      disbursement_date: inputs.disbursement_date,
      firstPaymentDate: inputs.first_payment_date,
      term: inputs.term,
      installments: inputs.installments,
      client_id: inputs.client_id,
      user_id: inputs.user_id
    })


    
    const newLoan = await _loan.insert({
      dates:inputs.customValues,
      sunday:inputs.sunday
    }) /**/

    
    ///TODO:enerate activity log 


    ///TODO:end notification to client

    //TODO:syncronize databases 

    //TODO: UPDATE redux state stats


   
  
    dispatch(setLoans([newLoan,...loans.loans]))

    //dispatch(setPayments(_loan.payments))

   
      dispatch(setStats({
      total_loans:clients.total_loans+1,
      total_lend:Number(clients.total_lend)+Number(inputs.amount),
      left_amount:clients.left_amount+newLoan.total_amount,
    }))

    setTimeout(() => {
      setIsLoading(false)
      dispatch(closeModal())
      toast.success("Prestamo agregado con exito!")
      
     
    }, 1000)
  }

  function handleSelectChange(val) {

    if (val == "custom") setIsCustom(true)
    dispatch(changeValue({ key: "term", value: val }))
  }

  return (<Modal name={"ADD_LOAN"} className="max-w-[700px] m-4">
    <div className="no-scrollbar relative w-full max-w-[700px]   rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
      <div className="px-2 pr-14">
        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Prestar Dinero
        </h4>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">

        </p>
      </div>

      {
        !isCustom ? (<form className="flex flex-col">
          <div className="custom-scrollbar overflow-y-auto  px-2 pb-3">
            <div>
              {/* <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Social Links
                </h5>
            */}
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className='relative'>
                  <Label>Monto a Prestar</Label>
                  <Input
                    error={errors.amount || false}
                    className='pl-[62px]'
                    onChange={(e) => dispatch(changeValue({ key: "amount", value: e.target.value }))}
                    value={inputs.amount || 50000}
                    type="number"
                  />
                   <span className="absolute left-0 top-2/3 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <DollarSign className="size-6" />
               </span>
                  {
                    errors.amount ?
                      (
                        <span className='text-red-600'>
                          {errors.amount}
                        </span>
                      ) : ""
                  }
                </div>

                <div className='relative'>
                  <Label>Interes %</Label>
                  <Input
                    error={errors.interest_rate || false}
                    className='pl-[62px]'
                    onChange={(e) => dispatch(changeValue({ key: "interest_rate", value: e.target.value }))}
                    value={inputs.interest_rate || 30}
                    type="number" />

                       <span className="absolute left-0 top-2/3 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <Percent className="size-6" />
               </span>
                  {
                    errors.interest_rate ?
                      (
                        <span className='text-red-600'>
                          {errors.interest_rate}
                        </span>
                      ) : ""
                  }
                </div>

                <div>

                  <DatePicker
                    id="date-picker12"
                    label="Fecha de desenbolso"
                    placeholder="Select a date"
                    defaultDate={inputs.disbursement_date || new Date()}
                    onChange={(dates, currentDateString) => {
                      // Handle your logic
                      console.log({ dates, currentDateString });
                      dispatch(changeValue({ key: "disbursement_date", value: currentDateString }))
                    }}
                  />

                  {
                    errors.disbursement_date ?
                      (
                        <span className='text-red-600'>
                          {errors.disbursement_date}
                        </span>
                      ) : ""
                  }
                </div>

                <div>
                  <DatePicker
                    id="date-picker10"
                    label="Fecha de primer pago"
                    placeholder="Select a date"
                    
                    defaultDate={inputs.first_payment_date || new Date()}
                    onChange={(dates, currentDateString) => {
                      // Handle your logic

                      console.log({ dates, currentDateString });
                      dispatch(changeValue({ key: "first_payment_date", value: currentDateString }))

                    }}
                  />

                  {
                    errors.first_payment_date ?
                      (
                        <span className='text-red-600'>
                          {errors.first_payment_date}
                        </span>
                      ) : ""
                  }
                </div>
              </div>
            </div>
            <div className="mt-7">
              {/* <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h5> */}

              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="relative ">
                  <Label>Numero de Cuotas</Label>
                  <Input
                    error={errors.installments || false}
                    className='pl-[62px]'
                    onChange={(e) => dispatch(changeValue({ key: "installments", value: e.target.value }))}
                    value={inputs.installments || 1}
                    type="number"
                  />
 
                  <span className="absolute left-0 md:top-3/4 lg:top-2/4 xl:top-2/4 -translate-y-2/3 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <Hash className="size-6" />
               </span>
                  {
                    errors.iinstallments ?
                      (
                        <span className='text-red-600'>
                          {errors.installments}
                        </span>
                      ) : ""
                  }
                </div>

                <div className="col-span-2 lg:col-span-1 ">
                  <div className='relative'>
                    <Label>Periodo de pago</Label>
                    <Select
                      options={options}
                      placeholder="periodo"
                      onChange={handleSelectChange}
                      className="pl-[62px] dark:bg-dark-900"
                      defaultValue={inputs.term || "daily"}
                    />
                      <span className="absolute left-0 top-2/3 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <Clock className="size-6" />
                </span>
                  </div>
                  {
                    inputs.term == 'daily' && (
                      <div className='mt-5'>
                        <div className="flex items-center gap-3">
                          <Checkbox checked={inputs.sunday} onChange={(value) => dispatch(changeValue({ key: "sunday", value }))} />
                          <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                            Incluir domingos
                          </span>
                        </div>
                      </div>
                    )
                  }
                </div>


                {/*  <div className="col-span-2 lg:col-span-1">
                    <Label>Email Address</Label>
                    <Input type="text" value="randomuser@pimjo.com" />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Phone</Label>
                    <Input type="text" value="+09 363 398 46" />
                  </div>

                  <div className="col-span-2">
                    <Label>Bio</Label>
                    <Input type="text" value="Team Manager" />
                  </div> */}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button size="sm" variant="outline" onClick={() => dispatch(closeModal())}>
              Close
            </Button>
            <Button


              size="sm" onClick={onSubmit}>
              {
                isLoading ? (<Spinner></Spinner>) : "prestar"
              }
            </Button>
          </div>
        </form>) : ((<div>

          <CustomPayments instalments={inputs.installments} setIsCustom={setIsCustom} addValues={addCustomValues}></CustomPayments>
        </div>))
      }


    </div>
  </Modal>)
}


function CustomPayments({ instalments, addValues,setIsCustom }) {

  const customVals = Array.from({ length: instalments }, (_, i) => i);
  const { inputs } = useSelector(state => state.form)
  const dispatch =useDispatch()
  const total = inputs.amount+(inputs.amount*inputs.interest_rate/100)
  const [totalAmount,setTotalAmount] = useState(total)

  useEffect(()=>{

    console.log(totalAmount)
    const cuotaAmount =Math.round( totalAmount/instalments )

    console.log(cuotaAmount)

    const defaultInputs = customVals.map(()=>{
      return {
      amount:cuotaAmount,
      date:new Date().toISOString()
    }
    })
    dispatch(changeValue({key:"customValues",value:defaultInputs}))
  },[])
  
 function onChange({ index, amount, date }) {
  const MAX_TOTAL = total; // 👉 tu máximo permitido

  // Calcula la suma de todos los montos actuales, 
  // reemplazando el valor modificado por el nuevo 'amount'
  const newTotal = inputs.customValues.reduce((sum, q, i) => {
    if (i === index) {
      return sum + Number(amount); // nuevo valor propuesto
    }
    return sum + Number(q.amount);
  }, 0);

  
  if (newTotal > MAX_TOTAL) {
   // alert("El monto total supera el máximo permitido.");
    return; // 🚫 Bloquea la actualización
  }

  setTotalAmount(newTotal)


  addValues({
    index,
    amount,
    date
  });
}


  return (
    <div className='no-scrollbar max-h-screen-80  p-4'>
      
      <h2 className='text-lg font-bold text-center mb-10'>Personaliza los valores de tus cuotas</h2>
      <p className='mb-5'>Total de los pagos ${total}/<span className={`${totalAmount<total ?  'text-red-700' : 'text-green-600'}`}>{totalAmount}</span></p>
     
      <div className='custom-scrollbar h-[450px] overflow-y-auto'>
         {customVals.map((_, index) => (
        <div key={(index+23)} className='flex gap-2 w-full mb-6'>
          <div className='w-1/2'>
            <DatePicker
              id={"date-picker"+index}
              label={"Fecha del pago "+(index+1)}
              placeholder="Select a date"
              defaultDate={inputs.customValues[index]?.date }
              
              onChange={(dates, currentDateString) => {
                // Handle your logic
                console.log(dates)
                console.log({ dates, currentDateString });
                console.log(index)
                onChange({ index, date:currentDateString,amount:inputs.customValues[index].amount })

              }}

            />


            {/*   {
                  errors.first_payment_date ?
                    (
                      <span className='text-red-600'>
                        {errors.first_payment_date}
                      </span>
                    ) : ""
                } */}
          </div>
          <div className='relative w-1/2'>
            <Label>monto de la cuota {(index+1)}</Label>
            <Input

              className='pl-[62px]'
              range={1000}
              onChange={(e) => onChange({ index, amount: e.target.value,date:inputs?.customValues[index].date })}
              value={inputs?.customValues[index]?.amount }
              type="number"
            />
             <span className="absolute left-0 top-2/3 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <DollarSign className="size-6" />
               </span>
               <button
               onClick={()=>{

                console.log(total)
               
                const newAmount= total-(totalAmount-inputs.customValues[index].amount)

                onChange({ index, amount:newAmount ,date:inputs?.customValues[index].date })
               }}
               className="absolute bg-green-400 text-white right-0 top-2/3 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400 rounded-tr-lg rounded-br-lg">
  <ArrowBigUp className="size-6" />
</button>
          </div>
        </div>
      ))}
      </div>

      <button className='bg-blue-600 text-white p-3 rounded-md' onClick={()=>{
       
          if(total==totalAmount){
            
            setIsCustom(false)
          }
      }}>terminar</button>

    </div>
  )
}


import { DollarSign,ArrowBigUp,Percent,Hash, Clock  } from 'lucide-react';
import { setLoans } from '../../redux/slices/loansSlice';
import { setPayments } from '../../redux/slices/paymentsSlice';
import { setStats } from '../../redux/slices/clientsSlice';

export default AddLoanModal;