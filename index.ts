import 'dotenv/config';
import express from 'express';
import server from 'http';
import { Server as SocketIOServer, } from 'socket.io';

import { checkDatabaseIfItExist, expressConfig, router, } from './config';

import { globalErrorHandling, } from './Helpers';

import db from './Model';
import { socketRoute, } from './routes';

const PORT = process.env.PORT;

start();
const app = express();
const initServer = server.createServer(app);
const io = new SocketIOServer(initServer, { cors: { origin: '*', }, });

async function start() {

    await checkDatabaseIfItExist();

    await db.sequelize.authenticate();

    await db.sequelize.sync({ force: false, });

    expressConfig(app, express, io);

    router(app);

    socketRoute(io);

    app.use(globalErrorHandling());

    initServer.listen(PORT, () => console.log('Application works'));
}
