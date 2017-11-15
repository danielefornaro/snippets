'use strict';

const fetchPromise = require('node-fetch');

class callRPC
{
    constructor(connectionParams) 
    {
        this.user = connectionParams.user;
        this.password = connectionParams.password;
        this.header = { 'Authorization': this.getBasicAuth(this.user, this.password) };
        this.socket = connectionParams.socket;
        this.counter = 0;
        console.log("user: " + this.user);
        console.log("password: " + this.password);
        console.log("socket: " + this.socket);
    }

    async fetch(method = '', param = [])
    {
        try
        {
            const bodyJSON =
            {
                method: method,
                params: param,
                id: this.counter++
            }
            const body = JSON.stringify(bodyJSON);
            const res = await fetchPromise(this.socket, { method: 'POST',  headers: this.header, body: body})
            //console.log("counter: " + this.counter);
            const json = await res.json();
            if(json.error) throw new Error(json.error.message);
            return json.result;
        }
        catch(err)
        {
            console.error("fetch-" + method + ": " + err);
        }
    }

    getBasicAuth(user, password)
    {
        try
        {
            if(user == undefined) throw new Error("no user has been given");
            if(password == undefined) throw new Error("no password has been given");
            const strAuth = 'Basic ' + new Buffer(user + ':' + password).toString('base64'); 
            return strAuth;
        }
        catch(err)
        {
            console.error("getBasicAuth: " + err);
        }
    }
}

module.exports = callRPC;