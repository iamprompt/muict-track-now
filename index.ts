import { chromium } from 'playwright'
import { config as dotenv } from 'dotenv'
import { writeFileSync } from 'fs'

dotenv()

const MU_USERNAME = process.env.MU_USERNAME || ''
const MU_PASSWORD = process.env.MU_PASSWORD || ''

;(async () => {
  const browser = await chromium.launch({
    headless: false,
  })
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto('https://academic.ict.mahidol.ac.th/student/e-Payment/Default.aspx')

  // Fill in Username
  await page.click('#txtUserName')
  await page.fill('#txtUserName', MU_USERNAME)

  // Fill in Password
  await page.click('#txtPassword')
  await page.fill('#txtPassword', MU_PASSWORD)

  // Login
  await Promise.all([page.waitForNavigation(), page.click('#btnLogin')])

  // Get Major Text
  const NewMajor = await page.innerText('#ContentPlaceHolder1_lblMajorENm')
  console.log(NewMajor)

  writeFileSync('README.md', NewMajor)

  await context.close()
  await browser.close()
})()
