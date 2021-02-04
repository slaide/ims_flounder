function check_login_data(req,res){
    //parse login data from req
    utility.parse_data(req,(user_data)=>{
        console.log(user_data)
        var connection=database.connect()
        var user_database_Stuff=connection.query("select * from users where username...")
        if(user_database_Stuff.num_rows==1){
            ...
        }
        //do work with userdata here
        //check if exists in database
        //check password
        //send some answer to the client
        //not yet decided if answer should be a file or some other data
    })
}