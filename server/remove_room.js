const utility=require("./utility.js")
const database=require("./database.js")

/**
 * Removes room from the system by changing exist attribute to 0 for certain room
 * currently expects client data: Room_ID
 * currently responds with: error/success
 * @param {Request} req Request object with client data
 * @param {Response} res Response object
 */

 function remove_room(req,res){
    throw "unimplemented"
    utility.parse_data(req,(data)=>{
        

    })
 }
 module.exports.remove_room=remove_room