const utility=require("./utility.js")
const database=require("./database.js")

//send schedule for a single instrument:
//client input: some instrument's id
//return schedule for this instrument
//schedule=list of reserved timeslots with start- and end-time, and username
function get_instrument_schedule(req,res){

    utility.parse_data(req,(data)=>{
        console.log('>>data: ', data)
        console.log('>> ins_id: ',data.insID) 

        database.connection.query("Select Start_Time, End_Time FROM booking WHERE Ins_ID = ?", [data.insID], (error, result)=> {
            if(error){
                console.log("error selecting attributes from booking",error)
                if(!error.fatal){
                    database.disconnect(connection)
                }
                return
            }
            db_booking=JSON.parse(JSON.stringify(result))  
            console.log('>> db_booking: ', db_booking)

            var ret=[];
            for(item of db_booking){
                var new_booking={}
                new_booking.StartTime=utility.format_time(item.Start_Time)
                new_booking.EndTime=utility.format_time(item.End_Time)
                ret.push(new_booking)
            }
            res.writeHeader(200,utility.content.from_filename(".json"))
            res.end(JSON.stringify(ret))
            console.log(">> Sent scedule for intrument", data.insID)
        })
    }) 
}
module.exports.get_instrument_schedule=get_instrument_schedule