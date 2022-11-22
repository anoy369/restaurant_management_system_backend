const express = require('express');
const connection = require('../connection')
const router = express.Router()

var auth = require('../services/authentications')
var checkRole = require('../services/checkRole')

//Category Add API
router.post('/add', auth.authenticateToken, checkRole.checkRole, (req, res, next) => {
    let category = req.body;
    var query = "insert into category (name) values(?)";
    connection.query(query, [category.name], (err, results) => {
        if(!err){
            return res.status(200).json({message: "Category Added Successfully"})
        } else {
            return res.status(500).json(err)
        }
    })
})

//Category Get API
router.get("/get", auth.authenticateToken, (req, res) => {
    var query = "select *from category order by name";
    connection.query(query, (err, response) => {
      if (!err) {
          return res.status(200).json(response);
      } else {
        return res.status(500).json(err);
      }
    });
});

//Category Update API
router.patch('/update', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    let product = req.body;
    var query = "update category set name=? where id=?";
    connection.query(query,[product.name, product.id], (err, results) => {
        if(!err){
            if(results.affectedRows == 0){
                return res.status(404).json({message:"Category id does not exist!"});
            } else {
                return res.status(200).json({message:"Category has been updated!"})
            }
        } else {
            return res.status(500).json(err);
        }
    })
})

//Category Delete API
router.delete('/delete/:id', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    const id = req.params.id
    var query = "delete from category where id=?"
    connection.query(query,[id],(err, response) => {
       if(!err){
        if(results.affectedRows == 0){
            return res.status(404).json({message:"Category id does not exist!"});
        } else {
            return res.status(200).json({message:"Category has been deleted!"})
        }
       } else {
           return res.status(500).json(err);
       }
    })
})

module.exports = router;