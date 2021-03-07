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
        database.personal_schedule.get(data,(error)=>{
            if(error.fatal) throw error; 

            const error_message="error selecting attributes: '"+error+"'"
            utility.log(`${error_message}`)

            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:error}))
        },(db_bookings)=>{
            var ret=[];
            for(item of db_bookings){
                ret.push({BookingID:item.Booking_ID, StartTime:item.Start_Time, EndTime:item.End_Time, Description:item.Description})
            }
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify(ret))
            utility.log(`Bookings sent for user ${data.SSN}`)
        })
    })
}
module.exports.get_personal_schedule=get_personal_schedule