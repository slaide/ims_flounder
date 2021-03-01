const mysql=require("mysql")
const fs=require("fs")
const utility=require("./utility.js")

/** 
 * Create connection to server, for interaction with databases
 * @param {(connection:mysql.Connection,error:Error)=>void} handle function to be called after attempted connection
 */
function connect_server(handle){
    let connection_data={
        host:"localhost",
        user:"root",
        password:"",
        multipleStatements:true
    }

    var connection=mysql.createConnection(connection_data)
    connection.connect((err)=>handle(connection,err))
}
module.exports.connect_server=connect_server


/** 
 * Create global database connection pool
 */
function create_global_connection_pool(){
    let connection_data={
        host:"localhost",
        user:"root",
        password:"",
        database:"lims",
        multipleStatements:true,
        connectionLimit:256
    }

    var connection=mysql.createPool(connection_data)
    return connection
}
module.exports.connection=create_global_connection_pool();

/** 
 * Create connection to database
 * @param {(connection:mysql.Connection,error:Error)=>void} handle function to be called after attempted connection
 */
function connect_database(handle){
    let connection_data={
        host:"localhost",
        user:"root",
        password:"",
        database:"lims",
        multipleStatements:true
    }

    var connection=mysql.createConnection(connection_data)
    connection.connect((err)=>handle(connection,err))
}

/** 
 * End connection to database
 * @param {mysql.Connection} connection Connection to be closed
 * @param {?(error:Error)=>void} end_function Function will be called with error, if any
 */
function disconnect(connection,end_function=(err)=>{
    if(err){
        throw err;
    }
}){
    connection.end(end_function)
}

/** 
 * Connect to database server and (re)create lims database
 * @param {(connection:mysql.Connection)=>void} then Function called after database creation
 * @param {(connection:mysql.Connection,error:Error)=>bool} on_error Function called with error, if any. Return 'true' if function should be aborted after on_error call
 */
function connect_build_database(then,on_error=(conn,err)=>{
    console.log(err)
    if(!err.fatal){
        disconnect(conn)
    }
    return true
}){
    //connect to server (not database!)
    connect_server((conn,err)=>{
        if(err){
            //print custom error message when database is not running
            if(err.code=="ECONNREFUSED"){
                console.log("error: database connection refused. please start the database server.")
                return
            }
            console.log("error on connect for rebuild:")
            if(on_error(conn,err)){
                return
            }
        }
        conn.query("drop database lims",(err,res,fields)=>{
            if(err){
                //ignore the database not existing (e.g. after fresh server install. we delete all of the data here, so the data not existing prior does not matter)
                if(!err.code=="ER_DB_DROP_EXISTS"){
                    console.log("error on drop:")
                    if(on_error(conn,err)){
                        return
                    }
                }
            }
            conn.query("create database lims",(err,res,fields)=>{
                if(err){
                    console.log("error on create:")
                    if(on_error(conn,err)){
                        return
                    }
                }
                disconnect(conn,(err)=>{
                    if(err){
                        cnsole.log("disconnect after database creation failed.")
                        if(on_error(conn,err)){
                            return
                        }
                    }
                    connect_database((conn,err)=>{
                        if(err){
                            console.log("connection to database failed.")
                            if(on_error(conn,err)){
                                return
                            }
                        }

                        //manual file insertion sequence to hopefully never break foreign key references
                        const sql_files=[
                            "../database/user.sql",
                            "../database/room.sql",
                            "../database/instrument.sql",
                            "../database/booking.sql",
                            "../database/ins_locates.sql",
                            "../database/ins_maintenance.sql"
                        ]

                        var long_file="";
                        for(file of sql_files){
                            //remove collate values that npms mysql module just cannot play nice with for some reason
                            const file_content=fs.readFileSync(file,utility.encoding.utf8).replace("COLLATE utf8mb4_0900_ai_ci","").replace("COLLATE=utf8mb4_0900_ai_ci","")
                            long_file+=file_content
                        }

                        conn.query(long_file,(err,res,fields)=>{
                            if(err){
                                console.log("error inserting data into rebuilt database:")
                                throw err
                            }
                            disconnect(conn,(error)=>{
                                if(error) throw error;
                            })

                            then()
                        })
                    })
                })
            })
        })
    })
}
module.exports.connect_build_database=connect_build_database