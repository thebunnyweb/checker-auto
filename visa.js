import Puppeteer from "puppeteer";

const constants = {
  baseUrl: "xxx",
  userEmail: "xxx",
  userSecret: "xxx",
  debug: false,
};

function getLaunchParams() {
  let options = {};
  if (constants.debug) {
    options = {
      ...options,
      headless: false,
      devtools: true,
    };
  }
  return {
    ...options,
  };
}

function getPayUrl(url, addr) {
  const splitUrl = url.split("/");
  splitUrl.pop();
  const payUrl = `${splitUrl.join("/")}/${addr}`;
  return payUrl;
}

async function signIn(page, baseDialogClick = false) {
  if (baseDialogClick) {
    await page.click(
      "body > div.ui-dialog.infoPopUp.ui-widget.ui-widget-content.ui-front.ui-dialog-buttons > div.ui-dialog-buttonpane.ui-widget-content.ui-helper-clearfix > div > button"
    );
  }
  await page.focus("#user_email");
  await page.keyboard.type(constants.userEmail);
  await page.waitForTimeout(500);
  await page.focus("#user_password");
  await page.waitForTimeout(500);
  await page.keyboard.type(constants.userSecret);
  await page.waitForTimeout(500);
  await page.click(
    "#new_user > div.radio-checkbox-group.margin-top-30 > label"
  );
  await page.waitForTimeout(500);
  await page.click("#new_user > p:nth-child(9) > input");
  await page.waitForTimeout(1000);
  await page.waitForNavigation({ waitUntil: "networkidle2" });
}

async function urlChecker(page) {
  await signIn(page);
  const url = await page.url();
  return url;
}

(async () => {
  const browser = await Puppeteer.launch(getLaunchParams());
  const context = await browser.createIncognitoBrowserContext();
  const page = await context.newPage();
  await page.goto(constants.baseUrl, {
    waitUntil: "networkidle2",
  });

  const initUrl = await page.url();
  if (initUrl.split("/").includes("sign_in")) {
    await signIn(page, true);
  } else {
    await signIn(page, false);
  }

  let currentURL = await page.url();
  while (currentURL.split("/").includes("sign_in")) {
    currentURL = await urlChecker(page); //eslint-disable-line
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
