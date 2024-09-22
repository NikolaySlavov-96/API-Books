import db from '../Model';

import { SYSTEM_FILE_DIRECTORY, } from '../constants';
import messages from '../constants/_messages';

import { createDirectoryPath, unlinkFileFromSystem, updateMessage, UUID, } from '../util';

const UPLOAD_DIRECTORY = SYSTEM_FILE_DIRECTORY.UPLOAD;

export const addedFile = async (deliverFile, src) => {
    const { name: realImageName, mimetype, } = deliverFile;

    const uniqueFileName = UUID();

    const [_, fileExtension] = mimetype.split('/');
    const fileName = `${uniqueFileName}.${fileExtension}`;

    const creationResult = await db.File.create({
        extension: fileExtension,
        realImageName,
        src,
        uniqueName: fileName,
    });

    const pathName = createDirectoryPath(UPLOAD_DIRECTORY, fileName);
    deliverFile.mv(pathName);

    const resourcePath = UPLOAD_DIRECTORY + '/' + fileName;
    return { resourcePath, fileId: creationResult?.dataValues?.id, };
};

export const removeFile = async (fileId) => {
    const imageData = await db.File.findByPk(fileId);

    if (!imageData) {
        return updateMessage(messages.FILE_DOES_NOT_EXIT, 400);
    }

    const result = await unlinkFileFromSystem(UPLOAD_DIRECTORY, imageData?.dataValues?.uniqueName);
    if (!result) {
        return updateMessage(messages.UN_SUCCESS_REMOVE_FILE, 400);
    }

    await imageData.destroy();

    return updateMessage(messages.SUCCESS_REMOVE_FILE, 200);
};