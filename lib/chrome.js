import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";

export async function getBrowser() {
  return puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
    defaultViewport: chromium.defaultViewport,
  });
}
