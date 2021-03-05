const utility=require("./utility.js")
const database=require("./database.js")
const fs=require("fs")

/**
 * Add a new room to the system
 * currently expects client data: Room_ID, Area, Capacity, Class, Room_code, Building_code
 * currently responds with: error/success
 * @param {Request} req Request object with client data
 * @param {Response} res Response object
 */
function add_room(req,res){
    utility.parse_data(req,(data)=>{
        database.rooms.add(data,(error)=>{
            if(error.fatal) throw error;
            
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:error}))

        },(results)=>{
            res.end(fs.readFileSync("../html/ADMIN_DEMO_2.html",utility.encoding.utf8))
        })
    })
}
module.exports.add_room=add_room;