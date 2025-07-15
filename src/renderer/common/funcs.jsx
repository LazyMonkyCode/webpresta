

  export  function formatAmount(amount){

    return new Intl.NumberFormat('de-DE').format(amount)
  }



  export function nowLocale(){
    
    const  date= new Date().toISOString()

    return date.split('T')[0];
  }