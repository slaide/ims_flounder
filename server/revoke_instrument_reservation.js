const utility=require("./utility.js")
const database=require("./database.js")

/**
 * Revoke reservation of some timeslot(s) on a single machine
 * currently expects client data: InsID, Username, SSN, booking_id
 * currently responds with: success
 * @param {Request} req Request object with client data
 * @param {Response} res Reponse object
 */
function revoke_reservation(req,res){
    console.log("tying to revoke a reservation with a function that is not done yet. no promises on what will happen.")

    database.connect_database((connection,error)=>{
        if(error){
            console.log("failed to connect to db for timeslot revocation")
            if(!error.fatal){
                database.disconnect(connection)
            }
            return
        }
        utility.parse_data(req,(data)=>{
            if(!data.InsID || !data.Username || !data.SSN || !data.booking_id){
                console.log("request is missing at least one these attributes: InsID, Username, SSN, booking_id")
                database.disconnect(connection)
                return
            }

            database.disconnect(connection)

            throw "unimplemented"

            connection.query("delete from booking where BookingID=?;",[data.booking_id],(error,results,fields)=>{

            })
        })
    })

}
module.exports.revoke_reservation=revoke_reservation