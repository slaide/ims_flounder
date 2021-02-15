const utility=require("./utility.js")
const database=require("./database.js")

//send schedule for a single instrument:
//client input: some instrument's id
//return schedule for this instrument
//schedule=list of reserved timeslots with start- and end-time, and username
function get_schedule(req,res){
    throw "unimplemented"
}
module.exports.get_schedule=get_schedule