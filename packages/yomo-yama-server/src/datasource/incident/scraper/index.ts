import { IncidentArticle, MultipleArticleKey } from "../"
import { Np24ArticleScraper } from "./np24"
import { YahooArticleScraper, YahooVideoArticleScraper } from "./yahoo"
import { NhkLocalArticleScraper, NhkArticleScraper } from "./nhk"
import moment = require("moment")
import { ArticlePostProcessor } from "../postprocessor"
import { log } from "../../../logger"

export interface ArticleScraper {
  canAccept(url: string): boolean
  scrape(url: string): Promise<IncidentArticle[]>
  readonly source: string
  readonly sourceName: string
}

export function asJst(dateTime: moment.Moment): moment.Moment {
  return moment.tz(dateTime.format("YYYY-MM-DDTHH:mm:ss"), "Asia/Tokyo")
}

export class ArticleScrapers {
  private scrapers: ArticleScraper[] = [
    new Np24ArticleScraper(),
    new YahooArticleScraper(),
    new YahooVideoArticleScraper(),
    new NhkLocalArticleScraper(),
    new NhkArticleScraper(),
  ]

  registerScraper(scraper: ArticleScraper): void {
    this.scrapers.push(scraper)
  }

  async scrape(url: string): Promise<IncidentArticle[]> {
    let scraper = this.scrapers.find((s) => s.canAccept(url))
    if (!scraper) {
      return new Promise<IncidentArticle[]>((resolve, reject) => {
        resolve([])
      })
    }

    const articleList = await scraper.scrape(url).catch((err) => {
      console.error(`error on ${url} `, err)
      return new Promise<IncidentArticle[]>((resolve, reject) => {
        resolve([])
      })
    })

    const result: IncidentArticle[] = []
    for await (const article of articleList) {
      result.push(await this.postProcess(article))
    }
    return result
  }

  private postProcessors: ArticlePostProcessor[] = []

  registerPostProcessor(processor: ArticlePostProcessor) {
    log.info(`register post processor: ${processor.constructor.name}`)
    this.postProcessors.push(processor)
  }

  async postProcess(article: IncidentArticle): Promise<IncidentArticle> {
    for await (const processor of this.postProcessors) {
      log.info(
        `post processing: ${article.toKey().getId()} by ${
          processor.constructor.name
        }`
      )
      article = await processor.postProcess(article)
    }
    return article
  }
}
