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
      database.rooms.remove(data,(error)=>{
          if(error.fatal) throw error;
          
          res.writeHeader(200,utility.content.json)
          res.end(JSON.stringify({error:error}))

      },(results)=>{
          res.writeHeader(200,utility.content.json)
          res.end(JSON.stringify({success:"successfully removed room"}))
      })
  })
}

 module.exports.remove_room=remove_room