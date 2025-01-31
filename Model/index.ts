import { Sequelize, } from 'sequelize';

import * as ModelsInterfaces from './ModelsInterfaces';

export { ModelsInterfaces, };

import { initNewConnection, } from '../config';

const sequelize = initNewConnection();

import { UserFactory, } from './_UserModel';
import { AuthorFactory, } from './_AuthorModel';
import { StateFactory, } from './_States';
import { FileFactory, } from './_FileModel';
import { SessionModelFactory, } from './_SessionModel';
import { ProductFactory, } from './_ProductModel';
import { ProductStatusFactory, } from './_ProductStatusModel';
import { MessageFactory, } from './_MessageModel';
import { MessageStatusFactory, } from './_MessageStatus';

const db: any = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = UserFactory(sequelize);
db.Author = AuthorFactory(sequelize);
db.State = StateFactory(sequelize);
db.File = FileFactory(sequelize);
db.SessionModel = SessionModelFactory(sequelize);
db.Product = ProductFactory(sequelize);
db.ProductStatus = ProductStatusFactory(sequelize);
db.Message = MessageFactory(sequelize);
db.MessageStatus = MessageStatusFactory(sequelize);

// Association
db.User.hasMany(db.ProductStatus, { foreignKey: 'userId', });
db.ProductStatus.belongsTo(db.User, { foreignKey: 'userId', });

db.User.hasOne(db.SessionModel, {
    foreignKey: 'userId',
    constraints: false,
});

db.SessionModel.belongsTo(db.User, {
    foreignKey: 'userId',
});

db.Product.hasMany(db.File, {
    foreignKey: 'productId',
});
db.File.belongsTo(db.Product, {
    foreignKey: 'productId',
});

db.ProductStatus.belongsTo(db.State, { foreignKey: 'statusId', });

db.Product.belongsTo(db.Author, { foreignKey: 'authorId', });
db.Author.hasMany(db.Product, { foreignKey: 'authorId', });

db.ProductStatus.belongsTo(db.Product, { foreignKey: 'productId', });
db.Product.hasMany(db.ProductStatus, { foreignKey: 'productId', });

db.SessionModel.hasMany(db.Message, { foreignKey: 'senderId', sourceKey: 'connectId', });
db.MessageStatus.belongsTo(db.Message, { foreignKey: 'messageId', });

export default db;