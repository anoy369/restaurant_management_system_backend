const express = require("express");
const connection = require("../connection");
const router = express.Router();

const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();
var auth = require('../services/authentications');
var checkRole = require('../services/checkRole')

 
//User signup API
router.post("/signup", (req, res) => {
  let user = req.body;
  query = "select email,password,role,status from user where email=?";
  connection.query(query, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        query =
          "insert into user(name,contactNumber,email,password,status,role) values(?,?,?,?,'false','user')";
        connection.query(
          query,
          [user.name, user.contactNumber, user.email, user.password],
          (err, results) => {
            if (!err) {
              return res
                .status(200)
                .json({ message: "Successfully Registered!" });
            } else {
              return res.status(500).json(err);
            }
          }
        );
      } else {
        return res.status(400).json({ message: "Email already exist!!" });
      }
    } else {
      return req.statusCode(500).json(err);
    }
  });
});

//User Login API
router.post("/login", (req, res) => {
  const user = req.body;
  query = "select email,password,role,status from user where email=?";
  connection.query(query, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0 || results[0].password != user.password) {
        return res
          .status(401)
          .json({ message: "Icorrect Username or Password" });
      } else if (results[0].status === "false") {
        return res.status(401).json({ message: "Wait for admin approval" });
      } else if (results[0].password == user.password) {
        const response = { email: results[0].email, role: results[0].role };
        const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, {
          expiresIn: "10h",
        });
        res.status(200).json({ token: accessToken });
      } else {
        return res.status(400).json({ message: "Something went wrong!" });
      }
    } else {
      return req.statusCode(500).json(err);
    }
  });
});

var transporter = nodemailer.createTransport({
  service: "hostinger",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

router.post("/forgotPassword", (req, res) => {
  const user = req.body;
  query = "select email,password from user where email=?";
  connection.query(query, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        return res
          .status(200)
          .json({ message: "Password sent successfully to your email." });
      } else {
        var mailOptions = {
          from: process.env.EMAIL,
          to: results[0].email,
          subject: "Password by Restaurant",
          html:
            "<P><b>Your Password for restaurant</b><br>Email:" +
            results[0].email +
            "<br>password:" +
            results[0].password +
            '<br><a href="">Click Here to Login</a></a></P>',
        };
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
        return res
          .status(200)
          .json({ message: "Password sent successfully to your email." });
      }
    } else {
      return req.status(500).json(err);
    }
  });
});

//User Get API
router.get("/get", auth.authenticateToken, checkRole.checkRole, (req, res) => {
  var query =
    "select id,name,email,contactNumber,status from user where role='user'";
  connection.query(query, (err, response) => {
    if (!err) {
        return res.status(200).json(response);
    } else {
      return res.status(500).json(err);
    }
  });
});

//User Update API
router.patch('/update', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    let user = req.body;
    var query = "update user set status=? where id=?";
    connection.query(query,[user.status, user.id], (err, results) => {
        if(!err){
            if(results.affectedRows == 0){
                return res.status(404).json({message:"User id does not exist!"});
            } else {
                return res.status(200).json({message:"User has been updated!"})
            }
        } else {
            return res.status(500).json(err);
        }
    })
})


//User check token API
router.get('/checkToken', auth.authenticateToken, (req, res) => {
    return res.status(200).json({message:"true"})
})

//User change Password API
router.post('/changePasssword', auth.authenticateToken, (req, res) => {
    const user = req.body;
    const email = res.locals.email;
    var query = "select *from user where email=? and password=?";
    connection.query(query, [email,user.oldPassword], (err, results) => {
        if(!err){
            if(results.length <= 0){
                return res.status(400).json({message: "Icorrect old password!"});
            } else if(results[0].password == user.oldPassword){
                query = "update user set password=? where email=?";
                connection.query(query,[user.newPassword, email], (err, results) => {
                    if(!err){
                        return res.status(200).json({message: "Password updated successfully!"})
                    } else {
                        return res.status(500).json(err);
                    }
                })
            } else {
                return res.status(400).json({message: "Something went Wrong"});
            }
        } else {
            return res.status(500).json(err);
        }
    })
})

//User Delete API
router.delete('/delete/:id', auth.authenticateToken, checkRole.checkRole, (req, res) => {
  const id = req.params.id
  var query = "delete from user where id=?"
  connection.query(query,[id],(err, response) => {
     if(!err){
      if(results.affectedRows == 0){
          return res.status(404).json({message:"User id does not exist!"});
      } else {
          return res.status(200).json({message:"User has been deleted!"})
      }
     } else {
         return res.status(500).json(err);
     }
  })
})

module.exports = router;
