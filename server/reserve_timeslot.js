const utility=require("./utility.js")
const database=require("./database.js")

/**
 * Reserve the requested timeslot for the specified user on the specified instrument
 * currently expects client data: InsID, StartTime, EndTime, Username, SSN (because i am too lazy to write the code to get the ssn for a username right now)
 * currently responds with: success
 * @param {Request} req Request object with client data
 * @param {Response} res Reponse object
 */
function reserve_timeslot(req,res){
    database.connect_database((connection,error)=>{
        if(error){
            console.log("failed to connect to db for timeslot reservation")
            if(!error.fatal){
                database.disconnect(connection)
            }
            return
        }
        utility.parse_data(req,(data)=>{
            if(!data.InsID || !data.StartTime || !data.EndTime || !data.Username || !data.SSN){
                console.log("request is missing at least one these attributes: InsID, StartTime, EndTime, Username, SSN")
                database.disconnect(connection)
                return
            }
            connection.query("select * from booking where ? and (StartTime>=? or EndTime<=?);",[data.StartTime,data.EndTime],(error,results,fields)=>{
                if(error){
                    console.log("error checking for free timeslot",error)
                    if(!error.fatal){
                        database.disconnect(connection)
                    }
                    return
                }
                if(results.length!=0){
                    console.log("timeslot already reserved: ",data)
                    res.writeHeader(200,utility.content.json)
                    res.end("{'error':'timeslot already reserved'}")
                    database.disconnect(connection)
                    return
                }
                connection.query("insert into booking(Note, start_Time, End_Time, `Status`, SSN, Inst_ID)) values('',?,?,'booked',?,?)",[data.StartTime,data.EndTime,data.SSN,data.InsID],(error,results,fields)=>{
                    if(error){
                        console.log("error reserving free timeslot",error)
                        if(!error.fatal){
                            database.disconnect(connection)
                        }
                        return
                    }
                    if(results.length!=0){
                        console.log("timeslot not reserved for some reason")
                        res.writeHeader(200,utility.content.json)
                        res.end("{'error':'timeslot could not be reserved'}")
                        database.disconnect(connection)
                        return
                    }
                })
            })
        })
    })
}
module.exports.reserve_timeslot=reserve_timeslot