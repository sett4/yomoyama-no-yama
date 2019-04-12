import * as cheerio from "cheerio"
import axios, { AxiosStatic, AxiosInstance } from "axios"
import * as Url from "url"
import UrlParse from "url-parse"
import moment from "moment-timezone"

import { IncidentArticle, ArticleRepository, ArticleKey, IndexScraper } from "."

export default class Np24Scraper implements IndexScraper {
  indexCssSelector: string = "tr td p a"
  articleCssSelector: string = "#tmp_readcontents h2"
  baseUrl: string
  origin: string
  source: string = "np24"
  sourceName: string = "長野県警ニュース24時"
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
    let urls: string[] = await this.axios
      .get("https://www.pref.nagano.lg.jp/police/news24/index.html")
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
      var fullUrl: string
      if (url.startsWith("/")) {
        fullUrl = this.origin + url
      } else {
        fullUrl = url
      }
      return fullUrl
    })
  }
}
