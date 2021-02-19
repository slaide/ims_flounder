const utility=require("./utility.js")
const database=require("./database.js")

//revoke reservation of some timeslot(s) on a single machine
function revoke_reservation(req,res){
    console.log("tying to revoke a reservation with a function that is not done yet. no promises on what will happen.")

    database.connect_database((connection,error)=>{
        if(error){
            console.log("failed to connect to db for timeslot reservation")
            if(!error.fatal){
                database.disconnect(connection)
            }
            return
        }
        utility.parse_data(req,(data)=>{
            if(!data.InsID || !data.Username || !data.SSN || !data.booking_id){
                console.log("request is missing at least one these attributes: InsID, StartTime, EndTime, Username, SSN")
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