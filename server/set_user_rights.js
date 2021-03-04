const utility=require("./utility.js")
const database=require("./database.js")

/**
 * Changes a users special rights 
 * currently expects client data: ssn, special_rights
 * currently responds with: error/success
 * @param {Request} req Request object with client data
 * @param {Response} res Response object
 */
function set_user_rights(req,res){
    utility.parse_data(req,(data)=>{
        database.account.set_special_rights(data,(error)=>{
            if(error.fatal) throw error;
            
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:error}))

        },(results)=>{
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({success:"successfully changed user special rights"}))
        })
    })
}
module.exports.set_user_rights=set_user_rights;