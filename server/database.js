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
            console.log("error on connect for rebuild:",err)
            return
        }
        conn.query("drop database lims",(err,res,fields)=>{
            //ignore any errors, assume they are related to the fact that the database did not exist
            if(err){
                if(!err.code=="ER_DB_DROP_EXISTS"){
                    console.log("error on drop:",err)
                }
                return
            }
            conn.query("create database lims",(err,res,fields)=>{
                //ignore any errors again
                if(err){
                    console.log("error on create:",err)
                    return
                }
                disconnect(conn,(err)=>{
                    if(err){
                        console.log("disconnect after database creation failed.",err)
                        return
                    }
                    connect_database((conn,err)=>{
                        if(err){
                            console.log("connection to database failed.",err)
                            if(!err.fatal){
                                disconnect(conn)
                            }
                            return
                        }
                        const single_queries=fs.readFileSync("../database/user.sql",utility.encoding.utf8).split(";")

                        var done=false;
                        for(i in single_queries){
                            conn.query(single_queries[i],(err,res,fields)=>{
                                if(err){
                                    if(!err.code=="ER_EMPTY_QUERY"){
                                        console.log("failed database filling query.",err)
                                    }
                                    return
                                }
                                if(!done){
                                    done=true;
                                    then(conn)
                                    return
                                }
                            })
                        }
                    })
                })
            })
        })
    })
    //drop database (dont care if it does not exist actually)
    //create database
    //fill database with data from sql file
    //create and return connection to database
}
module.exports.connect_build_database=connect_build_database