const utility=require("./utility.js")
const database=require("./database.js")

/**
 * Retrives and sends all maintenance data for a specific instrument
 * currently expects client data: Ins_ID
 * currently responds with: string with mainenance data error (?) 
 * @param {Request} req Request object with client data
 * @param {Response} res Response object
 **/
function get_maintenance(req,res) {     
    utility.parse_data(req,(data)=>{
        database.maintenance.get(data,(error)=>{
            if(error.fatal) throw error; 

            const error_message="error when getting list of maintenances:'"+error+"'"
            utility.log(`${error_message}`,"error")

            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:error}))

        },(db_maintenances)=>{
            var ret=[];
            for(item of db_maintenances){
                ret.push({DateTime:item.DateTime, Status:item.Status, Notes:item.Notes})
            } 
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify(ret))
            utility.log(`Maintenance sent to client for insID ${data.Ins_ID}`) 
        })
    })
}
module.exports.get_maintenance=get_maintenance