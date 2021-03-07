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
    `

    const check_credentials=`
    create procedure check_credentials(email varchar(40), password varchar(126), out MatchesFound int)
    begin
        start transaction;

        select count(*) into MatchesFound
        from user
        where user.Email=email
        and user.Password=password
        and user.Exist=1;

        commit;
    end;
    `

    const generate_token_if_credentials_correct_definition=`
        create procedure generate_token(ssn int, new_time datetime, out Token varchar(126))
        begin
            start transaction;

                update user
                set user.Token=SHA2(concat(user.Password,new_time,SHA(RAND())),512), Last_login=new_time
                where user.SSN=ssn;

                select user.token into Token
                from user
                where user.SSN=ssn;
            commit;
        end;
    `

    const check_token_definition=`
        create procedure check_token(ssn int, token varchar(126), new_time datetime, out TokenValid int)
        begin
            start transaction;

            set @token_valid_time = "00:15:00";

            select count(*) into TokenValid
            from user
            where user.SSN=ssn
            and user.Token=token
            and user.Exist=1
            and timediff(new_time,addtime(user.Last_login,@token_valid_time))<=0;

            commit;
        end;
    `

    var connection=mysql.createPool(connection_data)

    //procedures are stored per database, not connection
    connection.query(check_timeslot_available_definition,(error,results,fields)=>{
        if (error) throw error;
        connection.query(check_credentials,(error,results,fields)=>{
            if (error) throw error;
            connection.query(check_token_definition,(error,results,fields)=>{
                if (error) throw error;
                connection.query(generate_token_if_credentials_correct_definition,(error,results,fields)=>{
                    if (error) throw error;
                    connection.query("set autocommit=1;",(error,results,fields)=>{
                        if (error) throw error;
                    })
                })
            })
        })
    })

    //TODO i know this should be async called within the last query above
    return connection
}
var connection=null
module.exports.connection=connection

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
                            const file_content=fs.readFileSync(file,utility.encoding.utf8).replace(/COLLATE utf8mb4_0900_ai_ci/gi,"").replace(/COLLATE=utf8mb4_0900_ai_ci/gi,"")
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

                            connection=create_global_connection_pool();
                            module.exports.connection=connection;
                            then()
                        })
                    })
                })
            })
        })
    })
}
module.exports.connect_build_database=connect_build_database

function check_attributes(data,attributes_string,error_function,delim=" "){
    var sorted_attributes=[]
    for(attribute of attributes_string.split(delim)){
        if(!data[attribute]){
            const error_message=`request is missing the attribute '${attribute}'`
            error_function({source:"check_attributes",message:error_message,fatal:false})

            return false
        }
        sorted_attributes.push(data[attribute])
    }
    return sorted_attributes
}

const rooms={
    get:function(data,error_function,success_function){
        const sorted_attributes=check_attributes(data,"ssn token",error_function)
        if(sorted_attributes){
            const query=`
                start transaction;
                    call check_token(${data.ssn},'${data.token}','${utility.format_time(new Date())}',@Success);
                    select @Success as Success;

                    if @Success=1 then
                        select *
                        from room
                        where strcmp(Class,(select Special_rights from User where SSN=${data.ssn}))>=0
                        and room.Exist=1;
                    end if;
                commit;
            `

            connection.query(query,(error,results,fields)=>{
                if(error){
                    error_function({source:"rooms.get",message:error.sqlMessage,fatal:true,error:error})
                    return
                }
                if(results[2][0].Success!=1){
                    error_function({source:"rooms.get",message:"token is invalid",fatal:false})
                    return
                }

                success_function(results[3])
            })
        }
    },
    //TODO testing
    add:function(data,error_function,success_function){
        const attributes="ssn token room_id area building_code capacity class"
        const sorted_attributes=check_attributes(data,attributes,error_function)
        if(sorted_attributes){

            const query=`
                start transaction;
                    call check_token(${data.ssn},'${data.token}','${utility.format_time(new Date())}',@Success);
                    select @Success as Success;

                    if @Success=1 then
                        insert into room(${attributes.replace(/\ /gi,",")}, Exist) values (${'?,'.repeat(sorted_attributes.length)}1)
                    end if;
                commit;
            `

            connection.query(query,sorted_attributes,(error,results,fields)=>{
                if(error){
                    error_function({source:"rooms.add",message:error.sqlMessage,fatal:true,error:error})
                    return
                }
                if(results[2][0].Success!=1){
                    error_function({source:"rooms.add",message:"token is invalid",fatal:false})
                    return
                }
                if(results[3].affectedRows!=1){
                    error_function({source:"rooms.add",message:"did not insert",fatal:true})
                    return
                }
                success_function()
            })
        }
    },
    //TODO testing
    remove:function(data,error_function,success_function){
        const attributes="ssn token room_id"
        const sorted_attributes=check_attributes(data,attributes,error_function)
        if(sorted_attributes){
            const query=`
                start transaction;
                    call check_token(${data.ssn},'${data.token}','${utility.format_time(new Date())}',@Success);
                    select @Success as Success;

                    if @Success=1 then
                        select @NumInstrumentsInRoom := count(*)
                        from instrument
                        where instrument.Room_ID = ${data.room_id}
                        and instrument.Exist=1;

                        if @NumInstrumentsInRoom=0 then
                            update room set Exist=0 where Room_ID=${data.room_id};
                        end if;
                    end if;

                commit;
            `

            connection.query(query,sorted_attributes,(error,results,fields)=>{
                if(error){
                    error_function({source:"rooms.remove",message:error.sqlMessage,fatal:true,error:error})
                    return
                }
                if(results[2][0].Success!=1){
                    error_function({source:"rooms.remove",message:"token is invalid",fatal:false})
                    return
                }
                if(results[3][0].NumInstrumentsInRoom!=0){
                    error_function({source:"rooms.remove",message:"room containing instruments cannot be removed",fatal:false})
                    return
                }
                if(results[4].affectedRows!=1){
                    error_function({source:"rooms.remove",message:"did not remove",fatal:true})
                    return
                }
                success_function()
            })
        }
    },
    //TODO check is user is admin, testing, map fields
    get_admin:function(data,error_function,success_function){
        const sorted_attributes=check_attributes(data,"ssn token",error_function)
        if(sorted_attributes){
            const query=`
                start transaction;
                    call check_token(${data.ssn},'${data.token}','${utility.format_time(new Date())}',@Success);
                    select @Success as Success;

                    select @UserIsAdmin := user.Admin as UserIsAdmin
                    from user
                    where user.SSN=${data.ssn};

                    if @Success=1 and @UserIsAdmin then
                        select * from room where Exist=1;
                    end if;
                commit;
            `

            connection.query(query,(error,results,fields)=>{
                if(error){
                    error_function({source:"rooms.get_admin",message:error.sqlMessage,fatal:true,error:error})
                    return
                }
                if(results[2][0].Success!=1){
                    error_function({source:"rooms.get_admin",message:"token is invalid",fatal:false})
                    return
                }
                if(results[3][0].UserIsAdmin!=1){
                    error_function({source:"instruments.remove",message:"user is not an admin",fatal:false,error:results})
                    return
                }

                success_function(results[4])
            })
        }
    },
}
module.exports.rooms=rooms

const instruments={
    get:function(data,error_function,success_function){
        if(check_attributes(data,"room_id ssn token",error_function)){
            const query=`
                start transaction;
                    call check_token(${data.ssn},'${data.token}','${utility.format_time(new Date())}',@Success);
                    select @Success as Success;

                    if @Success=1 then
                        select *
                        from instrument
                        join room on room.Room_ID = instrument.Room_ID
                        where room.Room_ID="${data.room_id}"
                        and instrument.Exist=1
                        and strcmp((select user.Special_rights from user where user.SSN=${data.ssn}),room.Class)<=0;
                    end if;
                commit;
            `

            connection.query(query,(error,results,fields)=>{
                if(error){
                    error_function({source:"instruments.get",message:error.sqlMessage,error:error,fatal:true})
                    return
                }
                if(results[2][0].Success!=1){
                    error_function({source:"instruments.get",message:"token is invalid",fatal:false})
                    return
                }

                success_function(results[3])
            })
        }
    },
    //TODO testing
    add:function(data,error_function,success_function){
        const attributes="ssn token description serial proc_date room_id"
        const sorted_attributes=check_attributes(data,attributes,error_function)
        if(sorted_attributes){
            const query=`
                start transaction;
                    call check_token(${data.ssn},'${data.token}','${utility.format_time(new Date())}',@Success);
                    select @Success as Success;

                    select @UserIsAdmin := user.Admin as UserIsAdmin
                    from user
                    where user.SSN=${data.ssn};

                    if @Success=1 and @UserIsAdmin then
                        select @RoomExists := count(*) as RoomExists
                        from room
                        where room.Room_ID=${data.room_id}
                        and room.Exist=1;

                        if @RoomExists = 1 then
                            insert into instrument(${attributes.replace(/\ /gi,",")},Exist) values (${'?,'.repeat(sorted_attributes.length)}1);
                        end if;
                    end if;
                commit;
            `

            connection.query(query,sorted_attributes,(error,results,fields)=>{
                if(error){
                    error_function({source:"instruments.add",message:error.sqlMessage,fatal:true,error:error})
                    return
                }
                if(results[2][0].Success!=1){
                    error_function({source:"instruments.add",message:"token is invalid",fatal:false,error:results})
                    return
                }
                if(results[3][0].UserIsAdmin!=1){
                    error_function({source:"instruments.add",message:"user is not an admin",fatal:false,error:results})
                    return
                }
                if(results[4][0].RoomExists!=1){
                    error_function({source:"instruments.add",message:"room does not exist",fatal:false,error:results})
                }
                if(results[5].affectedRows!=1){
                    error_function({source:"instruments.add",message:"did not insert",fatal:false,error:results})
                    return
                }
                success_function()
            })
        }
    },
    //TODO testing
    remove:function(data,error_function,success_function){
        const attributes="ssn token ins_id"
        const sorted_attributes=check_attributes(data,attributes,error_function)
        if(sorted_attributes){
            const query=`
                start transaction;
                    call check_token(${data.ssn},'${data.token}','${utility.format_time(new Date())}',@Success);
                    select @Success as Success;

                    select @UserIsAdmin := user.Admin as UserIsAdmin
                    from user
                    where user.SSN=${data.ssn};

                    if @Success=1 and @UserIsAdmin then
                        select @NumFutureBookings := count(*) as NumFutureBookings
                        from booking
                        where timediff(booking.Start_Time,'${new Date().toLocaleString("se-SE",{timezone:"Sweden"})}')>0
                        and booking.Ins_ID = ${data.ins_id};

                        if @NumFutureBookings=0 then
                            update instrument set Exist=0 where Ins_ID=${data.ins_id};
                        end if;
                    end if;
                commit;
            `

            connection.query(query,sorted_attributes,(error,results,fields)=>{
                if(error){
                    error_function({source:"instruments.remove",message:error.sqlMessage,fatal:true,error:error})
                    return
                }
                if(results[2][0].Success!=1){
                    error_function({source:"instruments.remove",message:"token is invalid",fatal:false,error:results})
                    return
                }
                if(results[3][0].UserIsAdmin!=1){
                    error_function({source:"instruments.remove",message:"user is not an admin",fatal:false,error:results})
                    return
                }
                if(results[4][0].NumFutureBookings!=0){
                    error_function({source:"instruments.remove",message:"instrument that is booked in the future cannot be removed",fatal:false})
                    return
                }
                if(results[5].affectedRows!=1){
                    error_function({source:"instruments.remove",message:"did not remove instrument",fatal:false})
                    return
                }
                success_function()
            })
        }
    },
    //TODO testing
    get_admin:function(data,error_function,success_function){
        if(check_attributes(data,"ssn token room_id",error_function)){
            const query=`
                start transaction;
                    call check_token(${data.ssn},'${data.token}','${utility.format_time(new Date())}',@Success);
                    select @Success as Success;

                    select @UserIsAdmin := user.Admin as UserIsAdmin
                    from user
                    where user.SSN=${data.ssn};

                    if @Success=1 and @UserIsAdmin then
                        select *
                        from instrument
                        where Room_ID='${data.room_id}'
                        and Exist=1;
                    end if;
                commit;
            `

            connection.query(query,(error,results,fields)=>{
                if(error){
                    error_function({source:"instruments.get_admin",message:error.sqlMessage,error:error,fatal:true})
                    return
                }
                if(results[2][0].Success!=1){
                    error_function({source:"instruments.get_admin",message:"token is invalid",fatal:false,error:results})
                    return
                }
                if(results[3][0].UserIsAdmin!=1){
                    error_function({source:"instruments.get_admin",message:"user is not an admin",fatal:false,error:results})
                    return
                }

                success_function(results[4])
            })
        }
    },
}
module.exports.instruments=instruments

const bookings={
    //TODO any safety checks on the booking removal, or have blind trust that the booking is removed by the user who made it?, also testing
    remove:function(data,error_function,success_function){
        const attributes="ssn token booking_id"
        const sorted_attributes=check_attributes(data,attributes,error_function)
        if(sorted_attributes){
            const query=`
                start transaction;
                    call check_token(${data.ssn},'${data.token}','${utility.format_time(new Date())}',@Success);
                    select @Success as Success;

                    if @Success=1 then
                        delete
                        from booking
                        where Booking_ID=${data.booking_id}
                        and booking.SSN=${data.ssn};
                    end if;
                commit;
            `

            connection.query(query,sorted_attributes,(error,results,fields)=>{
                if(error){
                    error_function({source:"bookings.remove",message:error.sqlMessage,fatal:true,error:error})
                    return
                }
                if(results[2][0].Success!=1){
                    error_function({source:"bookings.remove",message:"token is invalid",fatal:false,error:results})
                    return
                }
                if(results[3].affectedRows!=1){
                    error_function({source:"bookings.remove",message:"did not remove",fatal:false})
                    return
                }
                success_function()
            })
        }
    },
}
module.exports.bookings=bookings

function timeslot_available(data,error_function,insert_data=false,success_function=null){
    var attributes="ins_id start_time ssn token"
    if(insert_data){
        attributes+=" end_time"
    }
    const sorted_attributes=check_attributes(data,attributes,error_function)
    if(sorted_attributes){
        const query=`
            start transaction;
                call check_token(${data.ssn},'${data.token}','${utility.format_time(new Date())}',@Success);
                select @Success as Success;

                if @Success=1 then
                    call check_timeslot_available(
                        "${data.start_time}",
                        "${data.end_time || "1900-01-01 00:00:00"}",
                        "${data.ssn}",
                        "${data.ins_id}",
                        "${data.notes || ""}",
                        ${insert_data?1:0}
                    );
                end if;
            commit;
        `;

        const handles=[
            //handle 0
            (results)=>{
                //if timeslot is already occupied, timeslot is not available
                if(results[0].InstrumentExists===0){
                    const error_message="instrument does not exist anymore"
                    utility.log(`${error_message}`)

                    error_function({source:"timeslot_available.query0",message:error_message,error:results,fatal:false})

                    return false;
                }
                return true;
            },

            //handle 1
            (results)=>{
                //if timeslot is already occupied, timeslot is not available
                if(results[0].TimeslotAlreadyReserved){
                    const error_message="timeslot is already occupied"
                    utility.log(`${error_message}`)

                    error_function({source:"timeslot_available.query2",message:error_message,error:results,fatal:false})

                    return false;
                }
                return true;
            },

            //handle 2
            (results)=>{
                //check if this number is 0 (allow further checks) or !=0 (disallow) (see description above query)
                if(results[0].NumImmunocompromisedInRoom>0){
                    const error_message="room is already occupied by an immunocompromised person that is not you"
                    utility.log(`${error_message}`)

                    error_function({source:"timeslot_available.query2",message:error_message,error:results,fatal:false})

                    return false;
                }
                return true;
            },

            //handle 3
            (results)=>{
                //if room is full, timeslot is not available
                if(results[0].NumberPeopleInRoom==results[0].RoomCapacity){
                    const error_message="room is already at max capacity at that time"
                    utility.log(`${error_message}`)

                    error_function({source:"timeslot_available.query3",message:error_message,error:results,fatal:false})

                    return false;
                }
                //if you are immunocompromised and the room is partially occupied by someone else, timeslot is not available
                if(results[0].YouAreImmunoCompromised && results[0].NumberPeopleInRoom>0){
                    const error_message="room is already at occupied at that time"
                    utility.log(`${error_message}`)

                    error_function({source:"timeslot_available.query3",message:error_message,error:results,fatal:false})

                    return false;
                }
                return true;
            }
        ]

        connection.query(query,(error,results,fields)=>{
            if(error){
                const error_message="timeslot availability check query failed";
                utility.log(`${error_message} ${error}`,"error")

                error_function({source:"timeslot_available.database_query",message:error_message,error:error,fatal:true})
            }
            if(results[2][0].Success!=1){
                error_function({source:"timeslot_available.database_query",message:"token is invalid",fatal:false,error:results})
                return
            }

            if(
                handles[0](results[3])
                && handles[1](results[4])
                && handles[2](results[5])
                && handles[3](results[6])
            ){
                if(insert_data && results[8].affectedRows!=1){
                    const error_message="inserting new booking failed";
                    utility.log(`${error_message} ${results[results.length-1]}`,"error")

                    error_function({source:"timeslot_available.database_query_check",message:error_message,error:results,fatal:false})
                }else{
                    success_function();
                }
            }
        })
    }
}

const timeslot={
    check_available:function(data,error_function,success_function){
        timeslot_available(data,error_function,insert_data=false,success_function=success_function)
    },
    book:function(data,error_function,success_function){
        timeslot_available(data,error_function,insert_data=true,success_function=success_function)
    },
}
module.exports.timeslot=timeslot

const personal_schedule={
    //TODO testing
    get:function(data,error_function,success_function){
        if(check_attributes(data,"ssn token",error_function)){
            const query=`
                start transaction;
                    call check_token(${data.ssn},'${data.token}','${utility.format_time(new Date())}',@Success);
                    select @Success as Success;

                    if @Success=1 then
                        SELECT booking.Booking_ID, booking.Start_Time, booking.End_Time, instrument.Description
                        FROM booking
                        JOIN instrument
                        ON booking.Ins_ID=instrument.Ins_ID
                        join user
                        on user.SSN=booking.SSN
                        WHERE booking.SSN = ${data.ssn}
                        and instrument.Exist=1
                        and user.Exist=1;
                    end if;
                commit;
            `

            connection.query(query,(error,results,fields)=>{
                if(error){
                    error_function({source:"personal_schedule.get",message:error.sqlMessage,error:error,fatal:true})
                    return
                }
                if(results[2][0].Success!=1){
                    error_function({source:"personal_schedule.get",message:"token is invalid",fatal:false,error:results})
                    return
                }

                success_function(results[3])
            })
        }
    },
}
module.exports.personal_schedule=personal_schedule

const maintenance={
    //TODO make sure instrument exists? also testing
    get:function(data,error_function,success_function){
        if(check_attributes(data,"ssn token ins_id",error_function)){
            const query=`
                start transaction;
                    call check_token(${data.ssn},'${data.token}','${utility.format_time(new Date())}',@Success);
                    select @Success as Success;

                    select @UserIsMaintenance := user.Maintenance as UserIsMaintenance
                    from user
                    where user.SSN=${data.ssn};

                    if @Success=1 and @UserIsMaintenance then
                        SELECT ins_maintenance.Date_Time, ins_maintenance.Status, ins_maintenance.Notes
                        FROM ins_maintenance
                        join instrument on ins_maintenance.Ins_ID=instrument.Ins_ID
                        WHERE ins_maintenance.Ins_ID = ${data.ins_id} and instrument.Exist =1;
                    end if;
                commit;
            `

            connection.query(query,(error,results,fields)=>{
                if(error){
                    error_function({source:"maintenance.get",message:error.sqlMessage,error:error,fatal:true})
                    return
                }
                if(results[2][0].Success!=1){
                    error_function({source:"maintenance.get",message:"token is invalid",fatal:false,error:results})
                    return
                }
                if(results[3][0].UserIsMaintenance!=1){
                    error_function({source:"maintenance.get",message:"user is not maintenance personnel",fatal:false,error:results})
                    return
                }

                success_function(results[4])
            })
        }
    },
    //TODO testing
    add:function(data,error_function,success_function){
        const attributes="token ssn date_time status notes ins_id"
        const sorted_attributes=check_attributes(data,attributes,error_function)
        if(sorted_attributes){
            const query=`
                start transaction;
                    call check_token(${data.ssn},'${data.token}','${utility.format_time(new Date())}',@Success);
                    select @Success as Success;

                    select @UserIsMaintenance := user.Maintenance as UserIsMaintenance
                    from user
                    where user.SSN=${data.ssn};

                    if @Success=1 and @UserIsMaintenance then
                        insert into ins_maintenance(ssn,date_time,status,notes,ins_id)
                        values (?,?,?,?,?);
                    end if;
                commit;
            `

            connection.query(query,sorted_attributes.slice(1),(error,results,fields)=>{
                if(error){
                    error_function({source:"maintenance.add",message:error.sqlMessage,fatal:true,error:error})
                    return
                }
                if(results[2][0].Success!=1){
                    error_function({source:"maintenance.add",message:"token is invalid",fatal:false,error:results})
                    return
                }
                if(results[3].UserIsMaintenance!=1){
                    error_function({source:"maintenance.add",message:"user is not maintenance personnel",fatal:false,error:results})
                    return
                }
                if(results[4].affectedRows!=1){
                    error_function({source:"maintenance.add",message:"did not insert",fatal:true})
                    return
                }
                success_function()
            })
        }
    },
}
module.exports.maintenance=maintenance

const accounts={
    //TODO testing
    get:function(data,error_function,success_function){
        if(check_attributes(data,"ssn token",error_function)){
            const query=`
                start transaction;
                    call check_token(${data.ssn},'${data.token}','${utility.format_time(new Date())}',@Success);
                    select @Success as Success;

                    select @UserIsAdmin := user.Admin as UserIsAdmin
                    from user
                    where user.SSN=${data.ssn};

                    if @Success=1 and @UserIsAdmin then
                        select Email,SSN,First_name,Last_name,Admin,Maintenance,Immunocompromised,Phone_number,Special_rights
                        from user
                        where Exist=1;
                    end if;
                commit;
            `

            connection.query(query,(error,results,fields)=>{
                if(error){
                    error_function({source:"accounts.get",message:error.sqlMessage,error:error,fatal:true})
                    return
                }
                if(results[2][0].Success!=1){
                    error_function({source:"accounts.get",message:"token is invalid",fatal:false,error:results})
                    return
                }
                if(results[3][0].UserIsAdmin!=1){
                    error_function({source:"accounts.get",message:"user is not an admin",fatal:false,error:results})
                    return
                }

                success_function(results[4])
            })
        }
    },
    //TODO testing
    add:function(data,error_function,success_function){
        const attributes="password,ssn,first_name,last_name,admin,phone_number,email,special_rights,immunocompromised,maintenance"
        const sorted_attributes=check_attributes(data,attributes,error_function,delim=",")
        if(sorted_attributes){
            if(!"ABC".split("").includes(data.special_rights)){
                error_function({source:"accounts.add",message:"special rights must be A/B/C",fatal:false})
                return
            }

            const query=`
                start transaction;
                    call check_token(${data.ssn},'${data.token}','${utility.format_time(new Date())}',@Success);
                    select @Success as Success;

                    select @UserIsAdmin := user.Admin as UserIsAdmin
                    from user
                    where user.SSN=${data.ssn};

                    if @Success=1 and @UserIsAdmin then
                        insert into user(${attributes},Exist)
                        values (SHA2(?,512), ${'?,'.repeat(sorted_attributes.length-1)}1);
                    end if;
                commit;
            `

            connection.query(query,sorted_attributes,(error,results,fields)=>{
                if(error){
                    error_function({source:"accounts.add",message:error.sqlMessage,fatal:true,error:error})
                    return
                }
                if(results[2][0].Success!=1){
                    error_function({source:"accounts.add",message:"token is invalid",fatal:false,error:results})
                    return
                }
                if(results[3][0].UserIsAdmin!=1){
                    error_function({source:"accounts.add",message:"user is not an admin",fatal:false,error:results})
                    return
                }
                if(results[4].affectedRows!=1){
                    error_function({source:"accounts.add",message:"did not insert",fatal:true})
                    return
                }
                success_function()
            })
        }
    },
    //TODO remove future booking of that user
    remove:function(data,error_function,success_function){
        const attributes="ssn ssn_user token"
        const sorted_attributes=check_attributes(data,attributes,error_function)
        if(sorted_attributes){
            const query=`
                start transaction;
                    call check_token(${data.ssn},'${data.token}','${utility.format_time(new Date())}',@Success);
                    select @Success as Success;

                    select @UserIsAdmin := user.Admin as UserIsAdmin
                    from user
                    where user.SSN=${data.ssn};

                    select @DeleteAccountIsSelf := ${data.ssn}=${data.ssn_user} as DeleteAccountIsSelf;

                    if @Success=1 and @UserIsAdmin and @DeleteAccountIsSelf=0 then
                        update user
                        set Exist=0
                        where SSN=${data.ssn_user};
                    end if;
                commit;
            `

            connection.query(query,sorted_attributes,(error,results,fields)=>{
                if(error){
                    error_function({source:"accounts.remove",message:error.sqlMessage,fatal:true,error:error})
                    return
                }
                if(results[2][0].Success!=1){
                    error_function({source:"accounts.remove",message:"token is invalid",fatal:false,error:results})
                    return
                }
                if(results[3][0].UserIsAdmin!=1){
                    error_function({source:"accounts.remove",message:"user is not an admin",fatal:false,error:results})
                    return
                }
                if(results[4][0].DeleteAccountIsSelf!=0){
                    error_function({source:"accounts.remove",message:"admins cannot delete their own account",fatal:false,error:results})
                    return
                }
                if(results[5].affectedRows!=1){
                    error_function({source:"accounts.remove",message:"did not remove",fatal:true})
                    return
                }
                success_function()
            })
        }
    },
    set_special_rights(data,error_function,success_function){
        if(check_attributes(data,"ssn ssn_user token special_rights",error_function)){
            if(!"ABC".split("").includes(data.special_rights)){
                error_function({source:"account.set_special_rights",message:"special rights must be A/B/C",fatal:false})
                return
            }

            const query=`
                start transaction;
                    call check_token(${data.ssn},'${data.token}','${utility.format_time(new Date())}',@Success);
                    select @Success as Success;

                    select @UserIsAdmin := user.Admin as UserIsAdmin
                    from user
                    where user.SSN=${data.ssn};

                    if @Success=1 and @UserIsAdmin then
                        update user
                        set user.Special_rights='${data.special_rights}'
                        where user.SSN='${data.ssn_user}'
                        and user.Exist=1;
                    end if;
                commit;
            `

            connection.query(query,(error,results,fields)=>{
                if(error){
                    error_function({source:"accounts.set_special_rights",message:error.sqlMessage,error:error,fatal:true})
                    return
                }
                if(results[2][0].Success!=1){
                    error_function({source:"accounts.set_special_rights",message:"token is invalid",fatal:false,error:results})
                    return
                }
                if(results[3][0].UserIsAdmin!=1){
                    error_function({source:"accounts.set_special_rights",message:"user is not an admin",fatal:false,error:results})
                    return
                }
                if(results[4].affectedRows!=1){
                    error_function({source:"accounts.set_special_rights",message:"did not change special rights, likely because user does not exist. reload your webpage.",error:results,fatal:false})
                    return
                }
                success_function()
            })
        }
    },
    login:function(data,error_function,success_function){
        if(check_attributes(data,"email password",error_function)){
            const query=`
                start transaction;
                    call check_credentials('${data.email}','${data.password}',@MatchFound);
                    select @MatchFound as MatchFound;

                    if @MatchFound = 1 then
                        select @SSN := user.SSN as SSN, user.Admin as Admin, user.Email as Email, user.Maintenance as Maintenance
                        from user
                        where user.email='${data.email}';

                        call generate_token(@SSN,'${utility.format_time(new Date())}',@Token);

                        select @Token as NewToken;
                    end if;
                commit;
            `

            connection.query(query,(error,results,fields)=>{
                if(error){
                    error_function({source:"accounts.login",message:error.sqlMessage,error:error,fatal:true})
                    return
                }
                if(results[2][0].MatchFound!=1){
                    //user may not exist, which means ssn is "wrong"
                    error_function({source:"accounts.login",message:"email or password is wrong.",error:results,fatal:false})
                    return
                }

                success_function([results[3][0],results[4][0]])
            })
        }
    },
}
module.exports.accounts=accounts
