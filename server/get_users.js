const utility=require("./utility.js")
const database=require("./database.js")

/**
 * Retrives and sends all user data 
 * currently expects client data: None
 * currently responds with: string with users or error 
 * @param {Request} req Request object with client data
 * @param {Response} res Response object
 **/
function get_users(req,res) {

    var sql="SELECT SSN, First_name, Last_name, Admin, Phone_number, Email, Special_rights, Immunocompromised, Maintenance FROM user WHERE Exist=1"
    database.connection.query(sql, (error, result)=> {
        if(error){
           const error_message="error when selecting users:'"+error+"'"
           utility.log(`${error_message}`,"error")

           res.writeHeader(200,utility.content.json)
           res.end(JSON.stringify({error:error_message}))
           return
       }
        db_user=JSON.parse(JSON.stringify(result))  

        var ret=[];
        for(item of db_user){ 
            ret.push({SSN: item.SSN, FirstName:item.First_name, LastName:item.Last_name, Admin:item.Admin, Phone:item.Phone_number, Email:item.Email, SpecRight:item.Special_rights, Immun:item.Immunocompromised, Maintenance:item.Maintenance})
        }   
        res.writeHeader(200,utility.content.from_filename(".json"))
        res.end(JSON.stringify(ret))

        utility.log('sent users') 
     }) 
}
module.exports.get_users=get_users