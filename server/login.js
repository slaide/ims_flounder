function check_login_data(req,res){
    //parse login data from req
    utility.parse_data(req,(user_data)=>{
        console.log(user_data)   //user_data.password, user_data.username
        
        var connection=database.connect()
        
        //result obj is array, cont each row as object
        var db_email=connection.query("SELECT email FROM users WHERE email= 'user_data.username'")
        console.log(db_email)
        //username match 
        if(db_email.lenght==1){
            //check password match 
            var db_password=connection.query("SELECT password FROM user WHER email= 'user_data.username'")
            if(user_data.password.localeCompare(db_password)==0){
                //password match
                //send some answer to the client
                //not yet decided if answer should be a file or some other data
            }
            else{
                console.log("No password match")
                //Password don't match. What send back? 
            }
            
        }
        //no username match 
        else{
           console.log("No username match") 
        }
        
    })
}