to be able to run this whole software you need:
- node.js installed ( https://nodejs.org/en/ . any version is fine)
- any mysql server installed (e.g. mysql server or xampp , either work)
- git installed ( https://git-scm.com/downloads )
- the following node.js packages installed: (run "npm install packagename" in the shell when inside the ims_flounder/server folder, not in ims_flounder or ims_flounder/html etc. , with packagename replaced by the name of the actual packages)
    - mysql (e.g. "npm install mysql")
- then: start the server ( run "npm start" inside the "ims_flounder\server" folder )
    - below this command you will see messages from the server, which are about the status of the server, e.g. "server started at '127.0.0.1:8080'"
    - error messages will also show up here. if you do something on the website, and something that you did not expect to happen happens (like nothing at all, or the browser says the site cannot be reached), look here.
        - some errors that can occur:
            - database is not running - pretty self explanatory: the mysql server is not running (cannot be started by node.js, you need to start it yourself and then just keep it open while working on the whole system)
- go to "127.0.0.1:8080" in your browser to open the website
    - "127.0.0.1:8080/shutdown" - if you visit this link, the server will shutdown (this is the currently official way to just close the server when you are done. it takes some seconds and will print a message once the server actually shuts down)
    - 127.0.0.1:8080/login - this should currently show an error with "doesnotexist" as unknown database, which is expected, but shows that the node.js server is working with mysql, and a msql server is running as well. contact patrick and/or make sure mysql is running otherwise)
