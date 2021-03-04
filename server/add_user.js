const utility=require("./utility.js")
const database=require("./database.js")

/**
 * Add a new user to the system
 * currently expects client data: ssn, first_name, last_name, password, admin, phone_number, email, special_rights, immunocompromised
 * currently responds with: error/success
 * @param {Request} req Request object with client data
 * @param {Response} res Response object
 */
function add_user(req,res){
    utility.parse_data(req,(data)=>{
        console.log("data: ", data)
        database.users.add(data,(error)=>{
            if(error.fatal) throw error;
            
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:error}))

        },(results)=>{
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({success:"successfully added user"}))
        })
    })
}
module.exports.add_user=add_user;