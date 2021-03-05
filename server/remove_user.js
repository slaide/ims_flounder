const utility=require("./utility.js")
const database=require("./database.js")

/**
 * Removes user from the system by changing exist attribute to 0 for certain user
 * currently expects client data: ssn
 * currently responds with: error/success
 * @param {Request} req Request object with client data
 * @param {Response} res Response object
 */

 function remove_user(req,res){
   utility.parse_data(req,(data)=>{ 
       database.accounts.remove(data,(error)=>{
           if(error.fatal) throw error; 

           const error_message="error when removing user:'"+error+"'"
           utility.log(`${error_message}`)

           res.writeHeader(200,utility.content.json)
           res.end(JSON.stringify({error:error}))
       },(results)=>{
           res.writeHeader(200,utility.content.json)
           res.end(JSON.stringify({result:"successfully removed user"}))
       })
   })
 }
 module.exports.remove_user=remove_user