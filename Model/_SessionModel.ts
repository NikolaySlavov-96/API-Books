import { DataTypes, Model, Optional, Sequelize, } from 'sequelize';

import ModelName from './modelNames';

import { ISessionModelAttributes, } from './ModelsInterfaces';

interface ISessionModelCreationAttributes extends Optional<ISessionModelAttributes, 'id'> { }


class SessionModel extends Model<ISessionModelAttributes, ISessionModelCreationAttributes>
    implements ISessionModelAttributes {
    declare id: number;
    declare connectId: string;
    userId: number;
    declare connectedAt: string;
    declare disconnectedAt: string;
}

export const SessionModelFactory = (sequelize: Sequelize): typeof SessionModel => {
    SessionModel.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        connectId: {
            type: DataTypes.STRING(50),
            unique: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        connectedAt: {
            type: DataTypes.STRING,
        },
        disconnectedAt: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        sequelize,
        tableName: ModelName.SESSION,
        timestamps: false,
    });

    return SessionModel;
};