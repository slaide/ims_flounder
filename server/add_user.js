const utility=require("./utility.js")
const database=require("./database.js")
const fs=require("fs")
/**
 * Add a new user to the system
 * currently expects client data: ssn, first_name, last_name, password, admin, phone_number, email, special_rights, immunocompromised
 * currently responds with: error/success
 * @param {Request} req Request object with client data
 * @param {Response} res Response object
 */
function add_user(req,res){
    utility.parse_data(req,(data)=>{
        database.accounts.add(data,(error)=>{
            if(error.fatal) throw error;

            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:error}))

        },(results)=>{
            res.writeHeader(200,utility.content.html)
            res.end(fs.readFileSync("../html/ADMIN_DEMO_2.html",utility.encoding.utf8))
        })
    })
}
module.exports.add_user=add_user;
