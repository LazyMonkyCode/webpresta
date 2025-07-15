
import React,{useEffect} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeModal,changeName } from '../../redux/slices/modalSlice';
import { Modal } from '../ui/modal';
import Label from '../../form/Label';
import Input from '../../form/input/InputField';
import Button from '../ui/button/Button';
import { changeValue, setErrors, setInputs } from '../../redux/slices/formSlice';
import useValidation from '../../hooks/useValidator';

const EditLoanModal = ({ loan, onClose, onSave }) => {


    const {inputs} = useSelector(state=>state.form)
    const {client} = useSelector(state=>state.clients)
    const {errors,validate,validations} = useValidation()

   const dispatch = useDispatch()
     useEffect(() => {
       
 
        setInputs({
          name:client.name || "",
          lastname:client.astname || "",
          email:client.email || "",
          phone:client.phone || "",
          address:client.address || "",
        })
     
       return () => {
         
       }
     }, [])
  

    return (<Modal name={"LOAN_EDIT"} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Editar Prestamo
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
             {/*  <div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Social Links
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div>
                    <Label>Facebook</Label>
                    <Input
                      type="text"
                      value="https://www.facebook.com/PimjoHQ"
                    />
                  </div>

                  <div>
                    <Label>X.com</Label>
                    <Input type="text" value="https://x.com/PimjoHQ" />
                  </div>

                  <div>
                    <Label>Linkedin</Label>
                    <Input
                      type="text"
                      value="https://www.linkedin.com/company/pimjo"
                    />
                  </div>

                  <div>
                    <Label>Instagram</Label>
                    <Input type="text" value="https://instagram.com/PimjoHQ" />
                  </div>
                </div>
              </div> */}
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Nombre</Label>
                    <Input 
                    value={inputs.name || ''}
                    onChange={(e)=>dispatch(changeValue({key:"name",value:e.target.value}))}
                    error={errors.name}
                    type="text"  />
                    {
                      errors.name && (
                        <span className='text-red-500'>
                          {errors.name}
                        </span>
                      )
                    }
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Apellido</Label>
                    <Input type="text"
                    value={inputs.lastname || ''}
                    onChange={(e)=>dispatch(changeValue({key:"lastname",value:e.target.value}))}
                    />
                    {
                      errors.name && (
                        <span className='text-red-500'>
                          {errors.lastname}
                        </span>
                      )
                    }
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Email Address</Label>
                    <Input 
                    
                    value={inputs.email || ''}
                    onChange={(e)=>dispatch(changeValue({key:"email",value:e.target.value}))}
                    type="text"  />
                    {
                      errors.name && (
                        <span className='text-red-500'>
                          {errors.email}
                        </span>
                      )
                    }
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Telefono</Label>
                    <Input type="text" 
                    value={inputs.phone || ''}
                    onChange={(e)=>dispatch(changeValue({key:"phone",value:e.target.value}))} />
                    {
                      errors.name && (
                        <span className='text-red-500'>
                          {errors.phone}
                        </span>
                      )
                    }
                  </div>

                  {/* <div className="col-span-2">
                    <Label>Bio</Label>
                    <Input type="text" value="Team Manager" />
                    {
                      errors.name && (
                        <span className='text-red-500'>
                          {errors.name}
                        </span>
                      )
                    } 
                  </div>*/}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={()=>dispatch(closeModal())}>
                Close
              </Button>
              <Button size="sm" onClick={onSave}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal> )
}



export default EditLoanModal;