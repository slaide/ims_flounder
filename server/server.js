const http=require("http")
const fs=require("fs")
const utility=require("./utility.js")
const database=require("./database.js")
const login=require("./login.js")
const rooms=require("./rooms.js")
const machines=require("./machines.js")

const request_handler={
    "/":function(req,res){
        req.url="/index.html"
        if(!utility.send_static_data(req,res)){
            throw("could not find homepage file? aborting.")
        }
    },
    "/login":login.check_login_data,

    "/get_room_list":rooms.get_list,
    "/get_machines_in_room":rooms.get_machines,
    "/get_machine_schedule":machines.get_schedule,
    "/set_machine_schedule_slot":machines.set_schedule_slot,

    "/shutdown":function(req,res){
        res.end()
        throw({force_shutdown:true})
    }
}

const server=http.createServer((req,res)=>{
    try{
        //check if url is known to server
        const handler=request_handler[req.url]
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