import * as cheerio from "cheerio"
import axios, { AxiosInstance } from "axios"
import UrlParse from "url-parse"

import { IndexScraper } from "."

export default class Np24Scraper implements IndexScraper {
  indexCssSelector = "tr > td > span > a"
  articleCssSelector = "#tmp_readcontents h2"
  baseUrl: string
  origin: string
  source = "np24"
  sourceName = "長野県警ニュース24時"
  axios: AxiosInstance

  constructor(baseUrl?: string) {
    if (baseUrl == null) {
      baseUrl = "https://www.pref.nagano.lg.jp/police/news24/index.html"
    }
    this.baseUrl = baseUrl
    this.origin = new UrlParse(baseUrl).origin
    this.axios = axios.create({
      headers: {
        "User-Agent":
          "mountain-incident-collector (please feel free to contact twitter.com/sett4)",
      },
    })
  }
  async getArticleUrls(): Promise<string[]> {
    const urls: string[] = await this.axios
      .get(this.baseUrl)
      .then(res => {
        const $ = cheerio.load(res.data)
        const urls = $(this.indexCssSelector)
          .map((i, el) => {
            return $(el).attr("href")
          })
          .get()
        return urls
      })
      .catch(err => {
        return err
      })

    return urls.map(url => {
      let fullUrl: string
      if (url.startsWith("/")) {
        fullUrl = this.origin + url
      } else {
        fullUrl = url
      }
      return fullUrl
    })
  }
}
