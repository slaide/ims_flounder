const utility=require("./utility.js")
const database=require("./database.js")

//description is wrong
/**
 * Check if timeslot is available to book for this user
 * currently expects client data: ins_id, start_time, ssn
 * currently responds with: error/success
 * @param {Request} req Request object with client data
 * @param {Response} res Response object
 */
function check_timeslot_available(req,res){
    utility.parse_data(req,(data)=>{
        database.timeslot.check_available(data,(error)=>{
            if(error.fatal) throw error;

            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:error}))
        },(results)=>{
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({success:"timeslot is available"}))
        })
    })
}
module.exports.check_timeslot_available=check_timeslot_available