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
        if(!data.ssn){
            const error_message="ssn missing in request data for room list request"
            utility.log(error_message)

            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:error_message}))
            return
        }
        database.connection.query("select Room_ID from room where strcmp(Class,(select Special_rights from User where SSN=?))>=0;",[data.ssn],(error,result,fields)=>{
            if(error){
                const error_message="error selecting rooms"
                utility.log(`${error_message} ${error}`,"error")

                res.writeHeader(200,utility.content.json)
                res.end(JSON.stringify({error:error_message}))
                return
            }
            var ret=[];
            for(item of result){
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
 * Respond to a request with a list of all machines in a specific room in json format
 * currently expects client data: RoomID
 * currently responds with: InsID, description
 * @param {Request} req Request object with client data
 * @param {Response} res Response object
 */
function get_instruments_in_room(req,res){
    utility.parse_data(req,(data)=>{
        //make sure all of the expected data is here and defined
        for(attribute of "RoomID ssn".split(" ")){
            if(!data[attribute]){
                const error_message=`request is missing the attribute '${attribute}'`
                utility.log(`${error_message}`)

                res.writeHeader(200,utility.content.json)
                res.end(JSON.stringify({error:error_message}))

                return
            }
        }
        database.connection.query(`select Ins_ID,Description from instrument where Room_ID="${data.RoomID}";`,(error,result,fields)=>{
            if(error){
                utility.log(`error selecting instruments ${error}`,"error")

                return
            }
            var ret=[];
            for(item of result){
                ret.push({InsID:item.Ins_ID,description:item.Description})
            }
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify(ret))

            utility.log(`sent instruments for room ${data.RoomID} requested by user ${data.ssn}`)
        })
    })
}
module.exports.get_instruments_in_room=get_instruments_in_room