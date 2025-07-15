import Payment from "./Payment"



class Loan {


  constructor({
    id = null,
    label = "Prestamo",
    description = "",
    client_id = "",
    amount = "",
    firstPaymentDate = "",
    total_amount = "",
    interest_amount = "",
    status = "active",
    type = "",
    term = "daily",
    interest_rate = 30,
    disbursement_date = "",
    user_id = "",
    purpose = "",
    interest_type = "",
    paid_amount = "",
    left_amount = "",
    installments = 1
  }) {


    this.id = id
    this.label = label
    this.description = description
    this.client_id = client_id
    this.amount = amount
    this.total_amount = total_amount
    this.interest_amount = interest_amount
    this.status = status
    this.type = type
    const first_date = new Date(firstPaymentDate)
    this.first_payment_date = `${first_date.getFullYear()}-${(first_date.getMonth() + 1)}-${first_date.getDate()}`,
      this.term = term
    this.interest_rate = interest_rate
    const disb_date = new Date(disbursement_date)
    this.disbursement_date = `${disb_date.getFullYear()}-${(disb_date.getMonth() + 1)}-${disb_date.getDate()}`,
      this.user_id = user_id
    this.purpose = purpose
    this.interest_type = interest_type
    this.paid_amount = paid_amount
    this.left_amount = left_amount
    this.installments = installments
    this.payments = []
    this.paid_installments
  }



  async getLoanById(){
    
    try {
       const result = await window.electron.database.select('loans',{
                
                where:`id = ?`
            },[this.id],{one:true})

          return result
      
    } catch (error) {
      console.log(error)
      return false
    }
  }
  
    async update(columns,values){


        console.log(columns)
        try {
            const result = await window.electron.database.update('loans',{
                columns,
                where:`id = ?`
            },[...values,this.id])

            console.log(result)

            return true
        } catch (error) {
            console.log(error)
            return false
        }
        
    }


    async delete() {
    try {
      

      const result =await window.electron.database.delete("loans", {
        where: `id = ?`,
        
      },[this.id])


      console.log(result)

      /* const clientInformation =await window.electron.database.select("information", {
        where: `client_id = ?`,

      },[id],{one: true})
      console.log("information", clientInformation)

      console.log("client", client) */

      return true

    } catch (error) {
      console.log("Error al obtener el cliente por ID:", error);
      return null;
    }
  }


  async setLabel() {

    try {
      const loans = await window.electron.database.select("loans", {
        selecct: "id",
        where: "client_id=?",

      }, [this.client_id])

      this.label = "Prestamo " + (loans.length + 1)
    } catch (error) {
      console.log(error)
    }
  }

  async insert({ dates, sunday }) {

    try {

      await this.setLabel()
      this.interest_amount = Math.round(this.amount * this.interest_rate / 100)
      this.total_amount = Number(this.amount) + Number(this.interest_amount
)
      //TODO: save loan in the database
      const result = await window.electron.database.insert('loans',
        ['label', 'description', 'type', 'installments', 'amount', 'interest_amount', 'total_amount', 'paid_amount', 'client_id',
          'interest_rate', 'status', 'term', 'disbursement_date', 'left_amount', 'first_payment_date', 'user_id', 'purpose', 'interest_type'],
        [
          this.label, this.description, this.type, this.installments, this.amount, this.interest_amount, this.total_amount, 0, this.client_id,
          this.interest_rate, this.status, this.term, this.disbursement_date, this.total_amount, this.first_payment_date, this.user_id, this.purpose, this.interest_type
        ])

      this.id = result.lastInsertRowid

      //TODO: generate and save payments for loan
      await this.generatePayments(dates, sunday)

      //console.log("generate payments")

      return this.loanToObject()

    } catch (error) {

      console.log(error)

      return {
        error: error.message
      }
    }




  }

 
 

  calculatePaymentsDate2 = (date, sunday, i) => {
 const [year, month, day] = date.split('-');
const payDate = new Date(Number(year), Number(month) - 1, Number(day)); // meses empiezan en 0
  
  console.log(i," iteracion",date,payDate)
  
  
  
  if (this.term === "daily") {

    

    payDate.setDate(
      payDate.getDay==6 && !sunday ? payDate.getDate()+2 :
      payDate.getDate()+1
    )

  } else if (this.term === "weekly") {
    payDate.setDate(payDate.getDate() + 7);
  } else if (this.term === "monthly") {
    payDate.setDate(payDate.getDate() + 30);
  } else if (this.term === "fortnightly") {
    payDate.setDate(payDate.getDate() + 15);
  }

  const anio1 = payDate.getFullYear();
  const mes1 = String(payDate.getMonth() + 1).padStart(2, "0");
  const dia1 = String(payDate.getDate()).padStart(2, "0");

  const ndate = `${anio1}-${mes1}-${dia1}`;
  return ndate;
};


  async generatePayments(dates, sunday) {

    try {

      //console.log("asdasjkdh121",this.first_payment_date,sunday)

      //const payDate = new Date(this.first_payment_date);
      //console.log("asdasjkdh121",this.first_payment_date,payDate)
      let _payment_date = this.first_payment_date
      
      for (let i = 0; i < this.installments; i++) {

      
        console.log(_payment_date)
        
      _payment_date  = this.term == "custom" ? dates[i].dates :  this.calculatePaymentsDate2(_payment_date,sunday,i)

        let payment_total_amount;
        let payment_interest_amount;
        let payment_amount;


         //console.log(dates)

        if (this.term == "custom") {
          console.log("custom")
          payment_total_amount = dates[i].amount
          payment_interest_amount = Math.floor(payment_total_amount * this.interest_rate / 100)
          payment_amount = payment_total_amount - payment_interest_amount


        } else {
          console.log("no custom")
          payment_total_amount = Math.floor(this.total_amount / this.installments),
            payment_interest_amount = Math.floor(this.interest_amount / this.installments)
          payment_amount = Math.floor(this.amount / this.installments)

        }

        if(i==0){
          const payments_total_amount = payment_total_amount * this.installments
          console.log(payments_total_amount,"paymets totoal amiounasd")
          
          const diference   = this.total_amount-payments_total_amount 
          console.log(diference,"paymets totoal amiounasd")

          payment_total_amount =diference!=0  ?  payment_total_amount+diference : payment_total_amount+diference

                    console.log(payment_amount,"paymets totoal amiounasd")

        }
         
        const payment = new Payment({
          label: `Pago ${(i + 1)}`,
          loan_id: this.id,
          total_amount: payment_total_amount,
          interest_amount: payment_interest_amount,
          payment_date: _payment_date,
          status: "pending",
          amount: payment_amount,
          user_id: this.user_id,
          left_amount: payment_total_amount,
          paid_amount: 0,
          loan_label: this.label
        })


        console.log(payment,"paymenasdasd")
       const _result =await payment.insert()
         //console.log(_result,"paymentasdjkhqwjasd")
 
         

        this.payments.push(payment.paymentToObject());
   
       
      }
      return true
    } catch (error) {
      console.log("error:----------------------------->", error);
      return [];
    }

  }


  loanToObject() {

    return {
      id: this.id,
      label: this.label,
      description: this.description,
      client_id: this.client_id,
      amount: this.amount,
      total_amount: this.total_amount,
      interest_amount: this.interest_amount,
      status: this.status,
      type: this.type,
      term: this.term,
      installments: this.installments,
      first_payment_date: this.first_payment_date,
      interest_rate: this.interest_rate,
      disbursement_date: this.disbursement_date,
      user_id: this.user_id,
      purpose: this.purpose,
      interest_type: this.interest_type,
      paid_amount: this.paid_amount,
      left_amount: this.left_amount,
      paid_installments:this.paid_installments
      //payments:this.payments
    }
  }


}


export default Loan;