const http=require("http")
const fs=require("fs")
const mysql=require("mysql")
const url = require("url")

function read_404_page(){
    return fs.readFileSync("../html/404.html",encoding.utf8)
}
function read_homepage(){
    return fs.readFileSync("../html/index.html",encoding.utf8)
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

function send_static_data(req,res){
    const html_folder=fs.readdirSync("../html");
    if(html_folder.includes(req.url.substr(1))){
        res.writeHeader(200,content.from_filename(req.url))
        res.write(fs.readFileSync("../html"+req.url,encoding.utf8))
        res.end()
        console.log(req.url, "was sent.")
        return true
    }

    return false
}

const content={
    html:{"Content-Type":"text/html"},
    css:{"Content-Type":"text/css"},
    js:{"Content-Type":"text/javascript"},
    json:{"Content-Type":"application/json"},
    from_filename:function(n){
        if(n.endsWith(".css")){
            return content.css
        }else if(n.endsWith(".js")){
            return content.js
        }else if(n.endsWith(".html")){
            return content.html
        }else if(n.endsWith(".json")){
            return content.json
        }
    }
}
const encoding={
    utf8:{encoding:"utf8"},
    base64:{encoding:"base64"},
}
const request_handler={
    "/":function(req,res){
        req.url="/index.html"
        if(!send_static_data(req,res)){
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
            res.writeHeader(200,content.json)
            res.end(JSON.stringify({loginAttempt:"unsuccessful"}))
        }
        function login_successful(){
            res.writeHeader(200,content.json)
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

//parse data from get/post methods
//'then' is callback executed after data has been parsed
function parse_data(req,then){
    if(req.method=="POST"){
        var chunks=""
        req.on("data",(chunk)=>{
            chunks+=chunk
        })
        req.on("end",()=>{
            var params=new url.URLSearchParams(chunks)
            var ret={method:"POST"}
            params.forEach((value,key,searchparams)=>{
                ret[key]=value
            })
            then(ret)
        })
    }else{
        var params=new url.URLSearchParams(req.url)
        var ret={method:"GET"}
        params.forEach((value,key,searchparams)=>{
            ret[key]=value
        })
        then(ret)
    }
}

const server=http.createServer((req,res)=>{
    try{
        /*
        //for explanation on client-server interaction
        if(!send_static_data(req,res)){
            parse_data(req,(parsed)=>{
                console.log(req.url,parsed)
                var file=fs.readFileSync("../html/index.html",encoding.utf8)
                file=file.replace("$$NAME$$",parsed.name)
                res.writeHeader(200,content.html)
                res.write(file)
                res.end()
            })
        }

        return
        */

        //check if url is known to server
        handler=request_handler[req.url]
        if(handler){
            handler(req,res)
            return
        //if url is not a special case
        }else{
            //check if url is a static file, send the file if so
            if(!send_static_data(req,res)){
                //otherwise send 404
                console.log(req.url, " could not be found.")
                res.writeHeader(404,content.html)
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