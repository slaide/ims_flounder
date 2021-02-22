const utility=require("./utility.js")
const database=require("./database")
const mysql=require("mysql")
const path=require('path')
const fs=require("fs")

function check_login_data(req,res){
    //parse login data from req
    console.log(">> check_login_data function")
    utility.parse_data(req,(user_data)=>{
        console.log('>> user_data: ',user_data)   //user_data.password, user_data.email is a string 
        
        database.connect_database((connection)=>{
        
            connection.query("SELECT Email, Password, SSN FROM user WHERE Email = ?", [user_data.email], (err, result)=> {
                if(err) throw err;

                db_data=JSON.parse(JSON.stringify(result))  
                console.log('>> db_data: ', db_data) 
                
                //Check email and password match 
                if(db_data.length!=0 && user_data.password.localeCompare(db_data[0].Password)==0){
                    console.log('>> db_data email: ', db_data[0].Email);
                    console.log(">> Email and password match found, login succesfull")

                    overview_string=fs.readFileSync("../html/overview.html",utility.encoding.utf8)
                    with_email=overview_string.replace("$$EMAIL$$", `"${db_data[0].Email}"`) 
                    res.end(with_email.replace("$$SSN$$", `"${db_data[0].SSN}"`))
                    console.log('>> overview.html file sent back to client')

                    database.disconnect(connection)
                    console.log('>> Database disconnected')
                }
                else{
                    console.log(">> No match found, login unsuccesfull")
                    res.end(fs.readFileSync("../html/index.html",utility.encoding.utf8).replace("$$LOGINSUCCESS$$", "true"))
                    console.log('>> index.html file sent back to client with LOGINSUCCESS=true')
                    database.disconnect(connection)
                    console.log('>> Database disconnected') 
                }
            })
        }) 
    })
}
module.exports.check_login_data=check_login_data
