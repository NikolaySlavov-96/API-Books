import 'dotenv/config';

const { HEADER_AUTHORIZATION_NAME, } = process.env;

export default (whitelist) => (req, res, next) => {
    // res.setHeader('Access-Control-Allow-Origin', `${whitelist.join()}`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'HEAD, OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', `Content-Type, ${HEADER_AUTHORIZATION_NAME}`);

    next();
};