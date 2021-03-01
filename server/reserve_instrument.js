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
        //make sure all of the expected data is here and defined
        for(attribute of "ins_id date start_time end_time ssn".split(" ")){
            if(!data[attribute]){
                const error_message="request is missing the attribute '"+attribute+"'"
                console.log(error_message)

                res.writeHeader(200,utility.content.json)
                res.end(JSON.stringify({error:error_message}))

                return
            }
        }
        //when no notes were added this field is undefined, though it should just be an empty string
        if(!data.notes){
            data.notes=""
        }
        check_timeslot_available.check_timeslot_available(req,res,data)
    })
}
module.exports.reserve_instrument=reserve_instrument