import {Sequelize, Model, DataTypes} from 'sequelize';

export class DnsTable extends Model {
    declare id: number;
    declare name: string;
    declare dns: string;
}


export default class Database {
    static sequelize: Sequelize;

    static async init() {
        await this.openDB();
    }

    static async openDB() {
        this.sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: 'db.sqlite'
        });

        try {
            await this.sequelize.authenticate();
            console.log("Connected to database");
        } catch (err) {
            console.error(err);
        }

        DnsTable.init({
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
            },
            dns: {
                type: DataTypes.STRING,
            },
        }, {sequelize: this.sequelize, modelName: 'DnsTable'});


        await this.sequelize.sync();
    }

}

