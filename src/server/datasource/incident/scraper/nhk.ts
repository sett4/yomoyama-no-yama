import { ArticleScraper, asJst } from "./index";
import { AxiosInstance } from "axios";
import { IncidentArticle, MultipleArticleKey } from "..";
import moment from "moment-timezone";
import axios from "axios"
import * as cheerio from 'cheerio'

export class NhkLocalArticleScraper implements ArticleScraper {
    readonly source: string = 'nhk-l'
    readonly sourceName: string = 'NHK ローカル'

    readonly articleCssSelector: string = "div.content--detail-body"
    readonly axios: AxiosInstance;

    constructor() {
        this.axios = axios.create({ headers: { 'User-Agent': 'mountain-incident-collector (please feel free to contact twitter.com/sett4)' } })
    }

    canAccept(url: string): boolean {
        return url.startsWith('https://www3.nhk.or.jp/lnews/') || url.startsWith('https://www3.nhk.or.jp/shutoken-news/');
    }

    async scrape(url: string): Promise<IncidentArticle[]> {
        console.info(`updating ${url}. source ${this.source}`)
        let articles: IncidentArticle[] = await this.axios.get(url)
            .then(res => {
                let $ = cheerio.load(res.data)
                return $(this.articleCssSelector).map((i, el) => {
                    let tmpUpdatedDate: string = $('p.content--date').text()
                    let subject: string = $('h1.content--title').text()
                    let content: string = $(el).text()
                    let author: string = 'NHK'

                    let matchedDate = tmpUpdatedDate.match(/\d\d?月\d\d?/);
                    if (!matchedDate) {
                        console.error(`cannot parse ${tmpUpdatedDate} on scraping ${url}.`)
                        return undefined;
                    }

                    let matchedTime = tmpUpdatedDate.match(/\d\d?時\d\d?/);
                    if (!matchedTime) {
                        console.error(`cannot parse ${tmpUpdatedDate} on scraping ${url}.`)
                        return undefined;
                    }

                    let now = moment().tz('Asia/Tokyo')
                    let date = asJst(moment(now.year() + '-' + matchedDate[0].replace('月', '-')+' '+matchedTime[0].replace('時', ':'), 'YYYY-M-D HH:mm'))
                    // published dateが2019-01-01で、dateが12/31となっていたばあい、2019-12-31となるので2018-12-31に戻す
                    if (date.isAfter(now)) {
                        date.subtract(1, 'year')
                    }
                    let publishedDateStr: string = date.format()
                    let dateStr = date.format()
                    let article = new IncidentArticle(this.source, this.sourceName, url, subject, content, dateStr, publishedDateStr, new Date(), author)

                    article.tags.add('山岳事故')
                    article.tags.add('__private-use')

                    article.scraper = NhkLocalArticleScraper.name

                    return article
                }).get()
            });

        if (articles.length == 0) {
            console.error(`cannot scrape ${url}`)
        }
        return articles;
    }
}

export class NhkArticleScraper implements ArticleScraper {
    readonly source: string = 'nhk'
    readonly sourceName: string = 'NHK'

    readonly articleCssSelector: string = "#news_textbody"
    readonly axios: AxiosInstance;

    constructor() {
        this.axios = axios.create({ headers: { 'User-Agent': 'mountain-incident-collector (please feel free to contact twitter.com/sett4)' } })
    }

    canAccept(url: string): boolean {
        return url.startsWith('https://www3.nhk.or.jp/news/');
    }

    async scrape(url: string): Promise<IncidentArticle[]> {
        console.info(`updating ${url}. source ${this.source}`)
        let articles: IncidentArticle[] = await this.axios.get(url)
            .then(res => {
                let $ = cheerio.load(res.data)
                return $(this.articleCssSelector).map((i, el) => {
                    let tmpUpdatedDate: string = $('header.module--header p.title time').attr('datetime')
                    let subject: string = $('header.module--header p.title span.contentTitle').text()
                    let content: string = $(el).text()
                    let author: string = 'NHK'

                    let date = moment.tz(tmpUpdatedDate, 'Asia/Tokyo')
                    let publishedDateStr: string = date.format()
                    let dateStr = date.format()
                    let article = new IncidentArticle(this.source, this.sourceName, url, subject, content, dateStr, publishedDateStr, new Date(), author)

                    article.tags.add('山岳事故')
                    article.tags.add('__private-use')

                    article.scraper = NhkArticleScraper.name

                    return article
                }).get()
            });

        if (articles.length == 0) {
            console.error(`cannot scrape ${url}`)
        }
        return articles;
    }
}
