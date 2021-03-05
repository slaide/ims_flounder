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
      database.users.remove(data,(error)=>{
          if(error.fatal) throw error;
          
          res.writeHeader(200,utility.content.json)
          res.end(JSON.stringify({error:error}))

      },(results)=>{
          res.writeHeader(200,utility.content.json)
          res.end(JSON.stringify({success:"successfully added instrument"}))
      })
  })  
}
module.exports.remove_user=remove_user