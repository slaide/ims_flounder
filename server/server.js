const http=require("http")
const fs=require("fs")
const mysql=require("mysql")

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
        res.write(fs.readFileSync("../html"+req.url))
        res.end()
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
        res.writeHeader(200,content.html)
        const file=read_homepage()
        res.write(file)
        res.end()
    },
    "/login":function(req,res){
        let connection_data={
            host:"localhost",
            user:"root",
            password:"",
            database:"doesnotexist"
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
            function(e){
                if(e){
                    if(e.code=="ECONNREFUSED"){
                        console.log("database is not running")
                    }else if(e.sqlMessage){
                        console.log("database error: ",e.sqlMessage)
                    }else{
                        console.log(e)
                    }

                    if(!e.fatal){
                        end_connection(connection)
                    }
                    abort_login()
                    return
                }

                console.log("connected successfully")
                
                connection.query("select * from users where username=? and password=?;",[login_data.username,login_data.password],function(err,results,fields){
                    if(err){
                        console.log(e)

                        if(!e.fatal){
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
        //console.log(req.url,req.method)
        handler=request_handler[req.url]
        if(handler){
            handler(req,res)
            return
        }else{
            if(!send_static_data(req,res)){
                res.writeHeader(404,content.html)
                res.end(read_404_page())
            }
            return
        }
    }catch(e){
        if(!e.force_shutdown){
            console.log(e)
        }else{
            console.log("closing web server.")
            server.close()
        }
    }
})
server.listen(8080,"127.0.0.1",()=>{
    console.log("server started at '127.0.0.1:8080'")
})