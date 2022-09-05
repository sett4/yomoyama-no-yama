import { ArticleScraper } from "."
import { AxiosInstance } from "axios"
import { IncidentArticle, MultipleArticleKey } from ".."
import moment from "moment-timezone"
import axios from "axios"
import * as cheerio from "cheerio"
import { getLogger } from "../../../logger"

export class Np24ArticleScraper implements ArticleScraper {
  readonly source: string = "np24"
  readonly sourceName: string = "長野県警ニュース24時"

  readonly articleCssSelector: string = "#tmp_readcontents h2"
  axios: AxiosInstance

  constructor() {
    this.axios = axios.create({
      headers: {
        "User-Agent":
          "mountain-incident-collector (please feel free to contact twitter.com/sett4)",
      },
    })
  }

  canAccept(url: string): boolean {
    return url.startsWith("https://www.pref.nagano.lg.jp/police/news24/")
  }

  async scrape(url: string): Promise<IncidentArticle[]> {
    getLogger().info(`updating ${url} , source ${this.source}`)
    const articles: IncidentArticle[] = await this.axios.get(url).then(res => {
      const $ = cheerio.load(res.data)
      const tmpUpdatedDate = $("#tmp_update").text()
      const tmpDate = $("#tmp_readcontents h1").text()
      const author = "長野県警察"
      return $(this.articleCssSelector)
        .map((i, el) => {
          const subject: string = $(el).text()
          const content: string = $(el)
            .next("p")
            .text()
          const publishedDate = moment
            .tz(
              tmpUpdatedDate
                .replace(/更新日：|日/g, "")
                .replace(/[年月]/g, "-"),
              "YYYY-M-D",
              "Asia/Tokyo"
            )
            .tz("Asia/Tokyo")
            .startOf("day")
          const publishedDateStr: string = publishedDate.format()
          const date = moment
            .tz(
              publishedDate.year() +
                "-" +
                tmpDate.replace(/[月]/g, "-").replace(/[日]/g, ""),
              "YYYY-M-D",
              "Asia/Tokyo"
            )
            .startOf("day")
          // published dateが2019-01-01で、dateが12/31となっていたばあい、2019-12-31となるので2018-12-31に戻す
          if (date.isAfter(publishedDate)) {
            date.subtract(1, "year")
          }
          const dateStr = date.format()
          const article = new IncidentArticle(
            this.source,
            this.sourceName,
            url,
            subject,
            content,
            dateStr,
            publishedDateStr,
            new Date(),
            author
          )
          article.keyCreator = (a): MultipleArticleKey =>
            new MultipleArticleKey(a.source, a.url, a.subject)

          if (this.isMountainIncident(article)) {
            article.tags.add("山岳事故")
          }

          article.scraper = Np24ArticleScraper.name

          return article
        })
        .get()
    })

    return articles
  }

  isMountainIncident(article: IncidentArticle): boolean {
    if (article.subject.match(/遭難/)) {
      return true
    }

    if (article.content.match(/遭難/)) {
      return true
    }

    return false
  }
}
