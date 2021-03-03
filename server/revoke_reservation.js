const utility=require("./utility.js")
const database=require("./database.js")

/**
 * Revoke reservation of some timeslot(s) on a single machine
 * currently expects client data: ssn, booking_id
 * currently responds with: error/success
 * @param {Request} req Request object with client data
 * @param {Response} res Response object
 */
function revoke_reservation(req,res){
    utility.parse_data(req,(data)=>{
        //make sure all of the expected data is here and defined
        for(attribute of "ssn booking_id".split(" ")){
            if(!data[attribute]){
                const error_message=`request is missing the attribute '${attribute}'`
                utility.log(error_message)

                res.writeHeader(200,utility.content.json)
                res.end(JSON.stringify({error:error_message}))

                return
            }
        }

        //make sure a user only revokes their own bookings?
        database.connection.query("delete from booking where Booking_ID=? and SSN=?;",[data.booking_id,data.ssn],(error,results,fields)=>{
            if(error){
                const error_message="failed to delete booking"
                utility.log(`${error_message}: ${error}`)

                res.writeHeader(200,utility.content.json)
                res.end(JSON.stringify({error:error_message}))
                return
            }
            if (results.affectedRows!=1){
                const error_message="failed to remove the booking. maybe it was removed already?"
                utility.log(`${error_message}: ${data}`)

                res.writeHeader(200,utility.content.json)
                res.end(JSON.stringify({error:error_message}))

                return
            }

            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({result:"successfully revoked booking"}))
        })
    })
}
module.exports.revoke_reservation=revoke_reservation