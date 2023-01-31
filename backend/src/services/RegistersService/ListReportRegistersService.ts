import { Op, Sequelize } from "sequelize";
import FileRegister from "../../database/models/FileRegister";
import { subHours } from "date-fns";

interface Request {
  statuses?: Array<any>;
  fileIds?: Array<any>;
  pageNumber?: string | number;
  companyId: number;
  initialDate: string;
  finalDate: string;
  name: string;
  phoneNumber: string;
}

interface Response {
  registers: FileRegister[];
  count: number;
  hasMore: boolean;
}

const ListReportRegistersService = async ({
  statuses,
  fileIds,
  pageNumber = "1",
  companyId,
  initialDate,
  finalDate,
  name = "",
  phoneNumber = ""
}: Request): Promise<Response> => {
  let whereCondition = null;

  whereCondition = { companyId };

  if (name) {
    whereCondition = {
      ...whereCondition,
      "$FileRegister.name$": Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("FileRegister.name")),
        "LIKE",
        `%${name.toLowerCase()}%`
      )
    }
  }

  if (phoneNumber) {
    whereCondition = {
      ...whereCondition,
      "$FileRegister.phoneNumber$": Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("FileRegister.phoneNumber")),
        "LIKE",
        `%${phoneNumber.toLowerCase()}%`
      )
    }
  }

  if (fileIds) {
    whereCondition = {
      ...whereCondition,
      fileId: {
        [Op.or]: fileIds
      }
    };
  }

  const getStatuses = () => {
    const array = [];

    if (statuses.includes("sent")) {
      array.push({ sentAt: { [Op.ne]: null } });
    }

    if (statuses.includes("delivered")) {
      array.push({ deliveredAt: { [Op.ne]: null } });
    }

    if (statuses.includes("read")) {
      array.push({ readAt: { [Op.ne]: null } });
    }

    if (statuses.includes("error")) {
      array.push({ errorAt: { [Op.ne]: null } });
    }

    return array;
  };

  const getDate = (date, option) => {
    if (option === "MORNING") {
        const morningDate = new Date(`${date} GMT-3`);
        morningDate.setHours(0, 0, 0, 0);
        return morningDate;
    }
    if (option === "NIGHT") {
        const nightDate = new Date(`${date} GMT-3`);
        nightDate.setHours(23, 59, 59, 999);
        return nightDate;
    }
    return null;
};

  if (statuses) {
    whereCondition = {
      ...whereCondition,
      [Op.or]: getStatuses()
    };
  }

  if (pageNumber === "ALL") {
    const { count, rows: registers } = await FileRegister.findAndCountAll({
      where: { ...whereCondition, companyId }
    });

    const hasMore = false;

    return { registers, count, hasMore };
  }

  if (initialDate && finalDate) {
    whereCondition = {
      ...whereCondition,
      processedAt: { [Op.between]: [getDate(initialDate, "MORNING"), getDate(finalDate, "NIGHT")] }
    }
  }

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: registers } = await FileRegister.findAndCountAll({
    where: { ...whereCondition, companyId },
    limit,
    offset
  });

  const hasMore = count > offset + registers.length;

  return { registers, count, hasMore };
};

export default ListReportRegistersService;