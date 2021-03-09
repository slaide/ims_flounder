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
        if(!utility.isNumeric(data.ssn)){
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:{source:"add_room",message:"ssn is not a number",fatal:false}}))
        }
        if(!utility.isNumeric(data.room_id)){
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:{source:"add_room",message:"room_id is not a number",fatal:false}}))
        }
        if(!utility.isNumeric(data.area)){
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:{source:"add_room",message:"area is not a number",fatal:false}}))
        }
        if(!utility.isNumeric(data.capacity)){
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:{source:"add_room",message:"capacity is not a number",fatal:false}}))
        }
        if(!utility.isDate(data.date_time)){
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:{source:"add_room",message:"invalid date_time",fatal:false}}))
        }
        if(!("ABC").split("").includes(data.class)){
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:{source:"add_room",message:"invalid date_time",fatal:false}}))
        }

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