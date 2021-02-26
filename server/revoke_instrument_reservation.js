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
    database.connect_database((connection,error)=>{
        if(error){
            const error_message="failed to connect to db for timeslot revocation"
            console.log(error_message)
            if(!error.fatal){
                database.disconnect(connection)
            }
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:error_message}))
            return
        }
        utility.parse_data(req,(data)=>{
            //make sure all of the expected data is here and defined
            for(attribute of "ssn booking_id".split(" ")){
                if(!data[attribute]){
                    const error_message="request is missing the attribute '"+attribute+"'"
                    console.log(error_message)

                    res.writeHeader(200,utility.content.json)
                    res.end(JSON.stringify({error:error_message}))

                    database.disconnect(connection)
                    return
                }
            }

            //make sure a user only revokes their own bookings?
            connection.query("delete from booking where BookingID=? and SSN=?;",[data.booking_id,data.ssn],(error,results,fields)=>{
                if(error){
                    const error_message="failed to delete booking"
                    console.log(error_message)
                    if(!error.fatal){
                        database.disconnect(connection)
                    }
                    res.writeHeader(200,utility.content.json)
                    res.end(JSON.stringify({error:error_message}))
                    return
                }
                if (results.affectedRows!=1){
                    const error_message="failed to remove the booking. maybe it was removed already?"
                    console.log(error_message)

                    res.writeHeader(200,utility.content.json)
                    res.end(JSON.stringify({error:error_message}))

                    database.disconnect(connection)
                    return
                }

                database.disconnect(connection)
                res.writeHeader(200,utility.content.json)
                res.end(JSON.stringify({result:"successfully revoked booking"}))
            })
        })
    })

}
module.exports.revoke_reservation=revoke_reservation