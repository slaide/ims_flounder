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

            return
        }   

        const query=`
            #query 1
            select count(*) as TimeslotAlreadyReserved 
            from booking 
            where Ins_ID=${data.ins_id} 
            and timediff(Start_Time,"${data.start_time}")=0;

            #query 2
            select count(*) as NumImmunocompromisedInRoom
            from booking
            join user on user.SSN=booking.SSN
            join instrument on instrument.Ins_ID=booking.Ins_ID
            join room on room.Room_ID=instrument.Room_ID
            where timediff(Start_Time,"${data.start_time}")=0
            and user.Immunocompromised=1
            and not user.SSN=${data.ssn} #not be self
            and room.Room_ID in (select Room_ID from instrument where instrument.Ins_ID=${data.ins_id});

            #query 3
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
            and not user.SSN=${data.ssn};
        `;

        const handles=[
            //handle 1        
            (results)=>{
                console.log(results)
                //if timeslot is already occupied, timeslot is not available
                if(results[0].TimeslotAlreadyReserved){
                    const error_message="timeslot is already occupied"
                    console.log(error_message)//,": ",data)

                    res.writeHeader(200,utility.content.json)
                    res.end(JSON.stringify({error:error_message}))

                    database.disconnect(connection)
                    return false;
                }
                return true;
            },

            //handle 2
            (results)=>{
                console.log(results)
                //check if this number is 0 (allow further checks) or !=0 (disallow) (see description above query)
                if(results[0].NumImmunocompromisedInRoom!=0){
                    const error_message="room is already occupied by an immunocompromised person that is not you"
                    console.log(error_message)//,": ",data)

                    res.writeHeader(200,utility.content.json)
                    res.end(JSON.stringify({error:error_message}))

                    database.disconnect(connection)
                    return false;
                }
                return true;
            },

            //handle 3
            (results)=>{
                console.log(results)
                //if room is full, timeslot is not available
                if(results[0].NumberPeopleInRoom==results[0].RoomCapacity){
                    const error_message="room is already at max capacity at that time"
                    console.log(error_message)//,": ",data)

                    res.writeHeader(200,utility.content.json)
                    res.end(JSON.stringify({error:error_message}))

                    database.disconnect(connection)
                    return false;
                }
                //if you are immunocompromised and the room is partially occupied by someone else, timeslot is not available
                if(results[0].YouAreImmunoCompromised && results[0].NumberPeopleInRoom>0){
                    const error_message="room is already at occupied at that time"
                    console.log(error_message)//,": ",data)

                    res.writeHeader(200,utility.content.json)
                    res.end(JSON.stringify({error:error_message}))

                    database.disconnect(connection)
                    return true;
                }
            }
        ]

        database.connection.query(query,(error,results,fields)=>{
            if(error){
                const error_message="timeslot availability check query failed";
                console.log(error_message,error)
    
                res.writeHeader(200,utility.content.json)
                res.end(JSON.stringify({error:error_message}))
    
                return
            }
            if(
                handles[0](results[0])
                && handles[1](results[1])
                && handles[2](results[2])
            ){
                console.log("works")
    
                res.writeHeader(200,utility.content.json)
                res.end(JSON.stringify({success:"timeslot is available"}))
            }
        })
    })
}
module.exports.check_timeslot_available=check_timeslot_available