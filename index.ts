import * as puppeteer from 'puppeteer'
import { config as dotenv } from 'dotenv'
import { writeFileSync } from 'fs'
import axios from 'axios'
import { stringify } from 'query-string'

dotenv()

const MU_USERNAME = process.env.MU_USERNAME || ''
const MU_PASSWORD = process.env.MU_PASSWORD || ''
const LINE_NOTIFY_TOKEN = process.env.LINE_NOTIFY_TOKEN || ''

;(async () => {
  const browser = await puppeteer.launch()
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
  const newMajor = await page.$eval('#ContentPlaceHolder1_lblMajorENm', (e) => e.textContent)
  console.log(newMajor)

  let { data: oldMajor } = await axios.get('https://raw.githubusercontent.com/iamprompt/muict-track-now/main/README.md')

  oldMajor = oldMajor.split('|')[0]

  if (newMajor !== oldMajor) {
    console.log('new')
    await axios.post(
      'https://notify-api.line.me/api/notify',
      stringify({
        message: `MUICT Track is available now!!\n at https://academic.ict.mahidol.ac.th/student/e-Payment/Default.aspx\nYour track is ${newMajor}`,
      }),
      {
        headers: {
          Authorization: `Bearer ${LINE_NOTIFY_TOKEN}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )
  }

  writeFileSync('README.md', `${newMajor}|${new Date().toLocaleString()}`)

  await page.close()
  await browser.close()
})()
