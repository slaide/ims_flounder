const utility=require("./utility.js")
const database=require("./database.js")

//send personal schedule:
//combine all reservations for a single user into one schedule
function get_personal_schedule(req,res){
    database.connect_database((connection,error)=>{
        if(error){
            console.log(">> error connecting database for personal schedule",error)
            if(!error.fatal){
                database.disconnect(database)
            }
            return
        }
        //Q: Get user SSN from storage in overview.html
        connection.query("start_Time, End_Time, Date, Inst_ID FROM booking WHERE SSN = ?", [user_SSN], (err, result)=> {
            if(error){
                console.log("error selecting attributes from booking",error)
                if(!error.fatal){
                    database.disconnect(connection)
                }
                return
            }
            //If schedule sent for instrument works then use the same here. 
        })
    })
}