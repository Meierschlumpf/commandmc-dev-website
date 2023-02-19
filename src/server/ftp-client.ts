import { Client } from "basic-ftp";

export const downloadStorageFile = async () => {
  const client = new Client();
  client.ftp.verbose = true;
  try {
    await client.access({
      host: process.env.FTP_HOST,
      port: parseInt(process.env.FTP_PORT!, 10),
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
    });

    await client.downloadTo(
      process.env.FTP_DOWNLOAD_PATH!,
      process.env.FTP_STORAGE_PATH!
    );

    client.close();
  } catch (err) {
    throw new Error("FTP connection failed");
  }
};
