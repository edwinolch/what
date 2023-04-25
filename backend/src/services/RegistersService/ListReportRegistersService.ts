import { Op, Sequelize } from "sequelize";
import FileRegister from "../../database/models/FileRegister";
import { endOfDay, parseISO, startOfDay, subHours } from "date-fns";
import File from "../../database/models/File";
import ConnectionFiles from "../../database/models/ConnectionFile";
import Message from "../../database/models/Message";
import Ticket from "../../database/models/Ticket";
import Category from "../../database/models/Category";

interface Request {
  statuses?: Array<any>;
  fileIds?: Array<any>;
  pageNumber?: string | number;
  companyId: number;
  initialDate?: string;
  finalDate?: string;
  name?: string;
  phoneNumber?: string;
  limit?: string;
  categoryIds?: Array<any>;
  isProcessed?: string;
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
  phoneNumber = "",
  limit = "20",
  categoryIds,
  isProcessed = "true"
}: Request): Promise<Response> => {
  let whereCondition = null;
  let whereConditionCategory = null;

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
      fileId: fileIds
    };
  }

  if (statuses) {
    whereCondition = {
      ...whereCondition,
      [Op.or]: getStatuses(statuses)
    };
  }

  if (initialDate && finalDate) {
    whereCondition = {
      ...whereCondition,
      createdAt: {
        [Op.between]: [+startOfDay(parseISO(initialDate)), +endOfDay(parseISO(finalDate))]
      },
    }
  }

  if (categoryIds) {
    whereConditionCategory = {
      where: { id: categoryIds },
    }
  }

  if (isProcessed === "true") {
    whereCondition = {
      ...whereCondition,
      processedAt: { [Op.ne]: null }
    };
  }

  const offset = +limit * (+pageNumber - 1);

  const { count, rows: registers } = await FileRegister.findAndCountAll({
    where: whereCondition,
    include: [
      {
        model: Message,
        as: "messageData",
        attributes: ["id", "ticketId"],
        include: [
          {
            model: Ticket,
            as: "ticket",
            attributes: ["id", "categoryId"],
            include: [
              {
                model: Category,
                as: "category",
                attributes: ["id", "name"],
                required: true,
                ...whereConditionCategory
              }
            ],
            required: true
          }
        ],
        required: categoryIds ? true: false,
      }
    ],
    limit: +limit > 0 ? +limit : null,
    offset: +limit > 0 ? offset : null,
  });

  const hasMore = count > offset + registers.length;

  return { registers, count, hasMore };
};

const getStatuses = (statuses) => {
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

  if (statuses.includes("interaction")) {
    array.push({ interactionAt: { [Op.ne]: null } });
  }

  return array;
};

export default ListReportRegistersService;
