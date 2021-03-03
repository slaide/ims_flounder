const utility=require("./utility.js")
const database=require("./database.js")

/**
 * Removes user from the system by changing exist attribute to 0 for certain user
 * currently expects client data: SSN 
 * currently responds with: error/success
 * @param {Request} req Request object with client data
 * @param {Response} res Response object
 */

 function remove_user(req,res){
    throw "unimplemented"
    utility.parse_data(req,(data)=>{


    })
 }
 module.exports.remove_user=remove_user