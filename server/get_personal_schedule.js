const utility=require("./utility.js")
const database=require("./database.js")

/**
 * sends personal schedule for a user 
 * currently expects client data: SSN
 * currently responds with: string with bookings, error(?) 
 * @param {Request} req Request object with client data
 * @param {Response} res Response object
 **/

function get_personal_schedule(req,res){
    utility.parse_data(req,(data)=>{
        console.log('>>data: ', data)
        console.log('>> SSN: ',data.SSN) 

        var sql="SELECT booking.Booking_ID, booking.Start_Time, booking.End_Time, instrument.Description FROM booking JOIN instrument ON booking.Ins_ID=instrument.Ins_ID WHERE booking.SSN = ? and instrument.Exist=1" 

        database.connection.query(sql, [data.SSN], (error, result)=> {
            if(error){
                const error_message="error selecting attributes: '"+error+"'"
                console.log(error_message)

                res.writeHeader(200,utility.content.json)
                res.end(JSON.stringify({error:error_message}))
                return
            }
            console.log(">>result:", result)
            db_booking=JSON.parse(JSON.stringify(result))  
            console.log('>> db_booking: ', db_booking) 

            var ret=[];
            for(item of db_booking){
                ret.push({BookingID:item.Booking_ID, StartTime:item.Start_Time, EndTime:item.End_Time, Description:item.Description})
            }
            res.writeHeader(200,utility.content.from_filename(".json"))
            res.end(JSON.stringify(ret))
            console.log(">> Sent scedule for user", data.SSN) 
        })
    })
}
module.exports.get_personal_schedule=get_personal_schedule