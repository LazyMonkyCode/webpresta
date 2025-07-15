
import Loan from './local/Loan.js';
import Payment from './local/Payment.js';

class ClientsService {

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


  async getTotalClients(params)  {
    
    try {


      const totalQuery = {
      select: `COUNT(id) as total`,
    }

      const client =await window.electron.database.select("clients", totalQuery,[],{one: true})

      return client
      
    } catch (error) {
      console.log(error)
    }
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

  async getClients(filter, page = 1, limit = 5) {


    const filterString = this.filters(filter)

    console.log("filterString", filterString)

    const select = `DISTINCT clients.*,
    -- Préstamos
    COUNT(DISTINCT l.id) AS total_loans,
    COUNT(DISTINCT CASE WHEN l.status = 'active' THEN l.id END) AS total_active_loans,
    COUNT(DISTINCT CASE WHEN l.status = 'completed' THEN l.id END) AS total_completed_loans,
    COUNT(DISTINCT CASE WHEN l.status = 'canceled' THEN l.id END) AS total_canceled_loans,
    COUNT(DISTINCT CASE WHEN l.status = 'pending' THEN l.id END) AS total_pending_loans,
    -- Pagos
    COUNT(DISTINCT p.id) AS total_payments,
    COUNT(DISTINCT CASE WHEN p.status = 'paid' THEN p.id END) AS total_paid_payments,
    COUNT(DISTINCT CASE WHEN p.status = 'pending' THEN p.id END) AS total_pending_payments,
    COUNT(DISTINCT CASE WHEN p.status = 'expired' THEN p.id END) AS total_expired_payments,
    COUNT(DISTINCT CASE WHEN p.status = 'incomplete' THEN p.id END) AS total_incomplete_payments,
    SUM(
    CASE 
      WHEN p.status = 'expired' THEN p.total_amount
      WHEN p.status = 'incomplete' THEN p.left_amount
      ELSE 0
    END
  ) AS total_debt_payments
  
  `;


    const query = {
      select: select,
      leftJoin: [
        {
          table: 'loans l ',
          on: 'clients.id = l.client_id'
        },
        {
          table: 'payments p',
          on: `l.id = p.loan_id`
        }
      ],
      // orderBy: `${!filter.nickname ? 'clients.id DESC' : ''}`,
      where: `${filterString}`,
      having: `total_loans >= ${filter?.loansLen ?
        filter.loansLen == "sin prestamos activos" ? 0 : filter.loansLen : 0}`,
      limit: limit,
      offset: ((page - 1) * limit),
      groupBy: `clients.id`,
      orderBy: `clients.id DESC`
    };


    /* const loan = new Loan({
      label: "Préstamo de prueba",
      amount: 1000,
      interest_rate: 5,
      term: 7,
      client_id: 3,
      status: "completed",
      disbursement_date: new Date().toISOString().split('T')[0],
      first_payment_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      user_id: 1,
      purpose: "Test",
      interest_type: "fixed"
    })
  
    await loan.insert()
  
    const payment = new Payment({
      loan_id:3,
          label:"Pago de prueba",
          amount:1000,
          total_amount:"1000",
          interest_amount:"1000",
          paid_amount:"1000",
          left_amount:"1000",
          late_days:0,
          payment_date:new Date().toISOString().split('T')[0], 
          status:"paid",
          payment_method:"cash",
          notes:"notes  ",
          
          user_id:1
    })
    await payment.insert() */

    const clients = await window.electron.database.select("clients", query)
    //console.log(clients)

    // return clients
    const totalQuery = {
      select: `COUNT(DISTINCT clients.id) as total,COUNT(DISTINCT l.id) AS total_loans`,
      leftJoin: [
        {
          table: 'loans l ',
          on: 'clients.id = l.client_id'
        },
        {
          table: 'payments p',
          on: `l.id = p.loan_id`
        }
      ],
      where: `${filterString}`,
      having: `total_loans >= ${filter?.loansLen ? filter.loansLen == "sin prestamos activos" ? 0 : filter.loansLen : 0}`,
    }

    const totalClients = await window.electron.database.select("clients", totalQuery)
    console.log("totalClients", totalClients)

    return {
      clients,
      total: totalClients ? totalClients[0].total : 0,
    }
  }
}


export default ClientsService;