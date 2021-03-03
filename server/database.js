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

    const check_timeslot_available_definition=`
        create procedure check_timeslot_available(start_time datetime,end_time datetime,ssn int,ins_id int,notes varchar(40), insert_data boolean)
        begin
            start transaction;

            select @InstrumentExists := count(*) as InstrumentExists
            from instrument
            where instrument.Ins_ID=ins_id;

            #query 1
            select @TimeslotAlreadyReserved := count(*) as TimeslotAlreadyReserved
            from booking 
            where booking.Ins_ID = ins_id
            and timediff(booking.Start_Time,start_time) = 0;

            #query 2
            select @NumImmunocompromisedInRoom := count(*) as NumImmunocompromisedInRoom
            from booking
            join user on user.SSN=booking.SSN
            join instrument on instrument.Ins_ID=booking.Ins_ID
            join room on room.Room_ID=instrument.Room_ID
            where timediff(booking.Start_Time,start_time)=0
            and user.Immunocompromised=1
            and not user.SSN=ssn #not be self
            and room.Room_ID in (select instrument.Room_ID from instrument where instrument.Ins_ID=ins_id);

            #query 3
            select @RoomCapacity := room.Capacity as RoomCapacity,
                @NumberPeopleInRoom := count(distinct user.SSN) as NumberPeopleInRoom,
                @YouAreImmunoCompromised := (select user.Immunocompromised from user where user.SSN=ssn) as YouAreImmunoCompromised
            from booking join user on booking.SSN=user.SSN
            join instrument on booking.Ins_ID=instrument.Ins_ID
            join room on instrument.Room_ID=room.Room_ID
            where instrument.Room_ID in (
                select instrument.Room_ID from instrument where instrument.Ins_ID=ins_id
            )
            and timediff(booking.Start_Time,start_time)=0
            and not user.SSN=ssn;

            if insert_data then
            
                if (@InstrumentExists = 1)
                and (@TimeslotAlreadyReserved = 0)
                and (@NumImmunocompromisedInRoom = 0)
                and 
                (
                    (
                        (@YouAreImmunoCompromised = 0) #if you are not immunocompromised, there needs to be enough space for you in the room
                        and (@RoomCapacity > @NumberPeopleInRoom)
                    )
                    or 
                    ( #if you are immunocompromised, you need to be the only the one in the room
                        (@YouAreImmunoCompromised = 1)
                        and (@NumberPeopleInRoom = 0)
                    )
                    or 
                    (
                        @NumberPeopleInRoom = 0 #capacity is null because noone has anything to do with this room at the time
                    )
                )
                then

                    select @TimeslotAlreadyReserved as TimeslotAlreadyReserved, @NumImmunocompromisedInRoom as NumImmunocompromisedInRoom, @RoomCapacity as RoomCapacity, @NumberPeopleInRoom as NumberPeopleInRoom, @YouAreImmunoCompromised as YouAreImmunoCompromised, @YouAreImmunoCompromised as YouAreImmunoCompromised;
                
                    insert into booking(Start_Time, End_Time, Status, SSN, Ins_ID, Note) 
                    values(start_time,end_time,'booked',ssn,ins_id,notes);
                else
                    rollback;
                    select "something fucked up" as Message;
                end if;
            end if;
            commit;
        end;
    `;

    var connection=mysql.createPool(connection_data)

    //procedures are stored per database, not connection
    connection.query(check_timeslot_available_definition,(error)=>{
        if (error) throw error;
    })
    connection.query("set autocommit=0;",(error)=>{
        if (error) throw error;
    })

    return connection
}

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
    utility.log(err,"error")
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
                utility.log("database connection refused. please start the database server.","error")
                return
            }
            utility.log("error on connect for rebuild:","error")
            if(on_error(conn,err)){
                return
            }
        }
        conn.query("drop database lims",(err,res,fields)=>{
            if(err){
                //ignore the database not existing (e.g. after fresh server install. we delete all of the data here, so the data not existing prior does not matter)
                if(!err.code=="ER_DB_DROP_EXISTS"){
                    utility.log("error on drop:","error")
                    if(on_error(conn,err)){
                        return
                    }
                }
            }
            conn.query("create database lims",(err,res,fields)=>{
                if(err){
                    utility.log("error on create:","error")
                    if(on_error(conn,err)){
                        return
                    }
                }
                disconnect(conn,(err)=>{
                    if(err){
                        utility.log("disconnect after database creation failed.","error")
                        if(on_error(conn,err)){
                            return
                        }
                    }
                    connect_database((conn,err)=>{
                        if(err){
                            utility.log("connection to database failed.","error")
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
                                utility.log("error inserting data into rebuilt database:","error")
                                throw err
                            }
                            disconnect(conn,(error)=>{
                                if(error) throw error;
                            })

                            module.exports.connection=create_global_connection_pool();
                            then()
                        })
                    })
                })
            })
        })
    })
}
module.exports.connect_build_database=connect_build_database