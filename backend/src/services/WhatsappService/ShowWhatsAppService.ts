import AppError from "../../errors/AppError";
import Category from "../../models/Category";
import Queue from "../../models/Queue";
import Whatsapp from "../../models/Whatsapp";

const ShowWhatsAppService = async (id: string | number): Promise<Whatsapp> => {
  const whatsapp = await Whatsapp.findByPk(id, {
    include: [
      {
        model: Queue,
        as: "queues",
        attributes: ["id", "name", "color", "greetingMessage"],
        include: [
          {
            model: Category,
            as: "categories",
            attributes: ["id", "name", "color"]
          }
        ]
      }
    ],
    order: [["queues", "name", "ASC"]]
  });

  if (!whatsapp) {
    throw new AppError("ERR_NO_WAPP_FOUND", 404);
  }

  return whatsapp;
};

export default ShowWhatsAppService;
