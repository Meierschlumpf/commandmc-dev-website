import { runRCONCommand } from "./run";

type ListResponse =
  `There are ${number} of a max of ${number} players online: ${string}`;
export const getPlayerCount = async () => {
  const response = await runRCONCommand<ListResponse>("list");
  const onlineCount = response.split("There are ")[1]?.split(" of a max of")[0];
  const maxCount = response
    .split("of a max of ")[1]
    ?.split(" players online:")[0];

  if (!onlineCount || !maxCount) {
    throw new Error("Unable to parse player count");
  }

  return {
    online: parseInt(onlineCount, 10),
    max: parseInt(maxCount, 10),
  };
};
