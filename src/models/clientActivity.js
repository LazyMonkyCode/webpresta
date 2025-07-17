import mongoose from 'mongoose';

const clientActivitySchema = new mongoose.Schema({

  action: {
    type: String,
    required: true,
        enum: [
            'profile_update',
            'loan_request',
            'password_change',
            'email_verification',
            'phone_verification',
            'pending_loan_deleted',
            'pending_loan_request',
            'pending_loan_update'
        ] 
  }, 
  client_id:{
     type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente'
  } ,  
  details: {
    type: String,
    required: false
  },
  data: {
    type: Object,
    required: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});



const ClientActivity = mongoose.model('ClientActivity', clientActivitySchema);

export default ClientActivity;  