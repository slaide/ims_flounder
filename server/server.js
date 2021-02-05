const http=require("http")
const fs=require("fs")
const url = require("url")
const utility=require("./utility.js")
const database=require("./database")
const login=require("./login.js")

const request_handler={
    "/":function(req,res){
        req.url="/index.html"
        if(!utility.send_static_data(req,res)){
            throw("could not find homepage file? aborting.")
        }
    },
    "/login":login.check_login_data,
    /*function(req,res){
        function abort_login(){
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({loginAttempt:"unsuccessful"}))
        }
        function login_successful(){
            res.writeHeader(200,utility.content.json)
            res.end(JSON.stringify({loginAttempt:"successful"}))
        }
    
        database.connect((connection,err)=>{
            if(err){
                console.log("failed to connect to database. did you turn off the database server?")//,err)
                if(!err.fatal){
                    database.disconnect(connection)
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
                        database.disconnect(connection)
                    }
                    abort_login()
                    return
                }
                    
                //to the important work here
                
                login_successful()

                database.disconnect(connection)
            })
        })
    },*/
    "/shutdown":function(req,res){
        res.end()
        throw({force_shutdown:true})
    }
}

const server=http.createServer((req,res)=>{
    try{
        //check if url is known to server
        handler=request_handler[req.url]
        console.log(req.url,handler)
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
                res.end(fs.readFileSync("../html/404.html",utility.encoding.utf8))
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
            server.close(()=>{
                console.log("server closed.")
            })
            return
        }
    }
})

function start_server(){
    server.listen(8080,"127.0.0.1",()=>{
        console.log("server started at '127.0.0.1:8080'")
    })
}

database.connect_build_database((database_connection)=>{
    database.disconnect(database_connection)
    start_server()
    return
})