import Puppeteer from "puppeteer";

const constants = {
  baseUrl: "XXX",
  userEmail: "XXX",
  userSecret: "XXX",
};

function getPayUrl(url, addr) {
  const splitUrl = url.split("/");
  splitUrl.pop();
  const payUrl = `${splitUrl.join("/")}/${addr}`;
  return payUrl;
}

async function signIn(page) {
  await page.focus("#user_email");
  await page.keyboard.type(constants.userEmail);
  await page.waitForTimeout(500);
  await page.focus("#user_password");
  await page.waitForTimeout(500);
  await page.keyboard.type(constants.userSecret);
  await page.waitForTimeout(500);
  await page.click("#new_user > div.radio-checkbox-group.margin-top-30 > label");
  await page.waitForTimeout(500);
  await Promise.all([
    page.click("#new_user > p:nth-child(9) > input"),
    page.waitForNavigation({ waitUntil: "networkidle2" }),
  ]);
}

async function urlChecker(page) {
  await signIn(page);
  const url = await page.url();
  return url;
}

(async () => {
  const browser = await Puppeteer.launch({
    headless: false,
    args: ["--incognito"],
    devtools: false,
  });

  const page = await browser.newPage();
  await page.setCacheEnabled(false);

  await page.goto(constants.baseUrl, {
    waitUntil: "networkidle0",
  });

  await signIn(page);

  let currentURL = await page.url();
  while (currentURL.split("/").includes("sign_in")) {
    currentURL = urlChecker(page);
  }

  await page.click("ul.dropdown.menu.align-right.actions > li:first-child > a");
  const url = await page.url();
  const payUrl = await getPayUrl(url, "payment");
  await page.goto(payUrl, {
    waitUntil: "networkidle2",
  });

  await page.screenshot({ path: "result.jpg", fullPage: true });
  await browser.close();
})();
