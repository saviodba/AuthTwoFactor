require('dotenv').config()

const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')

let app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors())



    app.post("/sendcodephone", (req,res)=>{
        
        let phone = req.body.phone
         
        client.verify.v2.services(process.env.TWILIO_V2_SERVICES)
            .verifications
            .create(
                {
                    locale:"pt-BR",
                    to: `+55${ phone }}`, 
                    channel: 'sms'
                })
            .then(verification =>{
                res.status(200).json({
                    erro:false,
                    phone,
                    status:verification.status
                })
            }).catch(error=>{
                    res.status(400).json({                            
                    erro:error
                })
            }) ; 
                
      

    })

    app.post("/verifycode", (req,res)=>{
        
        let {phone, code  } = req.body;               
        if(code.length != 6) {
            return res.status(200).json({
                erro:true,
                mensagem:'O codigo deve conter 6 digitos'
        })
        } 

        try {

            client.
            verify.v2
            .services(process.env.TWILIO_V2_SERVICES)
            .verificationChecks
            .create({to: `+55${ phone}}`,code })
            .then(verification =>{
                if(verification.status == "approved"){
                    res.status(200).json({
                        status:true
                    })
                }                       
            }).catch(error=>{
                res.status(400).json({
                    status:false,
                    erro:`Falha ao realizar a validação do codigo. Erro ${error.code}`,
                    moreInfo: `https://www.twilio.com/docs/errors/${error.code}`
                })
            })  
        } catch (error) {
            res.status(400).json({
                erro:error
            }) 
        }


    })
    
    let port = process.env.PORT || 3000

    app.listen(port, ()=>{
        console.log('Server OnLine...')
    })