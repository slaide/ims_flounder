const utility=require("./utility.js")
const database=require("./database.js")

//send schedule for a single instrument:
//client input: some instrument's id
//return schedule for this instrument
//schedule=list of reserved timeslots with start- and end-time, and username
function get_instrument_schedule(req,res){
    utility.parse_data(req,(data)=>{
        console.log('>> ins_id: ',data.insID) 

        database.connect_database((connection,error)=>{
            if(error){
                console.log(">> error connecting database for schedule of instrument ID",error)
                if(!error.fatal){
                    database.disconnect(database)
                }
                return
            }
            //Q: How show user? SSN not very safe displayed for employees. Name? 
            connection.query("start_Time, End_Time, Date, SSN FROM booking WHERE Inst_ID = ?", [data.insID], (err, result)=> {
                if(error){
                    console.log("error selecting attributes from booking",error)
                    if(!error.fatal){
                        database.disconnect(connection)
                    }
                    return
                }
                var ret=[];
                for(item of result){
                    ret.push({Date: item.Date, StartTime:item.start_Time, EndTime: item.End_Time, SSN: item.SSN})
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
module.exports.get_schedule=get_schedule