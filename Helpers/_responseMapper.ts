export enum _EMappedType {
    BOOK = 0,
    BOOK_STATE,
    BOOK_SEARCH,
}

const userModel = (data) => {
    return {
        email: data.email,
        userId: data.id,
        userYear: data?.year,
        userIdVerify: data.isVerify,
    };
};

const fileModel = (data) => {
    return {
        imageUrl: data.uniqueName || data.image,
        bookSrc: data?.src,
        imageId: data?.id,
    };
};

const bookModel = (data) => {
    const author = data.Author;
    const updatedFile = fileModel(data?.File || data);

    return {
        bookId: data.id,
        bookGenre: data.genre,
        bookIsVerify: data.isVerify,
        bookTitle: data.bookTitle,
        authorName: author.name,
        authorImage: author.image,
        authorGenre: author.genre,
        authorIsVerify: author.isVerify,
        ...updatedFile,
    };
};

const bookStateModel = (data) => {
    const updatedBook = bookModel(data.Book);
    const updateUser = userModel(data.User);

    return {
        bookStateId: data.stateId,
        // bookStateName: data.State.stateName,
        bookStateIsDelete: data.isDelete,
        ...updatedBook,
        ...updateUser,
    };
};

const bookSearchModel = (data) => {
    const updateUser = userModel(data);
    const updateBook = bookModel(data.BookStates.Book);

    return {
        ...updateUser,
        ...updateBook,
        stateId: data.id, // TODO
    };
};

const _responseMapper = (result, type: _EMappedType) => {
    const mappedResult = {
        count: result.count,
        rows: [],
    };

    if (type === _EMappedType.BOOK) {
        mappedResult.rows = result.rows.map(b => bookModel(b));
        return mappedResult;
    }

    if (type === _EMappedType.BOOK_SEARCH) {
        mappedResult.rows = result.rows.map(bsh => bookSearchModel(bsh));
        return mappedResult;
    }

    if (type === _EMappedType.BOOK_STATE) {
        mappedResult.rows = result.rows.map(bs => bookStateModel(bs));
        return mappedResult;
    }

    return result;
};

export default _responseMapper;