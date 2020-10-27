import { ArticleScraper, asJst } from "."
import { AxiosInstance } from "axios"
import { IncidentArticle } from ".."
import moment from "moment-timezone"
import axios from "axios"
import * as cheerio from "cheerio"

class DateExtractor {
  dateExtractors: Array<(dateBlock: string) => moment.Moment | null> = []

  constructor() {
    this.dateExtractors.push((tmpUpdatedDate: string) => {
      var matchedDate = tmpUpdatedDate.match(/\d\d\d\d\/\d\d?\/\d\d?/)
      if (!matchedDate) {
        return null
      }

      const matchedTime = tmpUpdatedDate.match(/\d\d?:\d\d?/)
      if (!matchedTime) {
        return null
      }

      const date = asJst(
        moment.tz(
          matchedDate[0].replace(/\//g, "-") + " " + matchedTime[0],
          "YYYY-M-D HH:mm",
          "Asia/Tokyo"
        )
      )
      return date
    })

    this.dateExtractors.push((tmpUpdatedDate: string) => {
      let matchedDate
      matchedDate = tmpUpdatedDate.match(/\d\d?\/\d\d?/)
      if (!matchedDate) {
        return null
      }

      const matchedTime = tmpUpdatedDate.match(/\d\d?:\d\d?/)
      if (!matchedTime) {
        return null
      }

      const now = moment.tz("Asia/Tokyo")
      const tmpDateStr: string =
        now.year() +
        "-" +
        matchedDate[0].replace(/\//g, "-") +
        " " +
        matchedTime[0]
      let date: moment.Moment
      try {
        const m: moment.Moment | string = moment.tz(
          tmpDateStr,
          "YYYY-M-D HH:mm",
          "Asia/Tokyo"
        )
        if (m.isValid() === false) {
          return null
        }
        date = asJst(m)
      } catch (e) {
        throw e
      }
      // published dateが2019-01-01で、dateが12/31となっていたばあい、2019-12-31となるので2018-12-31に戻す
      if (date.isAfter(now)) {
        date.subtract(1, "year")
      }

      return date
    })
  }
  extract(dateBlock: string): moment.Moment {
    const dateList = this.dateExtractors
      .map(f => f(dateBlock))
      .filter(e => e !== null)

    if (dateList.length == 0) {
      console.error(`cannot parse ${dateBlock}`)
      throw new Error(`cannot parse ${dateBlock}`)
    }

    const date = dateList[0]
    if (date != null) {
      return date
    } else {
      throw new Error(`cannot parse ${dateBlock} / ${date}`)
    }
  }
}

export class YahooArticleScraper implements ArticleScraper {
  readonly source: string = "yj-news"
  readonly sourceName: string = "Yahoo! JAPAN ニュース"

  readonly articleCssSelector: string = "#uamods"
  readonly axios: AxiosInstance

  readonly NOT_INCIDENT_REGEXP: RegExp = /(指名式|追悼|指定式|発隊式|開始式|祈願|訓練を|開設|会議|ワニ|政府|地震|ヨット|訓示|注意点|約束|観光|感謝状|思いやり|急増している|命名|激撮|設置|運転|リニア|報告|出発式|社会貢献|閉所式|気がかり|結隊式|祈り|祈る|献花|追悼式|開幕|冥福|授業|遺族)/

  constructor() {
    this.axios = axios.create({
      headers: {
        "User-Agent":
          "mountain-incident-collector (please feel free to contact twitter.com/sett4)",
      },
    })
  }

  canAccept(url: string): boolean {
    return url.startsWith("https://headlines.yahoo.co.jp/hl")
  }

  async scrape(url: string): Promise<IncidentArticle[]> {
    console.info(`updating ${url} , source ${this.source}`)

    const dateExtractor = new DateExtractor()

    let articles: IncidentArticle[] = await this.axios.get(url).then(res => {
      let $ = cheerio.load(res.data)
      return $(this.articleCssSelector)
        .map((i, el) => {
          let tmpUpdatedDate: string = $("#uamods footer time").text()
          let subject: string = $("#uamods header h1").text()
          let content: string = $("#uamods .article_body").text()
          let author: string = $("#uamods .article_body > p").text()

          let date: moment.Moment
          try {
            date = dateExtractor.extract(tmpUpdatedDate)
          } catch (e) {
            console.error(e)
            throw new Error(e + ` on ${url}`)
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

          article.scraper = YahooArticleScraper.name

          return article
        })
        .get()
    })

    if (articles.length == 0) {
      console.error(`cannot scrape ${url}`)
    }
    return articles
  }
}

export class YahooVideoArticleScraper implements ArticleScraper {
  readonly source: string = "yj-news"
  readonly sourceName: string = "Yahoo! JAPAN ニュース"

  readonly articleCssSelector: string = "div.yjDirectSLinkTarget"
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
    return url.startsWith("https://headlines.yahoo.co.jp/videonews")
  }

  async scrape(url: string): Promise<IncidentArticle[]> {
    const dateExtractor = new DateExtractor()

    console.info(`updating ${url} , source ${this.source}`)
    let articles: IncidentArticle[] = await this.axios.get(url).then(res => {
      let $ = cheerio.load(res.data)
      return $(this.articleCssSelector)
        .map((i, el) => {
          let tmpUpdatedDate: string = $(
            "#ym_newsarticle div div p.source"
          ).text()
          let subject: string = $("#ym_newsarticle div.hd h1").text()
          let content: string = $(
            "#ym_newsarticle div.articleMain div.yjDirectSLinkTarget"
          ).text()
          let author: string = $(".ynCpName a").text()

          let date: moment.Moment
          try {
            date = dateExtractor.extract(tmpUpdatedDate)
          } catch (e) {
            throw new Error(e + `on ${url}`)
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

          article.tags.add("山岳事故")
          article.tags.add("__private-use")

          article.scraper = YahooVideoArticleScraper.name

          return article
        })
        .get()
    })

    if (articles.length == 0) {
      console.error(`cannot scrape ${url}`)
    }
    return articles
  }
}
