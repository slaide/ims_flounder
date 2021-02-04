const http=require("http")
const fs=require("fs")
const mysql=require("mysql")
const url = require("url")
const utility=require("./utility.js")

function read_404_page(){
    return fs.readFileSync("../html/404.html",utility.encoding.utf8)
}

var num_connection=0
function end_connection(connection){
    connection.end(
        function(err){
            if(err){
                throw err;
            }else{
                console.log("disconnected successfully")
            }
        }
    )
}
const request_handler={
    "/":function(req,res){
        req.url="/index.html"
        if(!utility.send_static_data(req,res)){
            throw("could not find homepage file? aborting.")
        }
    },
    "/login":function(req,res){
        let connection_data={
            host:"localhost",
            user:"root",
            password:"",
            database:"lims"
        }

        var connection=mysql.createConnection(connection_data)

        function abort_login(){
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({loginAttempt:"unsuccessful"}))
        }
        function login_successful(){
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({loginAttempt:"successful"}))
        }
    
        connection.connect(
            function(err){
                if(err){
                    if(err.code=="ECONNREFUSED"){
                        console.log("database is not running")
                    }else if(err.sqlMessage){
                        if(err.code=="ER_BAD_DB_ERROR"){
                            console.log("database not found. creating...")
                            var create_database_connection=mysql.createConnection({host:"localhost",user:"root",password:""})
                            create_database_connection.connection((err)=>{if(err){console.log("database creation failed.",err)}})
                            //read the data from selmas user.sql file
                            return
                        }
                        console.log("database error: ",err.sqlMessage)
                    }else{
                        console.log("unexpected sql error: ",err)
                    }

                    if(!err.fatal){
                        end_connection(connection)
                    }
                    abort_login()
                    return
                }

                console.log("connected successfully")
                
                var login_data={username:null,password:null}
                connection.query("select * from users where username=? and password=?;",[login_data.username,login_data.password],function(err,results,fields){
                    if(err){
                        if(err.code=="ER_NO_SUCH_TABLE"){
                            console.log("table 'users' does not exist.")
                        }else{
                            console.log("error on login data check: ",err)
                        }

                        if(!err.fatal){
                            end_connection(connection)
                        }
                        abort_login()
                        return
                    }
                        
                    //to the important work here
                    
                    login_successful()

                    end_connection(connection)
                })
            }
        )
    },
    "/backup_database":function(req,res){
        throw("backup the current contents of the database")
    },
    "/restore_database":function(req,res){
        throw("rebuild the database from the two files describing the structure and contents of the database")
    },
    "/shutdown":function(req,res){
        res.end()
        throw({force_shutdown:true})
    }
}

const server=http.createServer((req,res)=>{
    try{
        //check if url is known to server
        handler=request_handler[req.url]
        if(handler){
            handler(req,res)
            return
        //if url is not a special case
        }else{
            //check if url is a static file, send the file if so
            if(!utility.send_static_data(req,res)){
                //otherwise send 404
                console.log(req.url, " could not be found.")
                res.writeHeader(404,utility.content.html)
                res.end(read_404_page())
            }
            return
        }
    }catch(e){
        //force_shutdown is set on graceful shutdown request
        if(!e.force_shutdown){
            console.log(e)
        //every other throw is fatal
        }else{
            console.log("closing web server.")
            server.close()
        }
    }
})
server.listen(8080,"127.0.0.1",()=>{
    console.log("server started at '127.0.0.1:8080'")
})