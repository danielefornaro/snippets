'use strict';

require('dotenv').load();
const callRPC = require('./callRPC');

const main = async () =>
{
    try
    {
        if(process.env.user == undefined) throw new Error("no user has been given");
        if(process.env.password == undefined) throw new Error("no password has been given");
        if(process.env.socket == undefined) throw new Error("no socket has been given");
        
        const connectionParams =
        {
            user: process.env.user,
            password: process.env.password,
            socket: process.env.socket
        }

        const client = new callRPC(connectionParams);
        const blockHex = await client.fetch('getnewblockhex');
        const blockSigned = await client.fetch('signblock', [blockHex]);
        const blockResult = await client.fetch('combineblocksigs', [blockHex, [blockSigned]] );
        const res = await client.fetch('submitblock', [blockResult.hex] );
        console.log(res);
    }
    catch(err)
    {
        console.log(err);
    }
}

main();