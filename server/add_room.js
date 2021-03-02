const utility=require("./utility.js")
const database=require("./database.js")

/**
 * Add a new room to the system
 * currently expects client data: Room_ID, Area, Capacity, Class, Room_code, Building_code
 * currently responds with: error/success
 * @param {Request} req Request object with client data
 * @param {Response} res Response object
 */
function add_room(req,res){
    utility.parse_data(req,(data)=>{
        var add_user_data=[]
        //make sure all of the expected data is here and defined
        for(attribute of "Room_ID, Room_code, Area, Building_code, Capacity, Class".split(", ")){
            if(!data[attribute]){
                const error_message=`request is missing the attribute '${attribute}'`
                console.log(error_message)

                res.writeHeader(200,utility.content.json)
                res.end(JSON.stringify({error:error_message}))

                return
            }
            //add data to array in sequence also used in db
            add_user_data.push(data[attribute])
        }

        //create the placeholder questionsmarks with comma seperation for the sql query (so the number of question marks stays consistent with the number of values inserted)
        var query_placeholders="'?'"
        for(var i=1;i<add_user_data.length;i++){
            query_placeholders+=",'?'"
        }
        //make sure a user only revokes their own bookings?
        connection.query(`insert into room values (${query_placeholders});`,add_user_data,(error,results,fields)=>{
            if(error){
                const error_message="failed to add room because "+error
                console.log(error_message)

                res.writeHeader(200,utility.content.json)
                res.end(JSON.stringify({error:error_message}))
                return
            }

            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({result:"successfully added room"}))
        })
    })
}
module.exports.add_room=add_room;