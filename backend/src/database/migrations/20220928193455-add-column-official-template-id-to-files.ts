import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Files", "officialTemplatesId", {
      type: DataTypes.INTEGER,
      references: { model: "OfficialTemplates", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Files", "officialTemplatesId");
  }
};
