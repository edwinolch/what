import { v4 as uuidv4 } from "uuid";
import ExposedImport from "../../database/models/ExposedImport";

interface Request {
  name: string;
  mapping: string;
  template: string;
  connections: string[];
  companyId: number;
  connectionType: string | boolean;
  officialTemplatesId: string | number;
  officialConnectionId: string | number;
}

const CreateExposedImportService = async ({
  name,
  mapping,
  template,
  connections,
  connectionType,
  officialTemplatesId,
  officialConnectionId,
  companyId,
}: Request): Promise<ExposedImport> => {
  let whatsappIds = null;

  if (connections.includes("Todos")) {
    whatsappIds = null;
  } else {
    whatsappIds = connections.join(",");
  }

  if (template === "" || template === "Nenhum") {
    template = null;
  }

  const exposedImport = await ExposedImport.create({
    id: uuidv4(),
    name,
    mapping,
    templateId: template,
    whatsappIds,
    official: connectionType,
    companyId,
    officialConnectionId,
    officialTemplatesId
  });

  return exposedImport;
};

export default CreateExposedImportService;