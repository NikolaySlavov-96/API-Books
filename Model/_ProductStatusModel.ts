import { DataTypes, Model, Optional, Sequelize, } from 'sequelize';

import ModelName from './modelNames';

interface IProductStatusAttributes {
    userId: number;
    productId: number;
    statusId: number;
    isDelete: boolean;
}

interface IProductStatusCreationAttributes extends Optional<IProductStatusAttributes, 'statusId'> { }
// eslint-disable-next-line max-len
export class ProductStatus extends Model<IProductStatusAttributes, IProductStatusCreationAttributes> implements IProductStatusAttributes {
    userId: number;
    productId: number;
    declare statusId: number;
    declare isDelete: boolean;
}

export const ProductStatusFactory = (sequelize: Sequelize): typeof ProductStatus => {
    ProductStatus.init({
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        statusId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        isDelete: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    }, {
        sequelize,
        tableName: ModelName.PRODUCT_STATUS,
        timestamps: true,
    });

    return ProductStatus;
};