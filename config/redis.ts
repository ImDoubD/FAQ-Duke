import dotenv from "dotenv";
import {createClient} from 'redis';
import { promisify } from 'util';

dotenv.config();

const client = createClient({
    username: process.env.REDIS_USER,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: 19148
    }
});

client.on('error', err => console.log('Redis Client Error', err));

export const connectRedis = async () =>  {
    client.connect();
    client.set('foo', 'bar');
    const res = await client.get('foo');
    console.log(res);
};

export const redisClient = {
    get: promisify(client.get).bind(client),
    set: promisify(client.set).bind(client),
    quit: promisify(client.quit).bind(client)
};
