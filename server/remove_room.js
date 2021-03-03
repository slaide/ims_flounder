const utility=require("./utility.js")
const database=require("./database.js")

/**
 * Removes room from the system by changing exist attribute to 0 for certain room
 * currently expects client data: RoomID
 * currently responds with: error/success
 * @param {Request} req Request object with client data
 * @param {Response} res Response object
 */

 function remove_room(req,res){
    utility.parse_data(req,(data)=>{
      console.log(">>data: ", data) //for testing 
      console.log(">>data: ", data.RoomID) //for testing

      var sql="UPDATE room SET Exist=0 WHERE Room_ID=?"
      database.connection.query(sql, [data.RoomID], (error, result)=> {
         if(error){
            const error_message="error when removing room:'"+error+"'"
            utility.log(`${error_message}`,"error")

            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:error_message}))
            return
        }
        res.writeHeader(200,utility.content.json)
        res.end(JSON.stringify({result:"successfully removed room"}))
      })
    })
 }
 module.exports.remove_room=remove_room