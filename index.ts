import * as puppeteer from 'puppeteer'
import { config as dotenv } from 'dotenv'
import { writeFileSync } from 'fs'
import axios from 'axios'

dotenv()

const MU_USERNAME = process.env.MU_USERNAME || ''
const MU_PASSWORD = process.env.MU_PASSWORD || ''

;(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  })
  const page = await browser.newPage()
  await page.goto('https://academic.ict.mahidol.ac.th/student/e-Payment/Default.aspx')

  // Fill in Username
  await page.click('#txtUserName')
  await page.type('#txtUserName', MU_USERNAME)

  // Fill in Password
  await page.click('#txtPassword')
  await page.type('#txtPassword', MU_PASSWORD)

  // Login
  await Promise.all([page.waitForNavigation(), page.click('#btnLogin')])

  // Get Major Text
  const NewMajor = await page.$eval('#ContentPlaceHolder1_lblMajorENm', (e) => e.textContent)
  console.log(NewMajor)

  writeFileSync('README.md', `${NewMajor}|${new Date().toLocaleString()}`)

  await page.close()
  await browser.close()
})()
