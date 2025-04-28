import { Sequelize, DataTypes } from "sequelize";

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./database.sqlite", // Path to your SQLite database file
    logging: false, // Disable logging
});

const Repository = sequelize.define(
    "repo",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        star: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["user", "name"],
            },
        ],
    },
);

const Release = sequelize.define(
    "release",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        tag: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        repoID: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["tag", "repoID"],
            },
        ],
    },
);

const Commit = sequelize.define(
    "commit",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        hash: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        releaseID: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["hash", "releaseID"],
            },
        ],
    },
);

// Define associations
Repository.hasMany(Release, { foreignKey: "repoID" });
Release.belongsTo(Repository, { foreignKey: "repoID" });
Release.hasMany(Commit, { foreignKey: "releaseID" });
Commit.belongsTo(Release, { foreignKey: "releaseID" });

export { Repository, Release, Commit, sequelize };
