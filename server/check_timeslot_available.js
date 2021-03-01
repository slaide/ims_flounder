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

        const query=`
            call check_timeslot_available("${data.start_time}","${data.end_time || "1900-01-01 00:00:00"}","${data.ssn}","${data.ins_id}","${data.notes || ""}",${(!!insert_data)?1:0});
        `;

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
                if(results[0].NumImmunocompromisedInRoom>0){
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

            if(
                handles[0](results[0])
                && handles[1](results[1])
                && handles[2](results[2])
            ){
                if(insert_data && results[3].affectedRows!=1){
                    const error_message="inserting new booking failed";
                    console.log(error_message,results[4])
        
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