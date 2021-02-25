const utility=require("./utility.js")
const database=require("./database.js")

///get maintanance function 
//function returns maintanance from ins_maintaenance in database
//for a specific ins_ID 
function get_maintanence(req,res) {
         
    utility.parse_data(req,(data)=>{
        console.log('>>data: ', data) 
        console.log('>> ins_id: ',data.InsID) 
        
        database.connect_database((connection,error)=>{
            if(error){
                console.log(">> error connecting database for maintenace of instrument ID",error)
                if(!error.fatal){
                    database.disconnect(database)
                }
                return
            }
            var sql ="SELECT DateTime, Status, Notes FROM ins_maintenance WHERE Ins_ID = ?"
            connection.query(sql, [data.InsID], (error, result)=> {
                if(error){
                    console.log("error selecting attributes from ins_maintenance",error)
                    if(!error.fatal){
                        database.disconnect(connection)
                    }
                    return
                }
                db_maintenance=JSON.parse(JSON.stringify(result))  
                console.log('>> db_maintenance: ', db_maintenance) 
    
                var ret=[];
                for(item of db_maintenance){
                    ret.push({DateTime:item.DateTime, Status:item.Status, Notes:item.Notes})
                }   
                //console.log('>>ret:', ret) 
                res.writeHeader(200,utility.content.from_filename(".json"))
                res.end(JSON.stringify(ret))
                console.log(">> Sent maintenance") 
                    
                database.disconnect(connection)
                console.log('>> Database disconnected') 
            })
        })
    })
}
module.exports.get_maintanence=get_maintanence