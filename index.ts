import * as puppeteer from 'puppeteer'
import { config as dotenv } from 'dotenv'
import { writeFile, readFile } from 'fs/promises'
import { stringify } from 'query-string'
import axios from 'axios'

dotenv()

const MU_USERNAME = process.env.MU_USERNAME || ''
const MU_PASSWORD = process.env.MU_PASSWORD || ''
const LINE_NOTIFY_TOKEN = process.env.LINE_NOTIFY_TOKEN || ''

const systemUrl = [
  {
    url: 'https://academic.ict.mahidol.ac.th/Student/e-Registration/Default.aspx',
    loginBtn: '#btnOAuthLogin',
    trackSelector: '#body_StudentInfo_lblMajorENm',
  },
  {
    url: 'https://academic.ict.mahidol.ac.th/student/e-Payment/#!',
    loginBtn: '#btnOAuthLogin',
    trackSelector: '#ContentPlaceHolder1_lblMajorENm',
  },
]

;(async () => {
  let oldMajor = await readFile('README.md', 'utf-8')
  oldMajor = oldMajor.split('|')[0]

  let newMajor = ''

  let isSignIn = false

  const browser = await puppeteer.launch({
    headless: true,
  })
  for (const system of systemUrl) {
    const { url, loginBtn, trackSelector } = system

    const page = await browser.newPage()

    await Promise.all([page.goto(url)])

    const u = await Promise.all([page.waitForNavigation(), page.click(loginBtn)])

    // console.log(u)

    if (!isSignIn) {
      // Fill in Username
      await page.waitForSelector('#userNameInput')
      await page.click('#userNameInput')
      await page.type('#userNameInput', MU_USERNAME)

      // Fill in Password
      await page.waitForSelector('#passwordInput')
      await page.click('#passwordInput')
      await page.type('#passwordInput', MU_PASSWORD)

      // Login
      await Promise.all([page.waitForNavigation(), page.click('#submitButton')])
    }

    isSignIn = true

    // Get Major Text
    await page.waitForSelector(trackSelector)
    newMajor = await page.$eval(trackSelector, (e) => e.textContent)
    console.log(newMajor)

    if (newMajor !== oldMajor) {
      console.log('There are some changes')
      console.log(oldMajor, newMajor)
      await axios.post(
        'https://notify-api.line.me/api/notify',
        stringify({
          message: `MUICT Track is available now!!\n at ${url}\nYour track is ${newMajor}`,
        }),
        {
          headers: {
            Authorization: `Bearer ${LINE_NOTIFY_TOKEN}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )
    }

    await page.close()
  }

  writeFile('README.md', `${newMajor}|${new Date().toLocaleString()}`)

  await browser.close()
})()
