const utility=require("./utility.js")
const database=require("./database.js")

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
        //select all bookings for the same machine that start before the new one should end, and end after the new should start
        //all bookings that match these overlap with the new one
        //TODO this needs to be wrapped into a transaction combined with inserting the new data
        database.connection.query("select * from booking where Ins_ID=? and (timediff(Start_time,?)>0 and timediff(End_time,?)<0);",[data.ins_id,data.end_time,data.start_time],(error,results,fields)=>{
            if(error){
                const error_message="error checking for free timeslot: "+error.sqlMessage
                console.log(error_message)

                res.writeHeader(200,utility.content.json)
                res.end(JSON.stringify({error:error_message}))

                return
            }
            if(results.length!=0){
                const error_message="timeslot is already occupied"
                console.log(error_message,": ",data)

                res.writeHeader(200,utility.content.json)
                res.end(JSON.stringify({error:error_message}))

                return
            }
            database.connection.query("insert into booking(Start_time, End_time, Status, SSN, Ins_ID, Note) values(?,?,'booked',?,?,?)",[data.start_time,data.end_time,data.ssn,data.ins_id,data.notes],(error,results,fields)=>{
                if(error){
                    const error_message="error reserving free timeslot: "+error.sqlMessage
                    console.log(error_message)

                    res.writeHeader(200,utility.content.json)
                    res.end(JSON.stringify({error:error_message}))

                    return
                }
                if(!results.affectedRows===1){
                    const error_message="could not book timeslot for some reason"
                    console.log(error_message)

                    res.writeHeader(200,utility.content.json)
                    res.end(JSON.stringify({error:error_message}))

                    return
                }

                res.writeHeader(200,utility.content.json)
                res.end(JSON.stringify({'reservation':'timeslot successfully reserved'}))

                return
            })
        })
    })
}
module.exports.reserve_instrument=reserve_instrument