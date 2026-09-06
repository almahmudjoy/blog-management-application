import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Blog = sequelize.define(
    "Blog",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        blogTitle: {
            type: DataTypes.STRING,
            allowNull: false
        },

        blog: {
            type: DataTypes.TEXT,
            allowNull: false
        },

        category: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        tableName: "blogs",
        timestamps: true,
        createdAt: "createAt",
        updatedAt: "updateAt"
    }
);

export default Blog;