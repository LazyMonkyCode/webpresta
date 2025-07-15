import React, { useState, useEffect } from "react";

import Button from "../ui/button/Button";
import LoansServices from '../../services/LoansService'
import Slider from "react-slick";
import LoansService from "../../services/LoansService";
import { useDispatch, useSelector } from "react-redux";

import { setSelectedLoan } from "../../redux/slices/loansSlice";




const LoansList = ({ client, handleEdit }) => {

  const loans = useSelector(state => state.loans)
  // console.log(loans,"asdalskdhaksjdlkoas")
  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024, // para pantallas más pequeñas
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  /*   useEffect(() => {
  
      const fetchLoans = async (params) => {
        
        const loansSerive = new LoansService()
  
        const loansData  = loansSerive.getClientLoans()
      }
  
      return () => {
  
      }
    }, []) */


  return (
    <div className="w-full  ">
      <Slider {...settings}>
        {loans.loans.map((loan) => (
          <div key={loan.id} className={"px-2 py-2 "}>
            <LoanSliderCard loan={loan}  selectedLoanId={loans.selectedLoan?.id}></LoanSliderCard>
          </div>
        ))}
      </Slider>
    </div>
  );
}




const LoanSliderCard = ({ loan, selectedLoanId }) => {
  const dispatch = useDispatch();
  const {selectedLoan} = useSelector(state=>state.loans)
  const isSelected = selectedLoanId === loan.id;
  const progress = (loan.paid_amount/loan.total_amount)*100;

  console.log(progress) 

  return (
    <div
      onClick={() => dispatch(setSelectedLoan(loan))}
      className={`
        cursor-pointer 
        rounded-2xl p-6 text-center shadow-md transform transition-all duration-300
        ${isSelected ? 'scale-105 ring-4 ring-yellow-400 shadow-lg' : 'hover:scale-102'}
        ${loan.status === "active" ? "bg-blue-500 text-white" :
        loan.status === "completed" ? "bg-green-500 text-white" :
        loan.status === "pending" ? "bg-yellow-500 text-white" :
        "bg-red-700 text-white"}
      `}
    >
      <div className="flex justify-between items-center mb-4">
        <span><FaSackDollar size={30} /></span>
        <div>
          <h3 className="text-md font-semibold">{loan.label}</h3>
          <p className="font-bold text-2xl">${formatAmount(loan.amount)}</p>
        </div>
        <div>
          <p className="p-2 rounded-full bg-white text-black text-sm">
            {loan.paid_installments ?loan.paid_installments :0 } / {loan.installments}
          </p>
        </div>
      </div>

      <div className="w-full bg-white/30 rounded-full h-2 overflow-hidden">
        <div
          className="bg-white h-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};




import { formatAmount } from "../../common/funcs";
import { FaSackDollar } from "react-icons/fa6";
export default LoansList