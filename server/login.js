const utility=require("./utility.js")
const database=require("./database")
const mysql=require("mysql")

function check_login_data(req,res){
    //parse login data from req
    console.log("Inside login function")
    utility.parse_data(req,(user_data)=>{
        console.log(user_data)   //user_data.password, user_data.email is a string 
        
        var connection=database.connect_database()
        
        //result obj is array, containing each row as object
        //var db_email=connection.query("SELECT Email FROM user WHERE Email = 'user_data.email'")
        //console.log(db_email)
        connection.query("SELECT Email FROM user", function (err, db_email) {
            if(err) throw err; 
            console.log(db_email)
        })
        
        //check email match 
        if(db_email.lenght==1){
            //check password match 
            console.log("Email match found")
            var db_password=connection.query("SELECT Password FROM user WHERE Email = 'user_data.email'")
            if(user_data.password.localeCompare(db_password)==0){
                console.log("Password match")
                //Login sucefully 
                //send back file overview.html
                
            }
            else{
                console.log("No password match")
                //Password don't match. What send back? 
            }
            
        }
        //no email match 
        else{
           console.log("No email match")
           //What send back here?   
        }
        //database disconnnect
        
    })
}
module.exports.check_login_data=check_login_data
