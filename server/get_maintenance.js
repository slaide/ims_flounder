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
    
        var sql ="SELECT DateTime, Status, Notes FROM ins_maintenance join instrument on ins_maintenance.Ins_ID=instrument.Ins_ID WHERE ins_maintenance.Ins_ID = ? and instrument.Exist =1"
            
        database.connection.query(sql, [data.Ins_ID], (error, result)=> {
            if(error){
                const error_message="error selecting attributes: '"+error+"'"
                utility.log(`${error_message}`, 'error')

                res.writeHeader(200,utility.content.json)
                res.end(JSON.stringify({error:error_message}))
                return
            }
            db_maintenance=JSON.parse(JSON.stringify(result))   

            var ret=[];
            for(item of db_maintenance){
                ret.push({DateTime:item.DateTime, Status:item.Status, Notes:item.Notes})
            } 
            res.writeHeader(200,utility.content.from_filename(".json"))
            res.end(JSON.stringify(ret))
            utility.log(`Maintenance sent to client for insID ${data.Ins_ID}`) 
        })
    })
}
module.exports.get_maintenance=get_maintenance