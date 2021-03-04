const utility=require("./utility.js")
const database=require("./database.js")
const check_timeslot_available=require("./check_timeslot_available")

/**
 * Reserve the requested timeslot for the specified user on the specified instrument
 * currently expects client data: date, start_time, end_time, notes, ssn
 * currently responds with: error/success
 * @param {Request} req Request object with client data
 * @param {Response} res Response object
 */
function reserve_instrument(req,res){
    utility.parse_data(req,(data)=>{
        database.timeslot.book(data,(error)=>{
            if(error.fatal) throw error;
            
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:error}))
        },(results)=>{
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({success:"timeslot was booked"}))
        })
    })
}
module.exports.reserve_instrument=reserve_instrument