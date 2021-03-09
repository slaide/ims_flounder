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
        }
        if(!utility.isNumeric(data.serial)){
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:{source:"add_instrument",message:"serial number is not a number",fatal:false}}))
        }
        if(!utility.isNumeric(data.room_id)){
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:{source:"add_instrument",message:"room_id is not a number",fatal:false}}))
        }
        if(!utility.isDate(data.proc_date)){
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:{source:"add_instrument",message:"invalid proc_date",fatal:false}}))
        }

        database.instruments.add(data,(error)=>{
            if(error.fatal) throw error;
            
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:error}))

        },(results)=>{
            res.writeHeader(200,utility.content.html)
            res.end(fs.readFileSync("../html/ADMIN_DEMO_2.html",utility.encoding.utf8))
        })
    })
}
module.exports.add_instrument=add_instrument;