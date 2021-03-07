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
    utility.parse_data(req,(data)=>{
        database.accounts.get(data,(error)=>{
            if(error.fatal) throw error; 

            const error_message="error when selecting users:'"+JSON.stringify(error)+"'"
            utility.log(`${error_message}`,"error")

            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:error}))

        },(db_users)=>{
            var ret=[];
            for(item of db_users){
                ret.push({ssn: item.SSN, first_name:item.First_name, last_name:item.Last_name, admin:item.Admin, phone:item.Phone_number, email:item.Email, special_rights:item.Special_rights, immunocompromised:item.Immunocompromised, maintenance:item.Maintenance})
            }
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify(ret))

            utility.log('sent users') 
        })
    })
}
module.exports.get_users=get_users