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

            //make sure date format is correct
            try{
                const start_time_date=new Date(data.start_time)
                if(!start_time_date) throw "invalid date format"
            }catch(e){
                const error_message="start_time has invalid date/time format "+data.start_time+" ("+e+")"
                console.log(error_message)//,": ",data)

                res.writeHeader(200,utility.content.json)
                res.end(JSON.stringify({error:error_message}))

                database.disconnect(connection)
                return
            }

            //check if the instrument is already occupied in this timeframe
            const query=`
                select count(*) as TimeslotAlreadyReserved 
                from booking 
                where Ins_ID=${data.ins_id} 
                and timediff(Start_Time,"${data.start_time}")=0
            `;
            connection.query(query,(error,results,fields)=>{
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
                if(results[0].TimeslotAlreadyReserved){
                    const error_message="timeslot is already occupied"
                    console.log(error_message)//,": ",data)

                    res.writeHeader(200,utility.content.json)
                    res.end(JSON.stringify({error:error_message}))

                    database.disconnect(connection)
                    return
                }
                //select all bookings in the same room in this timeframe, of users that are immunocompromised
                //check if this number is 0 (allow further checks) or 1 (disallow)
                const query=`
                    select count(*) as NumImmunocompromisedInRoom
                    from booking
                    join user on user.SSN=booking.SSN
                    join instrument on instrument.Ins_ID=booking.Ins_ID
                    join room on room.Room_ID=instrument.Room_ID
                    where timediff(Start_Time,"${data.start_time}")=0
                    and user.Immunocompromised=1
                    and not user.SSN=${data.ssn} #not be self
                    and room.Room_ID in (select Room_ID from instrument where instrument.Ins_ID=${data.ins_id})
                `;
                connection.query(query,(error,results,fields)=>{
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
                    if(results[0].NumImmunocompromisedInRoom!=0){
                        const error_message="room is already occupied by an immunocompromised person that is not you"
                        console.log(error_message)//,": ",data)
    
                        res.writeHeader(200,utility.content.json)
                        res.end(JSON.stringify({error:error_message}))
    
                        database.disconnect(connection)
                        return
                    }
                    //select number of all users in this timeframe in the same room that are not you
                    //check if this number is less than capacity
                    //if so, allow, otherwise disallow
                    //also, if the user themself is immunocompromised, check if the room is empty
                    //if empty, allow, else disallow
                    const query=`
                        select room.Capacity as RoomCapacity,
                            count(distinct user.SSN) as NumberPeopleInRoom,
                            (select Immunocompromised from user where user.SSN=${data.ssn}) as YouAreImmunoCompromised
                        from booking join user on booking.SSN=user.SSN
                        join instrument on booking.Ins_ID=instrument.Ins_ID
                        join room on instrument.Room_ID=room.Room_ID
                        where instrument.Room_ID in (
                            select Room_ID from instrument where instrument.Ins_ID=${data.ins_id}
                        )
                        and timediff(Start_Time,"${data.start_time}")=0
                        and not user.SSN=${data.ssn}
                    `;
                    connection.query(query,(error,results,fields)=>{
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
                        res.end(JSON.stringify({success:"timeslot is available"}))
                    })
                })
            })
        })
    })
}
module.exports.check_timeslot_available=check_timeslot_available

/*
select * from booking
join user on user.SSN=booking.SSN
join instrument on instrument.Ins_ID=booking.Ins_ID
join room on room.Room_ID=instrument.Room_ID
where timediff(Start_Time,?)=0
and user.Immunocompromised=true
and not user.SSN=? #not be self
and room.Room_ID in (select Room_ID from instrument where Ins_ID=?)

                     */