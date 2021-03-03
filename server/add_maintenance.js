const utility=require("./utility.js")
const database=require("./database.js")

/**
 * Adds maintenance to ins_mantenance table in db
 * currently expects client data: DateTime, Status, Notes, SSN, Ins_ID
 * currently responds with: error/success
 * @param {Request} req Request object with client data
 * @param {Response} res Response object
 **/

function add_maintenance(req,res){
    utility.parse_data(req,(data)=>{
        var add_user_data=[]
        //make sure all of the expected data is here and defined
        //Q: How to do with maintenance ID since it will autogenerate? 
        const attributes="DateTime, Status, Notes, SSN, Ins_ID"
        for(attribute of attributes.split(", ")){
            if(!data[attribute]){
                const error_message="request is missing the attribute '"+attribute+"'"
                console.log(error_message)

                res.writeHeader(200,utility.content.json)
                res.end(JSON.stringify({error:error_message}))

                return
            }
            //add data to array in sequence also used in db
            add_user_data.push(data[attribute])
        }

        //create the placeholder questionsmarks with comma seperation for the sql query (so the number of question marks stays consistent with the number of values inserted)
        var query_placeholders="?"
        for(var i=1;i<add_user_data.length;i++){
            query_placeholders+=",?"
        }
        console.log(query_placeholders,add_user_data)
        //insert into booking values(...);
        //insert into booking(SSN,notes,...) values(...);
        //look into do maintenance_ID and Exist attribute
        database.connection.query(`insert into ins_maintenance(${attributes}) values (${query_placeholders});`,add_user_data,(error,results,fields)=>{
            if(error){
                const error_message="failed to add maintenance because "+error
                console.log(error_message)

                res.writeHeader(200,utility.content.json)
                res.end(JSON.stringify({error:error_message}))
                return
            }

            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({result:"successfully added maintenance"}))
        })
    })
}
module.exports.add_maintenance=add_maintenance; 