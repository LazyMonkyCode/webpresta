

 const  notifications_types = {

    update_profile: {
        type: 'update_profile',
        message: '{name} ha actualizado su perfil',
        link: '/clients/{id}',
    },

    loan_request: {
        type: 'loan_request',
        message: '{name} ha enviado una solicitud para tu préstamo',
        link: '/clients/{id}',
    },

    loan_created: {
        type: 'loan_created',
        message: 'Se ha creado un nuevo préstamo',
        link: '/loans',
    },

    pending_loan_deleted: {
        type: 'pending_loan_deleted',
        message: '{name} ha eliminado su solicitud de préstamo',
        link: '/loans/{id}',
    },


    loan_approved: {
        type: 'loan_approved',
        message: 'Préstamo aprobado con éxito',
        link: '/loans',
    },

    loan_rejected: {
        type: 'loan_rejected',
        message: 'Préstamo rechazado con éxito',
        link: '/loans',
    },

    loan_paid: {
        type: 'loan_paid',
        message: 'Préstamo pagado con éxito',
        link: '/loans',
    },

    loan_overdue: {
        type: 'loan_overdue',
        message: 'Préstamo vencido con éxito',
        link: '/loans',
    },



}





export default notifications_types;