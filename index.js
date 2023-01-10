require('dotenv').config()

const TWILIO_BASE_URL = 'https://verify.twilio.com/v2/'
const TWILIO_ACCOUNT_SID = 'AC34612da44fa500d68505a093a80dc296'
const TWILIO_AUTH_TOKEN = '6ba6d516fd66c051e1867c44d7384d88'

const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const { application } = require('express');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')

//const authy = require('authy')('4SmS6TCQ9QnN4mB7ll2fJB2u29jXJyc5');
//const authy = require('authy')('zetEFPBJyMtqqSIVQsaXKFOPhbT4Yw1l');

let app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors())



    app.post("/phonevalidate", (req,res)=>{
        
        let phone = req.body.phone
         
        client.verify.v2.services('VA26cea0c73b6f8e4a017b40c78a3caacf')
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

    app.post("/verify", (req,res)=>{
        
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
            .services('VA26cea0c73b6f8e4a017b40c78a3caacf')
            .verificationChecks
            .create({to: `+55${ phone}}`,code })
            .then(verification =>{
                if(verification.status == "approved"){
                    res.status(200).json({
                        status:"Conexão realizada com sucesso"
                    })
                }
            
           
            }).catch(error=>{
                res.status(400).json({
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


    app.post("/auth", (req,res)=>{
        let users = [
            {user:"saviodba@gmail.com", pass:"123456",phone:"11986217465"},
            {user:"nandasavio@gmail.com", pass:"123456",phone:"11986217466"},
            {user:"alicemendonca@gmail.com",pass:"123456",phone:"11986217467"}
        ]

        let { user, pass  } = req.body;
        
        const resultado = users.find(use=> use.user == user);
        const password = users.find(use=> use.pass == pass);
        
        if(resultado && password) {       
            client.verify.v2.services('VA26cea0c73b6f8e4a017b40c78a3caacf')
                .verifications
                .create(
                    {
                        locale:"pt-BR",
                        to: `+55${ resultado.phone}}`, 
                        channel: 'sms'
                    })
                .then(verification =>{
                    res.status(200).json({
                        erro:false,
                        phone:resultado.phone,
                        status:verification.status
                    })
                }).catch(error=>{
                        res.status(400).json({                            
                        erro:error
                    })
                }) ; 
            } else {
                res.status(400).json({                   
                    mensage:'Usuário/Senha incorretos'
                })
            }           
      

    })

    app.post("/_auth", (req,res)=>{
        let users = [
            {user:"saviodba@gmail.com", pass:"123456"},
            {user:"nandasavio@gmail.com", pass:"123456"},
            {user:"alicemendonca@gmail.com",pass:"123456"}
        ]
        let {user, pass } = req.body;

        const resultado = users.find(use=> use.user == user);
        console.log(resultado)

        res.status(200).json({
            error:false,
            message:"Usuário logado com sucesso!",
            user,
            pass
        })
    })

    app.post('/register',(req,res)=>{
        let {phone, email } = req.body;

        if( (phone != "") && (email != "")){
            authy.register_user(email, phone, 55,function (error, response) {          
            if(error) 
                return res.json( error )
            else  
                return res.json(response)
            
            });  
        } else {
            return res.json({
                success:false,
                message:"Informa email e telefone"
            })
        }
    })

    app.get('/',(req, res)=>{
        let {id } =req.query;

        authy.request_sms(id, function (error, response) {
            if(error) 
                return res.json( error )
            else  
                return res.json(response)
        });
        
    })

    app.get('/status_phone', (req, res)=>{
        let {phone} = req.query;
        authy.phones().verification_start(phone, '1', { via: 'sms', locale: 'en', code_length: '6' }, (error, response)=> {

            if(error) 
            return res.json( error )
        else  
            return res.json(response)
            
        });
    })


    let port = process.env.PORT || 3000
    app.listen(port, ()=>{
        console.log('Server OnLine...')
    })