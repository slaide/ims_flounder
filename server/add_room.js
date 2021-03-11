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
            return
        }
        if(!utility.isNumeric(data.area)){
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:{source:"add_room",message:"area is not a number",fatal:false}}))
            return
        }
        if(!utility.isNumeric(data.building_code)){
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:{source:"add_room",message:"building code is not a number",fatal:false}}))
            return
        }
        if(!utility.isNumeric(data.capacity)){
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:{source:"add_room",message:"capacity is not a number",fatal:false}}))
            return
        }
        if(!("ABC").split("").includes(data.class)){
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:{source:"add_room",message:"invalid date_time",fatal:false}}))
            return
        }

        database.rooms.add(data,(error)=>{
            if(error.fatal) throw error;
            
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:error}))

        },(results)=>{
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({success:"added room"}))
        })
    })
}
module.exports.add_room=add_room;