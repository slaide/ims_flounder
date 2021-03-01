const utility=require("./utility.js")
const database=require("./database.js")

//description is wrong
/**
 * Reserve the requested timeslot for the specified user on the specified instrument
 * currently expects client data: ins_id, start_time, ssn
 * currently responds with: error/success
 * @param {Request} req Request object with client data
 * @param {Response} res Response object
 * @param {? Object} insert_data data that will be inserted into the database if the slot is available
 */
function check_timeslot_available(req,res,insert_data=null){
    function perform_action(data){
        //make sure all of the expected data is here and defined
        for(attribute of "ins_id start_time ssn".split(" ")){
            if(!data[attribute]){
                const error_message="request is missing the attribute '"+attribute+"'"
                console.log(error_message)

                res.writeHeader(200,utility.content.json)
                res.end(JSON.stringify({error:error_message}))

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

        var start_insert="";
        var insert_statement="";
        var end_insert="";

        if(insert_data){
            start_insert="start transaction;";
            insert_statement=`
                if (@TimeslotAlreadyReserved = 0)
                and (@NumImmunocompromisedInRoom=0)
                and (@RoomCapacity > @NumberPeopleInRoom)
                and ((@YouAreImmunoCompromised = 0) or (@NumberPeopleInRoom = 0))
                then
                    insert into booking(Start_time, End_time, Status, SSN, Ins_ID, Note) 
                    values("${insert_data.start_time}","${insert_data.end_time}",'booked',${insert_data.ssn},${insert_data.ins_id},"${insert_data.notes}");
                end if;
                `
            end_insert="commit;"
        }

        const query=`
            ${start_insert}
            #query 1
            select @TimeslotAlreadyReserved := count(*) as TimeslotAlreadyReserved 
            from booking 
            where Ins_ID=${data.ins_id} 
            and timediff(Start_Time,"${data.start_time}")=0;

            #query 2
            select @NumImmunocompromisedInRoom := count(*) as NumImmunocompromisedInRoom
            from booking
            join user on user.SSN=booking.SSN
            join instrument on instrument.Ins_ID=booking.Ins_ID
            join room on room.Room_ID=instrument.Room_ID
            where timediff(Start_Time,"${data.start_time}")=0
            and user.Immunocompromised=1
            and not user.SSN=${data.ssn} #not be self
            and room.Room_ID in (select Room_ID from instrument where instrument.Ins_ID=${data.ins_id});

            #query 3
            select @RoomCapacity := room.Capacity as RoomCapacity,
                @NumberPeopleInRoom := count(distinct user.SSN) as NumberPeopleInRoom,
                @YouAreImmunoCompromised := (select Immunocompromised from user where user.SSN=${data.ssn}) as YouAreImmunoCompromised
            from booking join user on booking.SSN=user.SSN
            join instrument on booking.Ins_ID=instrument.Ins_ID
            join room on instrument.Room_ID=room.Room_ID
            where instrument.Room_ID in (
                select Room_ID from instrument where instrument.Ins_ID=${data.ins_id}
            )
            and timediff(Start_Time,"${data.start_time}")=0
            and not user.SSN=${data.ssn};
            ${insert_statement}
            ${end_insert}
        `;
        if(insert_data){
            console.log(query)
        }

        const handles=[
            //handle 1        
            (results)=>{
                //if timeslot is already occupied, timeslot is not available
                if(results[0].TimeslotAlreadyReserved){
                    const error_message="timeslot is already occupied"
                    console.log(error_message)//,": ",data)

                    res.writeHeader(200,utility.content.json)
                    res.end(JSON.stringify({error:error_message}))

                    return false;
                }
                return true;
            },

            //handle 2
            (results)=>{
                //check if this number is 0 (allow further checks) or !=0 (disallow) (see description above query)
                if(results[0].NumImmunocompromisedInRoom!=0){
                    const error_message="room is already occupied by an immunocompromised person that is not you"
                    console.log(error_message)//,": ",data)

                    res.writeHeader(200,utility.content.json)
                    res.end(JSON.stringify({error:error_message}))

                    return false;
                }
                return true;
            },

            //handle 3
            (results)=>{
                //if room is full, timeslot is not available
                if(results[0].NumberPeopleInRoom==results[0].RoomCapacity){
                    const error_message="room is already at max capacity at that time"
                    console.log(error_message)//,": ",data)

                    res.writeHeader(200,utility.content.json)
                    res.end(JSON.stringify({error:error_message}))

                    return false;
                }
                //if you are immunocompromised and the room is partially occupied by someone else, timeslot is not available
                if(results[0].YouAreImmunoCompromised && results[0].NumberPeopleInRoom>0){
                    const error_message="room is already at occupied at that time"
                    console.log(error_message)//,": ",data)

                    res.writeHeader(200,utility.content.json)
                    res.end(JSON.stringify({error:error_message}))

                    return false;
                }
                return true;
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

            const result_offset=0+!!insert_data
            if(
                handles[0](results[0+result_offset])
                && handles[1](results[1+result_offset])
                && handles[2](results[2+result_offset])
            ){
                if(insert_data && results[results.length-2].affectedRows!=1){
                    const error_message="inserting new booking failed";
                    console.log(error_message,results[results.length-2])
        
                    res.writeHeader(200,utility.content.json)
                    res.end(JSON.stringify({error:error_message}))
        
                    return
                }
                res.writeHeader(200,utility.content.json)
                res.end(JSON.stringify({success:"timeslot is available"}))
            }
        })
    }
    if(insert_data){
        perform_action(insert_data)
    }else{
        utility.parse_data(req,(data)=>{
            perform_action(data)
        })
    }
}
module.exports.check_timeslot_available=check_timeslot_available