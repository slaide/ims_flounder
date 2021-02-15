const utility=require("./utility.js")
const database=require("./database.js")

/**
 * Reserve the requested timeslot for the specified user on the specified instrument
 * currently expects client data: InsID, StartTime, EndTime, Username
 * currently responds with: success
 * @param {Request} req Request object with client data
 * @param {Response} res Reponse object
 */
function reserve_timeslot(req,res){
    database.connect_database((connection,error)=>{

    })
}
module.exports.reserve_timeslot=reserve_timeslot