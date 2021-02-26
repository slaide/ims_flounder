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
            const query="select * from booking where ? and timediff(Start_Time,?)=0";
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
                    console.log(error_message)//,": ",data)

                    res.writeHeader(200,utility.content.json)
                    res.end(JSON.stringify({error:error_message}))

                    database.disconnect(connection)
                    return
                }
                //select all bookings in the same room in this timeframe, of users that are immunocompromised
                //check if this number is 0 (allow further checks) or 1 (disallow)
                const query="select * from booking" //select all bookings
                +" join user on user.SSN=booking.SSN" //select all user that have booked something
                +" join instrument on instrument.Ins_ID=booking.Ins_ID" //select all instruments that have been booked
                +" join room on room.Room_ID=instrument.Room_ID" //select all rooms within which an instrument was booked
                +" where timediff(Start_Time,?)=0" //select timeslots identical to the one currently checked
                +" and user.Immunocompromised=true" //where the booker is immunocompromised
                +" and user.SSN=?" //immunocompromised people can book multiple instruments in the same room at the same time, so booking is only disallowed if the immunocompromised person in the room is not the 'new' user
                +" and room.Room_ID in (select Room_ID from instrument where Ins_ID=?)"; //in the same room as the the one where the current instrument is in
                connection.query(query,[data.start_time,data.ssn,data.ins_id],(error,results,fields)=>{
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
                    //check if this number is 0 (allow further checks) or !=0 (disallow) (see description above query)
                    if(results.length!=0){
                        const error_message="room is already occupied by an immunocompromised person that is not you"
                        console.log(error_message)//,": ",data)
    
                        res.writeHeader(200,utility.content.json)
                        res.end(JSON.stringify({error:error_message}))
    
                        database.disconnect(connection)
                        return
                    }
                    //select number of all users (one user can book multiple instruments at the same time) in this timeframe in the same room
                    //check if this number is equal to the capacity
                    //if so, disallow, otherwise allow
                    //also, if the user themself is immunocompromised, check if the room is empty
                    //if empty, allow, else disallow
                    const query="select count(*) as NumberPeopleInRoom, room.Capacity as RoomCapacity, user.Immunocompromised as YouAreImmunocompromised" //select some values required for further availability checks
                    +" from booking join user on booking.SSN=user.SSN" //select all bookings
                    +" join instrument on booking.Ins_ID=instrument.Ins_ID" //select all instruments booked
                    +" join room on instrument.Room_ID=room.Room_ID" //select all rooms containing a booked instrument
                    +" where instrument.Room_ID in (" //where the instrument is the same as the tried-to-be-booked one
                        +"select Room_ID from instrument where ?"
                    +") and timediff(Start_Time,?)=0" //and the booking starts at the same time as the possibly new one
                    +" group by user.SSN";//group by ssn to count people in the room (a person can book multiple instruments in the same room at the same time)
                    connection.query(query,[{Ins_ID:data.ins_id},data.start_time],(error,results,fields)=>{ //{"user.SSN":data.ssn},
                        if(error){
                            const error_message="error checking for timeslot availability (complex check): "+error.sqlMessage
                            console.log(error_message)//,": ",data)

                            if(!error.fatal){
                                database.disconnect(connection)
                            }

                            res.writeHeader(200,utility.content.json)
                            res.end(JSON.stringify({error:error_message}))

                            return
                        }
                        if(results.length==0){
                            const error_message="timeslot availability check did not work (query did not work. yell at patrick)"
                            console.log(error_message,": ",data)

                            res.writeHeader(200,utility.content.json)
                            res.end(JSON.stringify({error:error_message}))

                            database.disconnect(connection)
                            return
                        }
                        //check if this number is equal to the capacity
                        //if so, disallow, otherwise allow
                        if(results[0].NumberPeopleInRoom==results[0].RoomCapacity){
                            const error_message="room is already at max capacity at that time"
                            console.log(error_message)//,": ",data)

                            res.writeHeader(200,utility.content.json)
                            res.end(JSON.stringify({error:error_message}))

                            database.disconnect(connection)
                            return
                        }
                        //also, if the user themself is immunocompromised, check if the room is empty
                        //if empty, allow, else disallow
                        if(results[0].YouAreImmunoCompromised && results[0].NumberPeopleInRoom>0){
                            const error_message="room is already at occupied at that time"
                            console.log(error_message)//,": ",data)

                            res.writeHeader(200,utility.content.json)
                            res.end(JSON.stringify({error:error_message}))

                            database.disconnect(connection)
                            return
                        }
                        
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