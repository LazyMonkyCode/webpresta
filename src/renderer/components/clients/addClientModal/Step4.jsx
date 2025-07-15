



import React, { useEffect } from 'react'
import { useSelector, useDispatch } from "react-redux";
import { setInputs, resetForm, changeValue } from '../../../redux/slices/formSlice';
import { useWizzar } from '../../FormWizzard';
import Label from '../../../form/Label';
import Client from '../../../services/local/Client';
import { closeModal } from '../../../redux/slices/modalSlice';
import { toast } from 'react-toastify';
import { addClient,setClients } from '../../../redux/slices/clientsSlice';
const Step4 = ({ step }) => {

  const { currentStep, registerOnFinish, setIsLoading } = useWizzar()

  const { inputs } = useSelector(state => state.form)
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)

  const {clients } = useSelector(state => state.clients)
  useEffect(() => {

    registerOnFinish(async () => {
      setIsLoading(true)

      const client = new Client({
        nickname: inputs.nickname,
        name: inputs.name,
        lastname: inputs.lastname,
        email: inputs.email,
        houseNumber: inputs.houseNumber,
        houseStreet: inputs.houseStreet,
        phone: inputs.phone,
        user_id: user.id,
      })

      await window.electron.messages.onMessage((type, title, data) => {
        if (type == "error") {
          toast.error(title);
        }
        console.log("message", type, title, data)
      })
      await client.insert()


      setTimeout(() => {

       // const insertClients = clients.slice(0, clients.length-1)
      
        dispatch(setClients([client.getClientOb(),...clients]))
        setIsLoading(false)
        toast.success("Cliente agregado correctamente")
        dispatch(closeModal())
        //  alert("finish")
      }, 1000)

      //  alert("finish")
    })
    return () => {

    }
  }, [inputs])

  if (currentStep != step) return

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-10 text-center">Agregar cliente </h2>

      <div className='flex  justify-center items-center '>


        <div className='w-1/2'>
          <Label>Nickname</Label>
          <Label>Nombre y Apellido</Label>
          <Label>Direccion</Label>
          <Label>Email</Label>
          <Label>Telefono</Label>


        </div>
        <div className='w-1/2'>
          <Label>{inputs.nickname}</Label>

          <Label>{inputs.name ? inputs.name : "N/A"} {inputs.lastname ? inputs.lastname : "N/A"}</Label>
          <Label>{inputs.houseStreet ? inputs.houseStreet : "N/A"} {inputs.houseNumber ? inputs.houseNumber : "N/A"}</Label>
          <Label>{inputs.email ? inputs.email : "N/A"}</Label>
          <Label>{inputs.phone ? inputs.phone : "N/A"}</Label>
        </div>
      </div>

    </div>)
}



export default Step4