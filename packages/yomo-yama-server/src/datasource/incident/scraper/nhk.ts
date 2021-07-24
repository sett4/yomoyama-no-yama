import { ArticleScraper, asJst } from "./index"
import { AxiosInstance } from "axios"
import { IncidentArticle } from ".."
import * as moment from "moment-timezone"
import axios from "axios"
import * as cheerio from "cheerio"
import { log } from "../../../logger"

export class NhkLocalArticleScraper implements ArticleScraper {
  readonly source: string = "nhk-l"
  readonly sourceName: string = "NHK ローカル"

  readonly articleCssSelector: string = "div.content--detail-body"
  readonly axios: AxiosInstance

  readonly NOT_INCIDENT_REGEXP: RegExp = /(指名式|追悼|指定式|発隊式|開始式|祈願|訓練を|開設|会議|ワニ|政府|地震|ヨット|訓示|注意点|約束|観光|感謝状|思いやり|急増している|命名|激撮|設置|リニア|報告|出発式|社会貢献|閉所式|気がかり|結隊式|祈り|祈る|献花|追悼式|開幕|冥福|授業|遺族|慰霊)/

  constructor() {
    this.axios = axios.create({
      headers: {
        "User-Agent":
          "mountain-incident-collector (please feel free to contact twitter.com/sett4)",
      },
    })
  }

  canAccept(url: string): boolean {
    return (
      url.startsWith("https://www3.nhk.or.jp/lnews/") ||
      url.startsWith("https://www3.nhk.or.jp/shutoken-news/")
    )
  }

  async scrape(url: string): Promise<IncidentArticle[]> {
    log.info(`updating ${url} , source ${this.source}`)
    let articles: IncidentArticle[] = await this.axios.get(url).then(res => {
      let $ = cheerio.load(res.data)
      return $(this.articleCssSelector)
        .map((i, el) => {
          let tmpUpdatedDate: string = $("p.content--date").text()
          let subject: string = $("h1.content--title").text()
          let content: string = $(el).text()
          let author: string = "NHK"

          let matchedDate = tmpUpdatedDate.match(/\d\d?月\d\d?/)
          if (!matchedDate) {
            log.error(`cannot parse ${tmpUpdatedDate} on scraping ${url}.`)
            return undefined
          }

          let matchedTime = tmpUpdatedDate.match(/\d\d?時\d\d?/)
          if (!matchedTime) {
            log.error(`cannot parse ${tmpUpdatedDate} on scraping ${url}.`)
            return undefined
          }

          let now = moment.tz("Asia/Tokyo")
          let date = asJst(
            moment.tz(
              now.year() +
                "-" +
                matchedDate[0].replace("月", "-") +
                " " +
                matchedTime[0].replace("時", ":"),
              "YYYY-M-D HH:mm",
              "Asia/Tokyo"
            )
          )
          // published dateが2019-01-01で、dateが12/31となっていたばあい、2019-12-31となるので2018-12-31に戻す
          if (date.isAfter(now)) {
            date.subtract(1, "year")
          }
          let publishedDateStr: string = date.format()
          let dateStr = date.format()
          let article = new IncidentArticle(
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

          const tmp = "" + article.content + article.subject
          if (tmp.match(this.NOT_INCIDENT_REGEXP) === null) {
            article.tags.add("山岳事故")
          }
          article.tags.add("__private-use")

          article.scraper = NhkLocalArticleScraper.name

          return article
        })
        .get()
    })

    if (articles.length == 0) {
      log.error(`cannot scrape ${url}`)
    }
    return articles
  }
}

export class NhkArticleScraper implements ArticleScraper {
  readonly source: string = "nhk"
  readonly sourceName: string = "NHK"

  readonly articleCssSelector: string = "#news_textbody"
  readonly axios: AxiosInstance

  constructor() {
    this.axios = axios.create({
      headers: {
        "User-Agent":
          "mountain-incident-collector (please feel free to contact twitter.com/sett4)",
      },
    })
  }

  canAccept(url: string): boolean {
    return url.startsWith("https://www3.nhk.or.jp/news/")
  }

  async scrape(url: string): Promise<IncidentArticle[]> {
    log.info(`updating ${url} , source ${this.source}`)
    let articles: IncidentArticle[] = await this.axios.get(url).then(res => {
      let $ = cheerio.load(res.data)
      return $(this.articleCssSelector)
        .map((i, el) => {
          let tmpUpdatedDate: string =
            $("header.module--header p.title time").attr("datetime") || ""
          let subject: string = $(
            "header.module--header p.title span.contentTitle"
          ).text()
          let content: string = $(el).text()
          let author: string = "NHK"

          let date = moment.tz(tmpUpdatedDate, "Asia/Tokyo")
          let publishedDateStr: string = date.format()
          let dateStr = date.format()
          let article = new IncidentArticle(
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

          article.tags.add("山岳事故")
          article.tags.add("__private-use")

          article.scraper = NhkArticleScraper.name

          return article
        })
        .get()
    })

    if (articles.length == 0) {
      log.error(`cannot scrape ${url}`)
    }
    return articles
  }
}
