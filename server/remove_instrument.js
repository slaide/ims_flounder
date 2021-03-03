const utility=require("./utility.js")
const database=require("./database.js")

/**
 * Removes instrument from the system by changing exist attribute to 0 for certain instrument
 * currently expects client data: ins_ID
 * currently responds with: error/success
 * @param {Request} req Request object with client data
 * @param {Response} res Response object
 */

 function remove_instrument(req,res){
    utility.parse_data(req,(data)=>{
      console.log(">>data: ", data) //for testing 
      console.log(">>data: ", data.ins_ID) //for testing

      var sql="UPDATE instrument SET Exist=0 WHERE Ins_ID=?"
      database.connection.query(sql, [data.ins_ID], (error, result)=> {
         if(error){
            const error_message="error when removing instrument:'"+error+"'"
            utility.log(`${error_message}`,"error")

            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:error_message}))
            return
        }
        res.writeHeader(200,utility.content.json)
        res.end(JSON.stringify({result:"successfully removed instrument"}))
      }) 
    })
 }
 module.exports.remove_instrument=remove_instrument