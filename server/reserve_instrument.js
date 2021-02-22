const utility=require("./utility.js")
const database=require("./database.js")

/**
 * Reserve the requested timeslot for the specified user on the specified instrument
 * currently expects client data: date, start_time, end_time, notes, email/ssn?
 * currently responds with: error message on failure, reservation message otherwise
 * @param {Request} req Request object with client data
 * @param {Response} res Reponse object
 */
function reserve_instrument(req,res){
    console.log("tying to reserve an instrument with a function that is not done yet. no promises on what will happen.")

    database.connect_database((connection,error)=>{
        if(error){
            console.log("failed to connect to db for timeslot reservation")

            if(!error.fatal){
                database.disconnect(connection)
            }

            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:"failed to connect to db for timeslot reservation"}))

            return
        }
        utility.parse_data(req,(data)=>{
            //make sure all of the expected data is here and defined
            for(attribute of "date start_time end_time notes".split(" ")){
                if(!data[attribute]){
                    const error_message="request is missing the attribute '"+attribute+"'"
                    console.log(error_message)

                    res.writeHeader(200,utility.content.json)
                    res.end(JSON.stringify({error:error_message}))

                    database.disconnect(connection)
                    return
                }
            }
            connection.query("select * from booking where Ins_ID=? and (Start_time>=? or End_time<=?);",[data.InsId,data.StartTime,data.EndTime],(error,results,fields)=>{
                if(error){
                    console.log("error checking for free timeslot ",error)

                    if(!error.fatal){
                        database.disconnect(connection)
                    }

                    res.writeHeader(200,utility.content.json)
                    res.end(JSON.stringify({error:"error selecting potentially overlapping reservations"}))

                    return
                }
                if(results.length!=0){
                    console.log("timeslot already reserved: ",data)

                    res.writeHeader(200,utility.content.json)
                    res.end(JSON.stringify({'error':'timeslot already reserved'}))

                    database.disconnect(connection)
                    return
                }
                connection.query("insert into booking(Note, Start_time, End_time, Status, SSN, Inst_ID)) values('',?,?,'booked',?,?)",[data.StartTime,data.EndTime,data.SSN,data.InsID],(error,results,fields)=>{
                    if(error){
                        console.log("error reserving free timeslot",error)

                        if(!error.fatal){
                            database.disconnect(connection)
                        }

                        res.writeHeader(200,utility.content.json)
                        res.end(JSON.stringify({error:"failed to reserve timeslot due to internal error"}))

                        return
                    }
                    if(results.length!=0){
                        console.log("timeslot could not be reserved")

                        res.writeHeader(200,utility.content.json)
                        res.end(JSON.stringify({'error':'timeslot could not be reserved'}))

                        database.disconnect(connection)
                        return
                    }

                    res.writeHeader(200,utility.content.json)
                    res.end(JSON.stringify({'reservation':'timeslot successfully reserved'}))

                    database.disconnect(connection)
                    return
                })
            })
        })
    })
}
module.exports.reserve_instrument=reserve_instrument