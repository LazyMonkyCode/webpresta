
import Loan from './local/Loan.js';
import Payment from './local/Payment.js';

class PaymentsService {

  constructor() {
    // Aquí puedes inicializar cualquier cosa que necesites para el servicio
    // Por ejemplo, una conexión a la base de datos o una API   

    this.payments_status = {
      "pagadas": "paid",
      "pendientes": "pending",
      "expiradas": "expired",
      "incompletas": "incomplete"
    }

    this.loans_status = {
      'En curso': "active",
      'Completado': "completed",
      'Cancelado': "canceled",
      'Pendiente': "pending"
    }
  }


  async payPayment(id,data){


    try {
     // console.log(data)
      const payment =new Payment({id})
      const loan = new Loan({id:data.loan_id})

      const loanData = await loan.getLoanById()

      const update_loan = await loan.update(["paid_amount","left_amount","paid_installments","status"],
       [ loanData.paid_amount+data.paid_amount,
         loanData.left_amount-data.paid_amount,
         data.status == "paid" ? loanData.paid_installments+1 : loanData.paid_installments,
         (loanData.paid_installments+1) == loanData.installments  &&  data.status == "paid" ?  "completed" : loanData.status
         ]
      )
      
      if(update_loan ==false  ) return {error:"hubo un problema al actualizar los datos del prestamo "}
      
     
      const update_payment = await payment.update(Object.keys(data),Object.values(data))
      
      if(update_payment ==false  ) return {error:"hubo un problema al actualizar los datos del pago "}


      return true
    } catch (error) {
      console.log(error)
      return false
    }
      


   
    
  }

  
  async getWeekPayments (filter){

   /*  const start = getMonday(new Date())
    const end = getSunday(new Date())
 */
    console.log("filter:----------------------------->",filter)

    try {
        const fetch = await window.database.models.Payments.getPayments({
            select:`payments.id as payment_id,
                payments.label as label,
                payments.amount as monto,
                payments.status,
                payments.loan_id,
                strftime('%Y-%m-%d', payments.payment_date) AS payment_day,  
                c.nickname AS client_name,
                l.label as loan_label, l.total_amount as loan_total_amount`,
                    
            where:`(payments.payment_date >= '${filter.start}' 
            AND payments.payment_date <= '${filter.end}')
            AND (payments.paid_date IS NULL OR payments.paid_date = 'null') 
            AND (payments.status = 'pending' OR payments.status = 'expired')`,
                    
            joins:`JOIN loans l ON payments.loan_id = l.id   
                JOIN clients c ON l.client_id = c.id `,
        })

        console.log("fetch:----------------------------->",fetch)
        return fetch
    } catch (error) {
        console.log(error)
        return []
    }
}


  filters(filter) {


    if (!filter) return ""

    let filterString = `1=1`;

    let payments;
    let loans;

    if (filter.nickname) {
      filterString += ` AND clients.nickname LIKE '%${filter.nickname}%'`
    }

    if (filter.payments.length) {
      payments = filter.payments.map(payment => `'${this.payments_status[payment]}'`).join(',')
      filterString += payments ? ` AND  p.status IN (${payments})` : '';
    }
    if (filter.loans) {
      loans = filter.loans.map(loan => `'${this.loans_status[loan]}'`).join(',')
      filterString += loans ? ` AND  l.status IN (${loans})` : '';
    }


    return filterString
  }




  async getClientById(id) {
    try {
      const query = {}

      const client =await window.electron.database.select("clients", {
        where: `id = ?`,
        

      },[id],{one: true})

      const clientInformation =await window.electron.database.select("information", {
        where: `client_id = ?`,

      },[id],{one: true})
      console.log("information", clientInformation)

      console.log("client", client)

      return {
        ...client,
        ...clientInformation
      }
    } catch (error) {
      console.log("Error al obtener el cliente por ID:", error);
      return null;
    }
  }


  async getClientPayments(filter, page = 1, limit = 5) {



  /*   const filterString = this.filters(filter)

    console.log("filterString", filterString) */

    const select = `payments.*,l.id as loan_id,l.label as loan_label`;


    const query = {
      select: select,
        leftJoin: [
        {
          table: 'loans l ',
          on: 'l.id = payments.loan_id  '
        },
         {
          table: 'clients c',
          on: `c.id = l.client_id`
        } 
      ],
      where:"l.client_id =?",
      // orderBy: `${!filter.nickname ? 'clients.id DESC' : ''}`,
    //  where: `${filterString}`,
      /* having: `total_loans >= ${filter?.loansLen ?
        filter.loansLen == "sin prestamos activos" ? 0 : filter.loansLen : 0}`,
      limit: limit,
      offset: ((page - 1) * limit), */
      //groupBy: `clients.id`,
      orderBy: `payments.payment_date ASC`,
      offset:(page-1)*limit,
      limit:limit,
    };


   

    const payments = await window.electron.database.select("payments", query,[filter.client_id])
    console.log(payments,"asdasdukahsdkasjd")

     const totalQuery = {
      select: `COUNT(payments.id) as total`,
      leftJoin: [
        {
          table: 'loans l ',
          on: 'l.id = payments.loan_id  '
        },
         
      ],
       where: `l.client_id=?`,

       
      
    }

    const total = await window.electron.database.select("payments", totalQuery,[Number(filter.client_id)])
    console.log("total payments", total)

    return {
      payments,
      total: total ? total[0].total : 0,
    } 
  }


  async getMonthlyPercent(params) {
    
    try {

      const select = `SUM(CASE WHEN payments.status = 'paid' THEN payments.total_amount  ELSE 0 END )  as paid_monthly_amount,
      SUM(CASE WHEN payments.status = 'incomplete' THEN payments.paid_amount ELSE 0 END) AS incomplete_monthly_amount,
      
       SUM(CASE 
        WHEN payments.status IN ('paid','expired','pending', 'incomplete') THEN payments.total_amount 
        ELSE 0 
      END) AS total_expected_monthly_amount

      `
      
       const query = {
      select: select,
     
      where: `payments.payment_date BETWEEN  date('now', 'start of month')  AND date('now', 'start of month', '+1 month', '-1 day')`,
      
    };

    

    const update = await window.electron.database.update("payments", {
     columns: ['status','paid_amount','left_amount'],
    where :"id=?"
      
    },['paid',65000,0,1])

    console.log(update)

    const payments = await window.electron.database.select("payments", query,[],{one:true})

    console.log(payments,"paymentsasdasdasdas")

    
    if(payments){
      
      const total = payments.total_expected_monthly_amount

      const totalPaid = payments.paid_monthly_amount +  payments.incomplete_monthly_amount

      const percent  =totalPaid>0 ? Math.round( (totalPaid/total )*100)  : 0
      
      //console.log(percent)

      return {
        total_expected_monthly_amount:payments.total_expected_monthly_amount,
        tota_paid_monthly:payments.paid_monthly_amount +  payments.incomplete_monthly_amount,
        percent
      }
    }

    } catch (error) {
      console.log(error)
    }


  }

  async getLoanPayments(filter, page = 1, limit = 5) {

    const select = `payments.*,l.label as loan_label`;

    const query = {
      select: select,
      leftJoin: [
        {
          table: 'loans l ',
          on: 'l.id = payments.loan_id  '
        },
         /* {
          table: 'clients c',
          on: `c.id = l.client_id`
        }  */
      ],
      where: `loan_id=?`,
      offset:(page-1)*limit,
      limit:limit,
      orderBy: `payment_date ASC`
    };


    const payments = await window.electron.database.select("payments", query,[filter.loan_id])
    
    console.log(payments,"payments")
    
   const totalQuery = {
      select: `COUNT(id) as total`,
       where: `loan_id=?`,
      
    }

    const total = await window.electron.database.select("payments", totalQuery,[filter.loan_id])
    console.log("totalClients", total)

    return {
      payments,
      total: total ? total[0].total : 0,
    } 

    
  }




  
}


export default PaymentsService