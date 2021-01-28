const http=require("http")
const fs=require("fs")

const server=http.createServer((req,res)=>{
    res.writeHeader(200,{"Content-Type":"text/html"})
    const file=fs.readFileSync("./html/index.html",{encoding:"utf8",flag:"r"})
    res.write(file)
    res.end()
})
server.listen(8080,"127.0.0.1")