const utility=require("./utility.js")
const database=require("./database.js")

/**
 * Retrives and sends all bookings for a specific instrument
 * currently expects client data: Ins_ID
 * currently responds with: string with bookings, error(?) 
 * @param {Request} req Request object with client data
 * @param {Response} res Response object
 **/

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
            console.log(">> Sent schedule for intrument", data.insID)
        })
    }) 
}
module.exports.get_instrument_schedule=get_instrument_schedule