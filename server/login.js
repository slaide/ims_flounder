const utility=require("./utility.js")
const database=require("./database")
const mysql=require("mysql")
const path=require('path')
const fs=require("fs")
//var express = require('express')

function check_login_data(req,res){
    //parse login data from req
    console.log(">> check_login_data function")
    utility.parse_data(req,(user_data)=>{
        console.log('>> user_data: ',user_data)   //user_data.password, user_data.email is a string 
        
        database.connect_database((connection)=>{
        
            connection.query("SELECT Email, Password FROM user WHERE Email = ?", [user_data.email], (err, result)=> {
                if(err) throw err;

                db_data=JSON.parse(JSON.stringify(result))  
                console.log('>> db_data: ', db_data) 
                
                //Check email match 
                if(db_data.length!=0){
                    console.log('>> db_data email: ', db_data[0].Email);
                    //console.log('>> typeof(db_data[0].Email): ', typeof(db_data[0].Email));  //db_data[0].Email is a string 
                    console.log(">> Email match found")

                    //check password match
                    if(user_data.password.localeCompare(db_data[0].Password)==0){
                        console.log(">> Password match")
                        console.log('>> Login succesfull')

                        res.end(fs.readFileSync("../html/overview.html",utility.encoding.utf8))
                        console.log('>> overview.html file sent back to client')
                        database.disconnect(connection)
                        console.log('>> Database disconnected')
                    }
                    else{
                        console.log(">> No password match")
                        database.disconnect(connection)
                        console.log('>> Database disconnected')  
                        
                        //Password don't match.  
                        //display "wrong password" and then the user can try again
                    }
                
                }
                //No email match 
                else{
                console.log(">> No email match found")
                
                //change $$LOGINSUCCESS$$= true 
                res.end(fs.readFileSync("../html/index.html",utility.encoding.utf8))
                console.log('>> index.html file sent back to client')

                database.disconnect(connection)
                console.log('>> Database disconnected')   
                }
            })
        }) 
    })
}
module.exports.check_login_data=check_login_data
