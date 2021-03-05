const utility=require("./utility.js")
const database=require("./database")
const fs=require("fs")
const pbkdf2=require("pbkdf2")
const { Console } = require("console")

/**
 * Function to check login data matches to data in database
 * currently expects client data: Email and Password
 * currently responds with: successful/unsuccesful login, error? 
 * @param {Request} req Request object with client data
 * @param {Response} res Response object
 **/

function check_login_data(req,res){
    utility.parse_data(req,(user_data)=>{
        database.account.login(user_data,error=>{
            if(error.fatal) throw error;

            utility.log(`error selecting attributes from user: ${error}`)

            res.writeHeader(200,utility.content.json)
            res.end(`{error:${error}}`)

            return
        },results=>{
            const user_data={
                email:results[0].Email,
                ssn:results[0].SSN,
                admin:results[0].Admin,
                maintenance:results[0].Maintenance,
                token: utility.sha512(user_data.password,salt=utility.format_time(new Date))
            }
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify(user_data))

            utility.log(`user ${user_data.ssn} successfully logged in`)
        })  
    })
}
module.exports.check_login_data=check_login_data
