const utility=require("./utility.js")
const database=require("./database.js")

//return list of all rooms (in lab)
//include all room specific data (id, name etc.)
function get_list(req,res){
    database.connect_database((connection,error)=>{
        if(error){
            console.log("error connecting for room selection",error)
            if(!error.fatal){
                database.disconnect(database)
            }
            return
        }
        connection.query("select Room_ID,Room_code from room;",(error,result,fields)=>{
            if(error){
                console.log("error selection rooms",error)
                if(!error.fatal){
                    database.disconnect(connection)
                }
                return
            }
            var ret=[];
            for(item of result){
                ret.push({RoomID:item.Room_ID,RoomCode:item.Room_code})
            }
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify(ret))

            database.disconnect(connection)

            console.log("sent room list")
        })
    })
}
module.exports.get_list=get_list

//return list of machines in a specific room
//include all machine data (id, name, type etc.)
function get_machines(req,res){
    database.connect_database((connection,error)=>{
        if(error){
            console.log("error connecting for instrument selection",error)
            if(!error.fatal){
                database.disconnect(database)
            }
            return
        }
        utility.parse_data(req,(data)=>{
            connection.query("select Ins_ID,Description from instrument where ?;",{Room_ID:data.RoomID},(error,result,fields)=>{
                if(error){
                    console.log("error selecting instruments",error)
                    if(!error.fatal){
                        database.disconnect(connection)
                    }
                    return
                }
                var ret=[];
                for(item of result){
                    ret.push({InsID:item.Ins_ID,description:item.Description})
                }
                res.writeHeader(200,utility.content.from_filename(".json"))
                res.end(JSON.stringify(ret))

                console.log("sent machines for room ",data.RoomID)
            })
        })
    })
}
module.exports.get_machines=get_machines