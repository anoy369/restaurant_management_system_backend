const express = require('express')
const connection = require('../connection')
const router = express.Router()
let ejs = require('ejs')
let pdf = require('html-pdf')
let path = require('path')
var fs = require('fs')
var uuid = require('uuid')
var auth = require ('../services/authentications')

//report generate API
router.post('/generateReport', auth.authenticateToken,(req, res) => {
    const generatedUuid = uuid.v1()
    const orderDetails = req.body
    var productDetailsReport = JSON.parse(orderDetails.productDetails)

    query = "insert into bill (name,uuid,email,contactNumber,paymentMethod,total,ProductDetails,createdBy) values (?,?,?,?,?,?,?,?)"
    connection.query(query,[orderDetails.name,generatedUuid,orderDetails.email,orderDetails.contactNumber,orderDetails.paymentMethod,orderDetails.totalAmount,orderDetails.productDetails,res.locals.email],(err,results) => {
        if(!err){
            ejs.renderFile(path.join(__dirname,'',"report.ejs"),{
                productDetails:productDetailsReport,
                name:orderDetails.name,
                email:orderDetails.email,
                contactNumber:orderDetails.contactNumber,
                paymentMethod:orderDetails.paymentMethod,
                totalAmount:orderDetails.totalAmount
             },(err,results)=>{
                if(err){
                    return res.status(500).json(err)
                } else {
                    pdf.create(results).toFile('./generated_pdf/'+ generatedUuid +".pdf",function(err,data){
                        if(err){
                            console.log(err)
                            return res.status(500).json(err);
                        } else {
                            return res.status(200).json({uuid: generatedUuid})
                        }
                    })
                }
             })
        } else {
            return res.status(500).json(err)
        }
    })
})

//Get pdf API
router.post('/getpdf', auth.authenticateToken, function(req,res){
    const orderDetails = req.body;
    const pdfpath = './generated_pdf/'+ orderDetails.uuid + '.pdf';
    if(fs.existsSync(pdfpath)){
        res.contentType("application/pdf");
        fs.createReadStream(pdfpath).pipe(res)
    } else {
        var productDetailsReport = JSON.parse(orderDetails.productDetails)
        ejs.renderFile(path.join(__dirname,'',"report.ejs"),{
            productDetails:productDetailsReport,
            name:orderDetails.name,
            email:orderDetails.email,
            contactNumber:orderDetails.contactNumber,
            paymentMethod:orderDetails.paymentMethod,
            totalAmount:orderDetails.totalAmount
         },(err,results)=>{
            if(err){
                return res.status(500).json(err)
            } else {
                pdf.create(results).toFile('./generated_pdf/' + orderDetails.uuid + ".pdf",function(err,data){
                    if(err){
                        console.log(err)
                        return res.status(500).json(err);
                    } else {
                        res.contentType("application/pdf");
                        fs.createReadStream(pdfpath).pipe(res)
                    }
                })
            }
         })
    }
})

// GET Bills API
router.get('/getBills',auth.authenticateToken,(req,res) => {
    var query = "select *from bill order by id DESC"
    connection.query(query,(err, data) => {
        if(!err){
            
            return res.status(200).json(data)
        } else {
            
            return res.status(500).json(err)
        }
    })
})

// Delete pdf API
router.delete('/delete/:id', auth.authenticateToken,(req,res) => {
    const id = req.params.id
    var query = "delete from bill where id=?"
    connection.query(query,[id],(err, response) => {
        if(!err){
         if(response.affectedRows == 0){
             return res.status(404).json({message:"Bill id does not exist!"});
         } else {
             return res.status(200).json({message:"Bill has been deleted!"})
         }
        } else {
            return res.status(500).json(err);
        }
     })
})
module.exports = router;