const utility=require("./utility.js")
const database=require("./database.js")
const fs=require("fs")

/**
 * Add a new instrument to the system
 * currently expects client data: Description,Serial,Proc_date,Room_ID
 * currently responds with: json error/success
 * @param {Request} req Request object with client data
 * @param {Response} res Response object
 */
function add_instrument(req,res){
    utility.parse_data(req,(data)=>{
        if(!utility.isNumeric(data.ssn)){
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:{source:"add_instrument",message:"ssn is not a number",fatal:false}}))
            return
        }
        if(!utility.isNumeric(data.serial)){
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:{source:"add_instrument",message:"serial number is not a number",fatal:false}}))
            return
        }
        if(!utility.isNumeric(data.room_id)){
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:{source:"add_instrument",message:"room_id is not a number",fatal:false}}))
            return
        }
        if(!utility.isDate(data.proc_date)){
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:{source:"add_instrument",message:"invalid proc_date",fatal:false}}))
            return
        }
        if(!(data.description.length>1)){
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:{source:"add_instrument",message:"instrument description needs to have at least 2 letters",fatal:false}}))
            return
        }

        database.instruments.add(data,(error)=>{
            if(error.fatal) throw error;
            
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:error}))

        },(results)=>{
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({success:"added instrument"}))
        })
    })
}
module.exports.add_instrument=add_instrument;