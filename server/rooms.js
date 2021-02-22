const utility=require("./utility.js")
const database=require("./database.js")

/**
 * Respond to a request with a list of all rooms in json format
 * currently expects client data: none
 * currently responds with: RoomID, RoomCode
 * @param {Request} req Request object with client data
 * @param {Response} res Reponse object
 */
function get_rooms(req,res){
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
module.exports.get_rooms=get_rooms

/**
 * Respond to a request with a list of all machines in a specific room in json format
 * currently expects client data: RoomID
 * currently responds with: InsID, description
 * @param {Request} req Request object with client data
 * @param {Response} res Reponse object
 */
function get_instruments_in_room(req,res){
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
                res.writeHeader(200,utility.content.json)
                res.end(JSON.stringify(ret))

                console.log("sent instruments for room ",data.RoomID)
            })
        })
    })
}
module.exports.get_instruments_in_room=get_instruments_in_room