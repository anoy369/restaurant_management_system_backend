const { Router } = require('express');
const express = require('express');
const connection = require('../connection')
const router = express.Router()

var auth = require('../services/authentications')
var checkRole = require('../services/checkRole')

//Product Add API
router.post('/add', auth.authenticateToken, checkRole.checkRole, (req, res, next) => {
    let product = req.body;
    var query = "insert into product (name,categoryId,description,price,status) values(?,?,?,?,'true')";
    connection.query(query, [product.name,product.categoryId,product.description,product.price], (err, results) => {
        if(!err){
            return res.status(200).json({message: "Product Added Successfully"}) 
        } else {
            return res.status(500).json(err)
        }
    })
})

//Product Get API
router.get("/get", auth.authenticateToken, (req, res) => {
    var query = "select p.id,p.name,p.description,p.price,p.status,c.id as categoryID,c.name as categoryName from product as p INNER JOIN category as c where p.categoryId = c.id";
    connection.query(query, (err, response) => {
      if (!err) {
          return res.status(200).json(response);
      } else {
        return res.status(500).json(err);
      }
    });
});

//product by category API
router.get('/getByCategory/:id', auth.authenticateToken,(req, res, next) => {
    const id = req.params.id;
    var query = "select id,name from product where categoryId=? and status='true'";
    connection.query(query,[id],(err, results) => {
        if(!err){
            return res.status(200).json(results)

        } else {
            return res.status(500).json(err);
        }
    })
})

//Product details by product id API
router.get('/getById/:id', auth.authenticateToken, (req, res, next) => {
    const id = req.params.id;
    var query = "select id,name,description,price from product where id=?"
    connection.query(query,[id],(err, results) => {
        if(!err){
            return res.status(200).json(results[0])

        } else {
            return res.status(500).json(err);
        }
    })
})

//Product Update API
router.patch('/update', auth.authenticateToken, checkRole.checkRole, (req, res, next) => {
    let product = req.body;
    var query = "update product set name=?,categoryId=?,description=?,price=? where id=?";
    connection.query(query,[product.name,product.categoryId,product.description,product.price,product.id], (err, results) => {
        if(!err){
            if(results.affectedRows == 0){
                return res.status(404).json({message:"Product id does not exist!"});
            } else {
                return res.status(200).json({message:"Product has been updated!"})
            }
        } else {
            return res.status(500).json(err);
        }
    })
})


//product delete API
router.delete('/delete/:id', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    const id = req.params.id
    var query = "delete from product where id=?"
    connection.query(query,[id],(err, response) => {
       if(!err){
        if(response.affectedRows == 0){
            return res.status(404).json({message:"Product id does not exist!"});
        } else {
            return res.status(200).json({message:"Product has been deleted!"})
        }
       } else {
           return res.status(500).json(err);
       }
    })
})


router.patch('/updateStatus', auth.authenticateToken, checkRole.checkRole, (req, res, next) => {
    let product = req.body
    var query = "update product set status=? where id=?"
    connection.query(query,[product.status, product.id],(err,response) => {
        if(!err){
         if(response.affectedRows == 0){
             return res.status(404).json({message:"Product id does not found!"});
         } else {
             return res.status(200).json({message:"Product status updated successfully!"})
         }
        } else {
            return res.status(500).json(err);
        }
     })        
})
module.exports = router;