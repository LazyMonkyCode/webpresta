// routes/auth.j


import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail', // o tu proveedor SMTP
  auth: {
    user: process.env.EMAIL_ACCOUNT,
    pass: process.env.EMAIL_PASSWORD
  }
});


export const sendEmail =async(email,subject,html)=>{

    try {
        await transporter.sendMail({
          from: '"Tu App" <'+process.env.EMAIL_ACCOUNT+'>',
          to: email,
          subject,
          html
        });
    
        res.status(200).json({ message: 'Correo de verificación enviado' });
      } catch (error) {
        res.status(500).json({ message: 'Error al enviar el correo', error });
      }

    
}