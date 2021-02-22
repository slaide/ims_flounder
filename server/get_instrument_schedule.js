const utility=require("./utility.js")
const database=require("./database.js")

//send schedule for a single instrument:
//client input: some instrument's id
//return schedule for this instrument
//schedule=list of reserved timeslots with start- and end-time, and username
function get_instrument_schedule(req,res){
    
    utility.parse_data(req,(data)=>{
        console.log('>>data: ', data)
        console.log('>> ins_id: ',data.insID) 

        database.connect_database((connection,error)=>{
            if(error){
                console.log(">> error connecting database for schedule of instrument ID",error)
                if(!error.fatal){
                    database.disconnect(database)
                }
                return
            }
            
            connection.query("Start_Time, End_Time, Date FROM booking WHERE Ins_ID = ?", [data.insID], (err, result)=> {
                if(error){
                    console.log("error selecting attributes from booking",error)
                    if(!error.fatal){
                        database.disconnect(connection)
                    }
                    return
                }
                //Q: When no bookings exist? And when res is only 1 long.  
                var ret=[];
                for(item of result){
                    ret.push({Date: item.Date, StartTime:item.start_Time, EndTime: item.End_Time})
                }
                res.writeHeader(200,utility.content.from_filename(".json"))
                res.end(JSON.stringify(ret))

                console.log(">> sent scedule for intrument", data.insID)
                
                database.disconnect(connection)
                console.log('>> Database disconnected')
   
            })
        })
    }) 
}
module.exports.get_instrument_schedule=get_instrument_schedule