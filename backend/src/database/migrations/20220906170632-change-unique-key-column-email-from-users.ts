import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.removeConstraint("Users", "email");
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeConstraint("Users", "email");
  }
};