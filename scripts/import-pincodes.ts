import fs from "fs";

import csv from "csv-parser";

import connectDB from "@/lib/db";

import {
  getPincodeModel,
} from "@/models/Pincode";

async function run() {

  try {

    const conn =
      await connectDB();

    const Pincode =
      getPincodeModel(conn);

    const rows: any[] = [];

    fs.createReadStream(
      "./pincodes.csv"
    )
      .pipe(csv())

      .on("data", (data) => {

        rows.push({

          pincode:
            String(
              data.Pincode || ""
            ).trim(),

          officeName:
            String(
              data.PostOfficeName || ""
            ).trim(),

          district:
            String(
              data.DistrictsName || ""
            ).trim(),

          city:
            String(
              data.City || ""
            ).trim(),

          state:
            String(
              data.State || ""
            ).trim(),

          updatedAt:
            new Date(),
        });
      })

      .on("end", async () => {

        console.log(
          "TOTAL ROWS:",
          rows.length
        );

        for (const row of rows) {

          if (!row.pincode)
            continue;

          await Pincode.updateOne(
            {
              pincode:
                row.pincode,
            },
            {
              $set: row,
            },
            {
              upsert: true,
            }
          );
        }

        console.log(
          "PINCODES IMPORTED SUCCESSFULLY"
        );

        process.exit(0);
      });

  } catch (err) {

    console.error(
      "IMPORT FAILED:",
      err
    );

    process.exit(1);
  }
}

run();
