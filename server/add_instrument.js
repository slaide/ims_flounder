const utility=require("./utility.js")
const database=require("./database.js")
const fs=require("fs")

/**
 * Add a new instrument to the system
 * currently expects client data: Description,Serial,Proc_date,Room_ID
 * currently responds with: json error/success
 * @param {Request} req Request object with client data
 * @param {Response} res Response object
 */
function add_instrument(req,res){
    utility.parse_data(req,(data)=>{
        database.instruments.add(data,(error)=>{
            if(error.fatal) throw error;
            
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({error:error}))

        },(results)=>{
            res.end(fs.readFileSync("../html/ADMIN_DEMO_2.html",utility.encoding.utf8))
        })
    })
}
module.exports.add_instrument=add_instrument;