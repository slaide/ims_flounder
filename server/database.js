const mysql=require("mysql")
const fs=require("fs")
const utility=require("./utility.js")

//connects to the database server
function connect_server(handle){
    let connection_data={
        host:"localhost",
        user:"root",
        password:""
    }

    var connection=mysql.createConnection(connection_data)
    connection.connect((err)=>handle(connection,err))
}
module.exports.connect_server=connect_server

//connects to the database
function connect_database(handle){
    let connection_data={
        host:"localhost",
        user:"root",
        password:"",
        database:"lims"
    }

    var connection=mysql.createConnection(connection_data)
    connection.connect((err)=>handle(connection,err))
}
module.exports.connect_database=connect_database

//disconnect from the database
function disconnect(connection,end_function=(err)=>{
    if(err){
        throw err;
    }
}){
    connection.end(end_function)
}
module.exports.disconnect=disconnect

//try to connect to server, create database if it does not exist
//'then' is a function that takes (connection,error) as parameters
function connect_build_database(then){
    //connect to server (not database!)
    connect_server((conn,err)=>{
        if(err){
            //print custom error message when database is not running
            if(err.code=="ECONNREFUSED"){
                console.log("error: database connection refused. please start the database server.")
                return
            }
            console.log("error on connect for rebuild:",err)
            //generally, only quit on fatal errors
            if(err.fatal){
                return
            }
        }
        conn.query("drop database lims",(err,res,fields)=>{
            if(err){
                //ignore the database not existing (e.g. after fresh server install. we delete all of the data here, so the data not existing prior doesnt matter)
                if(!err.code=="ER_DB_DROP_EXISTS"){
                    console.log("error on drop:",err)
                    if(err.fatal){
                        return
                    }
                }
            }
            conn.query("create database lims",(err,res,fields)=>{
                if(err){
                    console.log("error on create:",err)
                    if(err.fatal){
                        return
                    }
                }
                disconnect(conn,(err)=>{
                    if(err){
                        console.log("disconnect after database creation failed.",err)
                        if(err.fatal){
                            return
                        }
                    }
                    connect_database((conn,err)=>{
                        if(err){
                            console.log("connection to database failed.",err)
                            if(!err.fatal){
                                disconnect(conn)
                            }
                            return
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

                        for(file of sql_files){
                            const single_queries=fs.readFileSync(file,utility.encoding.utf8).split(";")

                            var done=false;
                            for(i in single_queries){
                                conn.query(single_queries[i],(err,res,fields)=>{
                                    if(err){
                                        //ignore empty queries from weird split behaviour
                                        if(!err.code=="ER_EMPTY_QUERY"){
                                            console.log("error inserting data into rebuilt database:",err)
                                            return
                                        }
                                    }
                                    if(!done){
                                        done=true;
                                        then(conn)
                                        return
                                    }
                                })
                            }
                        }
                    })
                })
            })
        })
    })
}
module.exports.connect_build_database=connect_build_database