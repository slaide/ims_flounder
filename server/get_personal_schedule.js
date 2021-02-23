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
        utility.parse_data(req,(data)=>{
            console.log('>>data: ', data)
            console.log('>> ins_id: ',data.SSN) 

            //Q: Wait answere datetime stuff 
            //Q:waiting answere from Linnea
            connection.query("Start_Time, End_Time, FROM booking WHERE SSN = ?", [data.SSN], (error, result)=> {
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
                    ret.push({StartTime:item.Start_Time, EndTime:item.End_Time})
                }
                res.writeHeader(200,utility.content.from_filename(".json"))
                res.end(JSON.stringify(ret))
                console.log(">> Sent scedule for user", data.SSN)
                
                database.disconnect(connection)
                console.log('>> Database disconnected')
            })
        })
    })
}