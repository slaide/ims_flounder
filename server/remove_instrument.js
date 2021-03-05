const utility=require("./utility.js")
const database=require("./database.js")

/**
 * Removes instrument from the system by changing exist attribute to 0 for certain instrument
 * currently expects client data: ins_id
 * currently responds with: error/success
 * @param {Request} req Request object with client data
 * @param {Response} res Response object
 */

function remove_instrument(req,res){
   utility.parse_data(req,(data)=>{
      console.log("data: ", data)
      database.instruments.remove(data,(error)=>{
          if(error.fatal) throw error;
          
          res.writeHeader(200,utility.content.json)
          res.end(JSON.stringify({error:error}))

      },(results)=>{
          res.writeHeader(200,utility.content.json)
          res.end(JSON.stringify({success:"successfully removed instrument"}))
      })
  })
}
module.exports.remove_instrument=remove_instrument