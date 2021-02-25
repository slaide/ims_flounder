const utility=require("./utility.js")
const database=require("./database.js")

//description is wrong
/**
 * Reserve the requested timeslot for the specified user on the specified instrument
 * currently expects client data: ins_id, start_time, ssn
 * currently responds with: error/success
 * @param {Request} req Request object with client data
 * @param {Response} res Response object
 */
function check_timeslot_available(req,res){
    database.connect_database((connection,error)=>{
        if(error){
            console.log("failed to connect to db for timeslot availability check")

            if(!error.fatal){
                database.disconnect(connection)
            }

            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:"failed to connect to db to check timeslot availability"}))

            return
        }
        utility.parse_data(req,(data)=>{
            //make sure all of the expected data is here and defined
            for(attribute of "ins_id start_time ssn".split(" ")){
                if(!data[attribute]){
                    const error_message="request is missing the attribute '"+attribute+"'"
                    console.log(error_message)

                    res.writeHeader(200,utility.content.json)
                    res.end(JSON.stringify({error:error_message}))

                    database.disconnect(connection)
                    return
                }
            }

            //check if the instrument is already occupied in this timeframe
            const query="select * from booking where ? and timediff(starttime,?)=0";
            connection.query(query,[{Ins_ID:data.ins_id},data.start_time],(error,results,fields)=>{
                if(error){
                    const error_message="error checking for timeslot availability (slot occupied): "+error.sqlMessage
                    console.log(error_message)

                    if(!error.fatal){
                        database.disconnect(connection)
                    }

                    res.writeHeader(200,utility.content.json)
                    res.end(JSON.stringify({error:error_message}))

                    return
                }
                if(results.length!=0){
                    const error_message="timeslot is already occupied"
                    console.log(error_message,": ",data)

                    res.writeHeader(200,utility.content.json)
                    res.end(JSON.stringify({error:error_message}))

                    database.disconnect(connection)
                    return
                }
                //select all bookings for this instrument in this timeframe of users that are immunocompromised
                //check if this number is 0 (allow further checks) or 1 (disallow)
                const query="select * from booking join user on user.ssn=booking.ssn where ? and timediff(starttime,?)=0 and user.immunocompromised=true";
                connection.query(query,[{Ins_ID:data.ins_id},data.start_time],(error,results,fields)=>{
                    if(error){
                        const error_message="error checking for timeslot availability (immunocompromised in room): "+error.sqlMessage
                        console.log(error_message)
    
                        if(!error.fatal){
                            database.disconnect(connection)
                        }
    
                        res.writeHeader(200,utility.content.json)
                        res.end(JSON.stringify({error:error_message}))
    
                        return
                    }
                    if(results.length!=0){
                        const error_message="room is already occupied by an immunocompromised person"
                        console.log(error_message,": ",data)
    
                        res.writeHeader(200,utility.content.json)
                        res.end(JSON.stringify({error:error_message}))
    
                        database.disconnect(connection)
                        return
                    }
                    //select number of all users (one user can book multiple instruments at the same time) in this timeframe in the same room
                    //    select * from booking join instrument on booking.insid=instrument.insid join room on instrument.roomid=room.roomid where booking.insid=data.insid and timediff(starttime,data.starttime)=0 group by booking.ssn
                    //check if this number is equal to the capacity
                    //if so, disallow, otherwise allow
                    //also, if the user themself is immunocompromised, check if the room is empty
                    //if empty, allow, else disallow
                    const query="select count(*) as PeopleInRoom, room.capacity as RoomCapacity, user.Immunocompromised as YouAreImmunocompromised from booking join user on ? join instrument on booking.insid=instrument.insid join room on instrument.roomid=room.roomid where ? and timediff(starttime,?)=0 group by booking.ssn";
                    connection.query(query,[{"user.ssn":data.ssn},{"booking.insid":data.insid},data.starttime],(error,results,fields)=>{
                        if(error){
                            const error_message="error checking for timeslot availability (complex check): "+error.sqlMessage
                            console.log(error_message)

                            if(!error.fatal){
                                database.disconnect(connection)
                            }

                            res.writeHeader(200,utility.content.json)
                            res.end(JSON.stringify({error:error_message}))

                            return
                        }
                        if(results.length!=0){
                            const error_message="timeslot is already occupied (query did not work. yell at patrick)"
                            console.log(error_message,": ",data)

                            res.writeHeader(200,utility.content.json)
                            res.end(JSON.stringify({error:error_message}))

                            database.disconnect(connection)
                            return
                        }
                        console.log(results,fields)
                        
                        database.disconnect(connection)

                        res.writeHeader(200,utility.content.json)
                        res.end(JSON.stringify({error:"function not fully implemented"}))
                    })
                })
            })
        })
    })
}
module.exports.check_timeslot_available=check_timeslot_available