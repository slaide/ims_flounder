const utility=require("./utility.js")
const database=require("./database")
const fs=require("fs")
const { Console } = require("console")

/**
 * Function to check login data matches to data in database
 * currently expects client data: Email and Password
 * currently responds with: successful/unsuccesful login, error? 
 * @param {Request} req Request object with client data
 * @param {Response} res Response object
 **/

function check_login_data(req,res){
    //parse login data from req
    console.log(">> check_login_data function")
    utility.parse_data(req,(user_data)=>{
        console.log('>> user_data: ',user_data)
        
        database.connection.query("SELECT Email, Password, SSN, Maintenance, Admin FROM user WHERE Email = ?", [user_data.email], (error, result)=> {
            if(error){
                console.log("error selecting attributes user",error)
                if(!error.fatal){
                    database.disconnect(connection)
                }
                return
            }
            db_data=JSON.parse(JSON.stringify(result))  
            console.log('>> db_data: ', db_data) 
            
            //Check email and password match 
            if(db_data.length!=0 && user_data.password.localeCompare(db_data[0].Password)==0){
                console.log('>> db_data email: ', db_data[0].Email);
                console.log(">> Email and password match found, login succesfull")

                string=fs.readFileSync("../html/overview.html",utility.encoding.utf8)
                //Add email to locale storage
                string=string.replace("$$EMAIL$$", `"${db_data[0].Email}"`) 
                //Add SSN to local storage
                string=string.replace("$$SSN$$", `"${db_data[0].SSN}"`)
                //Add Admin to locale storage     
                string=string.replace("$$ADMIN$$", `"${db_data[0].Admin}"`)
                //Add Maintenance to local storage and send file to client
                res.end(string.replace("$$MAINTENANCE$$", `"${db_data[0].Maintenance}"`))

                console.log('>> overview.html file sent back to client')
            }
            else{
                console.log(">> No match found, login unsuccesfull")
                res.end(fs.readFileSync("../html/index.html",utility.encoding.utf8).replace("$$LOGINSUCCESS$$", "true"))
                console.log('>> index.html file sent back to client with LOGINSUCCESS=true')
            }
        })  
    })
}
module.exports.check_login_data=check_login_data
