const fs=require("fs")
const url=require("url")

/**
 * Respond to a request with static data, if the url corresponds to a file in the 'html' folder
 * currently expects client data: none
 * currently responds with: static data, if exists (otherwise return without response)
 * @param {Request} req Request object with client data
 * @param {Response} res Reponse object
 */
function send_static_data(req,res){
    const html_folder=fs.readdirSync("../html");
    if(html_folder.includes(req.url.substr(1))){
        var header=content.from_filename(req.url)

        const e=encoding.from_filename(req.url)
        var data=fs.readFileSync("../html"+req.url,e)

        if(e==encoding.base64){
            data=Buffer.from(data,"base64")
            header["Content-Length"]=data.length
        }

        res.writeHeader(200,header)
        res.end(data)

        log(`${req.url} was sent.`)
        return true
    }

    return false
}
module.exports.send_static_data=send_static_data

const content={
    html:{"Content-Type":"text/html"},
    css:{"Content-Type":"text/css"},
    js:{"Content-Type":"text/javascript"},
    json:{"Content-Type":"application/json"},
    png:{"Content-Type":"image/png"},
    ico:{"Content-Type":"image/vnd.microsoft.icon"},
    jpg:{"Content-Type":"image/jpeg"},
    from_filename:function(n){
        if(n.endsWith(".css")){
            return content.css
        }else if(n.endsWith(".js")){
            return content.js
        }else if(n.endsWith(".html")){
            return content.html
        }else if(n.endsWith(".json")){
            return content.json
        }else if(n.endsWith(".png")){
            return content.png
        }else if(n.endsWith(".ico")){
            return content.ico
        }else if(n.endsWith(".jpg")){
            return content.jpg
        }else if(n.endsWith(".jpeg")){
            return content.jpg
        }
    }
}
module.exports.content=content

const encoding={
    utf8:{encoding:"utf8"},
    base64:{encoding:"base64"},
    from_filename:function(n){
        if(n.endsWith(".css")){
            return encoding.utf8
        }else if(n.endsWith(".js")){
            return encoding.utf8
        }else if(n.endsWith(".html")){
            return encoding.utf8
        }else if(n.endsWith(".json")){
            return encoding.utf8
        }else if(n.endsWith(".png")){
            return encoding.base64
        }else if(n.endsWith(".ico")){
            return encoding.base64
        }else if(n.endsWith(".jpg")){
            return encoding.base64
        }else if(n.endsWith(".jpeg")){
            return encoding.base64
        }
    }
}
module.exports.encoding=encoding

/**
 * parse client data from request
 * currently expects client data: any
 * @param {Request} req Request object with client data
 * @param {(data:Object)=>void} then Function to be called with parsed client request data
 */
function parse_data(req,then){
    if(req.method=="POST"){
        var chunks=""
        req.on("data",(chunk)=>{
            chunks+=chunk
        })
        req.on("end",()=>{
            if(chunks[0]=="{"){
                var ret=JSON.parse(chunks)
                if(!ret.method){
                    ret.method="POST"
                }
                ret=remove_special_chars(ret)
                then(ret)
            }else{
                var params=new url.URLSearchParams(chunks)
                var ret={method:"POST"}
                params.forEach((value,key,searchparams)=>{
                    ret[key]=value
                })
                ret=remove_special_chars(ret)
                then(ret)
            }
        })
    }else{
        var params=new url.parse(req.url)
        params=new url.URLSearchParams(params.query)
        
        var ret={method:"GET"}
        params.forEach((value,key,searchparams)=>{
            ret[key]=value
        })
        ret=remove_special_chars(ret)
        then(ret)
    }
}
module.exports.parse_data=parse_data

/**
 * format time with swedish timezone
 * @param {Date} date - date object to be formatted in compatible format
 */
function format_time(date){
    return new Date(date).toLocaleString("se-SE",{timezone:"Sweden"})
}
module.exports.format_time=format_time

/**
 * remove special characters from keys and values of an object
 * @param {Object} obj - object of which the special characters will be stripped
 */
function remove_special_chars(obj){
    var ret_obj={}
    const special_chars=/[;\"'`&,$#<>?!/~]/gi //allow : and - for time stuff
    for(const key of Object.keys(obj)){
        obj[key]=`${obj[key]}`
        const new_key=key.replace(special_chars,"")
        ret_obj[new_key]=obj[key].replace(special_chars,"")
    }
    return ret_obj
}
module.exports.remove_special_chars=remove_special_chars

const log_levels=["activity","important","error"]
var global_log_level=1;

module.exports.set_global_log_level=function(new_log_level){
    if(new_log_level<0 || new_log_level>log_levels.length){
        throw `new log level must be in range! ${new_log_level}`
    }
    global_log_level=new_log_level
}

var log_messages={};
for(ll of log_levels){
    log_messages[ll]=[];
}

/**
 * remove special characters from keys and values of an object
 * @param {Object} obj - object of which the special characters will be stripped
 */
function log(text,log_level="activity"){
    if(!log_levels.includes(log_level)){
        throw `log_level ${log_level} not found`
    }
    
    const new_log_message={time:format_time(new Date()),message:text}
    log_messages[log_level].push(new_log_message)

    if(global_log_level<=log_levels.indexOf(log_level)){
        console.log(`${new_log_message.time} ${log_level}: ${new_log_message.message}`)
    }
}
module.exports.log=log

module.exports.get_log_for_level=function(get_log_level){
    if(get_log_level<0 || get_log_level>log_levels.length){
        throw `log level must be in range! ${new_log_level}`
    }

    var get_log_level=log_levels[get_log_level]

    for(log of log_messages[get_log_level]){
        console.log(`oldlog: ${log.time} ${get_log_level}: ${log.message}`)
    }
}