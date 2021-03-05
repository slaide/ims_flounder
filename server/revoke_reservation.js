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
        database.bookings.remove(data,(error)=>{
            if(error.fatal) throw error; 
 
            const error_message="failed to delete booking"
            utility.log(`${error_message}: ${JSON.stringify(error)}`)
 
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:error}))
        },()=>{
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({result:"successfully revoked booking"}))
        })
    })
}
module.exports.revoke_reservation=revoke_reservation