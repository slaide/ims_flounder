const utility=require("./utility.js")
const database=require("./database.js")

/**
 * Respond to a request with a list of all rooms in json format
 * currently expects client data: ssn
 * currently responds with: list of (RoomID, RoomCode)
 * @param {Request} req Request object with client data
 * @param {Response} res Response object
 */
function get_rooms(req,res){
    utility.parse_data(req,(data)=>{
        database.rooms.get(data,(error)=>{
            if(error.fatal) throw error
            utility.log(`error selecting rooms: ${error.message} in ${error.source}`)

            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:error}))
        },(results)=>{
            var ret=[];
            for(item of results){
                ret.push({RoomID:item.Room_ID})
            }
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify(ret))

            utility.log(`sent room list to user ${data.ssn}`)
        })
    })
}
module.exports.get_rooms=get_rooms

/**
 * Respond to a request with a list of all rooms in json format, without special rights specification (admin needs to see list of all rooms)
 * currently expects client data: ssn
 * currently responds with: list of (RoomID, RoomCode)
 * @param {Request} req Request object with client data
 * @param {Response} res Response object
 */
function get_rooms_admin(req,res){
    utility.parse_data(req,(data)=>{
        database.rooms.get_admin(data,(error)=>{
            if(error.fatal) throw error
            utility.log(`error selecting rooms for admin: ${error.message} in ${error.source}`)

            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:error}))
        },(results)=>{
            var ret=[];
            for(item of results){
                ret.push({RoomID:item.Room_ID})
            }
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify(ret))

            utility.log(`sent room list to admin ${data.ssn}`)
        })
    })
}
module.exports.get_rooms_admin=get_rooms_admin

/**
 * Respond to a request with a list of all machines in a specific room in json format
 * currently expects client data: RoomID
 * currently responds with: InsID, description
 * @param {Request} req Request object with client data
 * @param {Response} res Response object
 */
function get_instruments_in_room(req,res){
    utility.parse_data(req,(data)=>{
        database.instruments.get(data,(error)=>{
            if(error.fatal) throw error
            utility.log(`error getting instruments in room: ${error.message} in ${error.source}`)

            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:error}))
        },(results)=>{
            var ret=[];
            for(item of results){
                ret.push({InsID:item.Ins_ID,description:item.Description})
            }
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify(ret))

            utility.log(`sent instrument list to user ${data.ssn}`)
        })
    })
}
module.exports.get_instruments_in_room=get_instruments_in_room

/**
 * Respond to a request with a list of all machines in a specific room in json format, without special rights specification (admin needs to see list of all instruments)
 * currently expects client data: RoomID
 * currently responds with: InsID, description
 * @param {Request} req Request object with client data
 * @param {Response} res Response object
 */
function get_instruments_in_room_admin(req,res){
    utility.parse_data(req,(data)=>{
        database.instruments.get_admin(data,(error)=>{
            if(error.fatal) throw error
            utility.log(`error getting instruments in room for admin: ${error.message} in ${error.source}`)

            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:error}))
        },(results)=>{
            var ret=[];
            for(item of results){
                ret.push({InsID:item.Ins_ID,description:item.Description})
            }
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify(ret))

            utility.log(`sent instrument list to admin ${data.ssn}`)
        })
    })
}
module.exports.get_instruments_in_room_admin=get_instruments_in_room_admin