import { MESSAGES, queryOperators, redisCacheKeys, } from '../constants';

import { buildCacheKey, checkUserProfileVerification, pageParser, searchParser, } from '../Helpers';

import * as bookStateService from '../services/bookStateService';
import { cacheDataWithExpiration, deleteCacheEntry, } from '../services/redisService';

import { updateMessage, } from '../util';


export const getAllBooksByState = async (req, res, next) => {
    const { limit, offset, } = pageParser(req?.query);
    const { searchContent, } = searchParser(req?.query);

    const filterOperator = queryOperators.LIKE;

    const userId = req?.user?._id;
    const state = req.params.state;

    try {
        const result = await bookStateService.getAllDate({
            state, userId, offset, limit, searchContent, filterOperator,
        });

        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
};

export const getBookStateById = async (req, res, next) => {
    try {
        const bookId = parseInt(req.params.id);
        const userId = req?.user?._id;

        const data = await bookStateService.getInfoFromBookState(bookId, userId);

        const key = buildCacheKey(redisCacheKeys.BOOK_STATE_ID, req);
        await cacheDataWithExpiration(key, data);

        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
};

export const createBookState = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const checkAccount = await checkUserProfileVerification(userId);
        if (!checkAccount) {
            res.status(401).json(updateMessage(MESSAGES.ACCOUNT_IS_NOT_VERIFY).user);
        }

        const { bookId, state, } = req.body;

        await bookStateService.addingNewBookState({ userId, bookId, state, });

        const key = buildCacheKey(redisCacheKeys.BOOK_STATE_ID, req);
        await deleteCacheEntry(key);

        res.status(201).json(updateMessage(MESSAGES.SUCCESSFULLY_ADDED_BOOK_IN_COLLECTION).user);
    } catch (err) {
        next(err);
    }
};