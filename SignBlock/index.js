'use strict';

require('dotenv').load();
const { promisify } = require('util');
const callRPC = require('./callRPC');

const connectionParams =
{
    user: process.env.user,
    password: process.env.password,
    socket: process.env.socket
}

const client = new callRPC(connectionParams);

const main = async () =>
{
    try
    {
        if(process.env.user == undefined) throw new Error("no user has been given");
        if(process.env.password == undefined) throw new Error("no password has been given");
        if(process.env.socket == undefined) throw new Error("no socket has been given");
        if(process.env.infinity != undefined && process.env.wait == undefined) throw new Error("no param wait has been given");
        
        while(process.env.infinity)
        {
            const list1 = await getListMemPool();
            if(list1.length > 0)
            {
                await sleep(process.env.wait);
                const list2 = await getListMemPool();
                if(list1.some(r => list2.includes(r)))
                {
                    const res = await signBlock();
                    console.log(res);
                }
            }
            await sleep(process.env.wait);          
        }

        const res = await signBlock();
        console.log(res);
    }
    catch(err)
    {
        console.log(err);
    }
}

const signBlock = async () =>
{
    try
    {
        const blockHex = await client.fetch('getnewblockhex');
        const blockSigned = await client.fetch('signblock', [blockHex]);
        const blockResult = await client.fetch('combineblocksigs', [blockHex, [blockSigned]] );
        const res = await client.fetch('submitblock', [blockResult.hex] );
        return res;
    }
    catch(err)
    {
        console.log(err);
    }
}

const sleep = (ms) => 
{
    const setTimeouty = promisify(setTimeout);
    return setTimeouty(ms);
}

const getMemPoolSize = async () =>
{
    const memPool = await client.fetch('getmempoolinfo');
    return memPool.size;
}

const getListMemPool = async () =>
{
    const memPool = await client.fetch('Signblock', [false]);
    return memPool;
}

main();