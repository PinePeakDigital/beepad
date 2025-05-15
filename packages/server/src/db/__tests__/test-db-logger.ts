import { DefaultLogger, LogWriter } from "drizzle-orm/logger";
import fs from "fs";
import path from "path";

class MyLogWriter implements LogWriter {
  write(message: string) {
    fs.appendFileSync(
      path.join(__dirname, "../../../logs/test-db.log"),
      `${message.slice(0, 1000)}\n`,
    );
  }
}

export const logger = new DefaultLogger({ writer: new MyLogWriter() });
