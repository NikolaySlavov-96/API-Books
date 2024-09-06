import { cors, session, trimBody, } from '../middleware';

const whitelist = ['http://localhost:8080'];

export default (app, express) => {
    app.use(express.static('public'));
    app.use(cors(whitelist));
    app.use(express.json());

    app.use(trimBody());
    app.use(session());
};