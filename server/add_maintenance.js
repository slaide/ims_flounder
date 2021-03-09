const utility=require("./utility.js")
const database=require("./database.js")

/**
 * Adds maintenance to ins_mantenance table in db
 * currently expects client data: DateTime, Status, Notes, SSN, Ins_ID
 * currently responds with: error/success
 * @param {Request} req Request object with client data
 * @param {Response} res Response object
 **/

function add_maintenance(req,res){
    utility.parse_data(req,(data)=>{
        if(!utility.isNumeric(data.ssn)){
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:{source:"add_maintenance",message:"ssn is not a number",fatal:false}}))
        }
        if(!utility.isNumeric(data.ins_id)){
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:{source:"add_maintenance",message:"ins_id is not a number",fatal:false}}))
        }
        if(!utility.isDate(data.date_time)){
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:{source:"add_maintenance",message:"invalid date_time",fatal:false}}))
        }
        
        database.maintenance.add(data,(error)=>{
            if(error.fatal) throw error;

            const error_message="failed to add maintenance because "+JSON.stringify(error)
            utility.log(`${error_message}`)

            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:error_message}))

        },(results)=>{
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({success:"successfully added instrument"}))
        })
    })
}
module.exports.add_maintenance=add_maintenance; 