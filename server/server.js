const http=require("http")
const fs=require("fs")
const url=require("url")
const utility=require("./utility.js")
const database=require("./database.js")
const login=require("./login.js")
const rooms=require("./rooms.js")
const get_personal_schedule=require("./get_personal_schedule")
const reserve_instrument=require("./reserve_instrument")
const revoke_reservation=require("./revoke_reservation")
const add_user=require("./add_user")
const add_room=require("./add_room")
const add_instrument=require("./add_instrument")
const get_maintenance=require("./get_maintenance")
const check_timeslot_available=require("./check_timeslot_available")
const add_maintenance=require("./add_maintenance")

/**
 * central object that routes client requests
 */
const request_handler={
    "/":function(req,res){
        req.url="/index.html"
        if(!utility.send_static_data(req,res)){
            throw("could not find homepage file? aborting.")
        }
    },
    "/login":login.check_login_data,

    "/get_rooms":rooms.get_rooms,
    "/get_instruments_in_room":rooms.get_instruments_in_room,
    "/get_personal_schedule":get_personal_schedule.get_personal_schedule, //solve SSN problem with logout functionality 
    "/reserve_instrument":reserve_instrument.reserve_instrument,
    "/revoke_reservation":revoke_reservation.revoke_reservation, //TODO testing
    "/add_user":add_user.add_user, //TODO testing
    "/add_room":add_room.add_room, //TODO testing
    "/add_instrument":add_instrument.add_instrument, //TODO testing
    "/get_maintenance":get_maintenance.get_maintenance, //TODO testing
    "/check_timeslot_available":check_timeslot_available.check_timeslot_available,
    "/add_maintenance":add_maintenance.add_maintenance, //TODO testing

    "/shutdown":function(req,res){
        res.end()
        database.connection.end((error)=>{
            if(error) throw error;
        })
        throw({force_shutdown:true})
    },
    "/get_log":function(req,res){
        utility.parse_data(req,data=>{
            utility.log("start log output","important")
            utility.get_log_for_level(data.level)
            utility.log("end log output","important")

            res.writeHeader(200,utility.content.json)
            res.end("{}")
        })
    }
}

const server=http.createServer((req,res)=>{
    try{
        //check if url is known to server
        const path=new url.parse(req.url)

        const handler=request_handler[path.pathname]
        if(handler){
            handler(req,res)
            return
        //if url is not a special case
        }else{
            //check if url is a static file, send the file if so
            if(!utility.send_static_data(req,res)){
                //otherwise send 404
                utility.log(`${req.path} could not be found.`)
                res.writeHeader(404,utility.content.html)
                res.end(fs.readFileSync("../html/404.html",utility.encoding.utf8))
            }
            return
        }
    }catch(e){
        //force_shutdown is set on graceful shutdown request
        if(!e.force_shutdown){
            utility.log(e,"error")
        //every other throw is fatal
        }else{
            utility.log("closing web server.","important")
            server.close(()=>{
                utility.log("server closed.","important")
            })
            return
        }
    }
})

function start_server(){
    server.listen(8080,"127.0.0.1",()=>{
        utility.log("server started at '127.0.0.1:8080'","important")
    })
}

database.connect_build_database(()=>{
    start_server()
    return
})