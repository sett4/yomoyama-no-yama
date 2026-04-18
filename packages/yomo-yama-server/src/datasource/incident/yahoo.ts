import * as cheerio from "cheerio"
import axios, { AxiosInstance } from "axios"
import UrlParse from "url-parse"

import { IndexScraper } from "."

export default class YahooIndexScraper implements IndexScraper {
  indexCssSelector = 'li a[class*="ThemeArticleItem-module-scss-module__zzLfua__ThemeArticleItem__anchor cl-nofollow"]'
  baseUrl: string
  origin: string
  axios: AxiosInstance

  constructor(baseUrl?: string) {
    if (baseUrl == null) {
      baseUrl = "https://follow.yahoo.co.jp/themes/0132518173d5c48d4428"
    }
    this.baseUrl = baseUrl
    this.origin = new UrlParse(baseUrl).origin
    this.axios = axios.create({
      headers: {
        "User-Agent":
          "mountain-incident-collector (please feel free to contact twitter.com/sett4 )",
      },
    })
  }
  async getArticleUrls(): Promise<string[]> {
    const urls: string[] = await this.axios
      .get(this.baseUrl)
      .then((res) => {
        const $ = cheerio.load(res.data)
        const urls = $(this.indexCssSelector)
          .map((i, el) => {
            return $(el).attr("href")
          })
          .get()
        return urls
      })
      .catch((err) => {
        return err
      })

    return urls
  }
}
