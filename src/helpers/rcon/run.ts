import { Rcon } from "rcon-client";

export const runRCONCommand = async <TResult>(command: string) => {
  const rcon = await Rcon.connect({
    host: process.env.RCON_HOST as string,
    port: parseInt(process.env.RCON_PORT as string, 10),
    password: process.env.RCON_PASSWORD as string,
  });

  const response = await rcon.send(command);

  await rcon.end();
  return response as TResult;
};
