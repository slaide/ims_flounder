function check_login_data(req,res){
    //parse login data from req
    console.log("Check login function")
    utility.parse_data(req,(user_data)=>{
        console.log(user_data)   //user_data.password, user_data.email
        
        var connection=database.connect_database()
        
        //result obj is array, cont each row as object
        var db_email=connection.query("SELECT email FROM users WHERE email= 'user_data.email'")
        console.log(db_email)
        //email match 
        if(db_email.lenght==1){
            //check password match 
            console.log("email match found")
            var db_password=connection.query("SELECT password FROM user WHERE email= 'user_data.email'")
            if(user_data.password.localeCompare(db_password)==0){
                console.log("Password match")
                //password match
                //send some answer to the client
                //not yet decided if answer should be a file or some other data
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
