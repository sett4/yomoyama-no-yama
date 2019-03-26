import { ArticleScraper } from ".";
import { AxiosInstance } from "axios";
import { IncidentArticle } from "..";
import moment from "moment-timezone";
import axios from "axios"
import * as cheerio from 'cheerio'

export class YahooArticleScraper implements ArticleScraper {
    readonly source: string = 'yj-news'
    readonly sourceName: string = 'Yahoo! JAPAN ニュース'

    readonly articleCssSelector: string = "#ym_newsarticle div.articleMain div p.ynDetailText"
    readonly axios: AxiosInstance;

    constructor() {
        this.axios = axios.create({ headers: { 'User-Agent': 'mountain-incident-collector (please feel free to contact twitter.com/sett4)' } })
    }

    canAccept(url: string): boolean {
        return url.startsWith('https://headlines.yahoo.co.jp/hl');
    }

    async scrape(url: string): Promise<IncidentArticle[]> {
        console.info(`updating ${url}. source ${this.source}`)
        let articles: IncidentArticle[] = await this.axios.get(url)
            .then(res => {
                let $ = cheerio.load(res.data)
                return $(this.articleCssSelector).map((i, el) => {
                    let tmpUpdatedDate: string = $('#ym_newsarticle div div p.source').text()
                    let subject: string = $('#ym_newsarticle div.hd h1').text()
                    let content: string = $('#ym_newsarticle div.articleMain div p.ynDetailText').text()
                    let author: string = $('.ynCpName a').text()

                    let matchedDate = tmpUpdatedDate.match(/\d\d?\/\d\d?/);
                    if (!matchedDate) {
                        console.error(`cannot parse ${tmpUpdatedDate} on scraping ${url}.`)
                        return undefined;
                    }
                    
                    let matchedTime = tmpUpdatedDate.match(/\d\d?\:\d\d?/);
                    if (!matchedTime) {
                        console.error(`cannot parse ${tmpUpdatedDate} on scraping ${url}.`)
                        return undefined;
                    }

                    let now = moment().startOf('day')
                    let date = moment.tz(moment(now.year() + '-' + matchedDate[0].replace('/', '-') + ' '+ matchedTime[0], 'YYYY-M-D HH:mm'), 'Asia/Tokyo')
                    // published dateが2019-01-01で、dateが12/31となっていたばあい、2019-12-31となるので2018-12-31に戻す
                    if (date.isAfter(now)) {
                        date.subtract(1, 'year')
                    }
                    let publishedDateStr: string = date.format()
                    let dateStr = date.format()
                    let article = new IncidentArticle(this.source, this.sourceName, url, subject, content, dateStr, publishedDateStr, new Date(), author)
                    
                    article.category.add('山岳事故')
                    article.category.add('__private-use')

                    article.scraper = YahooArticleScraper.name

                    return article
                }).get()
            });

        if (articles.length == 0) {
            console.error(`cannot scrape ${url}`)
        }
        return articles;
    }
}

export class YahooVideoArticleScraper implements ArticleScraper {
    readonly source: string = 'yj-news'
    readonly sourceName: string = 'Yahoo! JAPAN ニュース'

    readonly articleCssSelector: string = "div.yjDirectSLinkTarget"
    readonly axios: AxiosInstance;

    constructor() {
        this.axios = axios.create({ headers: { 'User-Agent': 'mountain-incident-collector (please feel free to contact twitter.com/sett4)' } })
    }

    canAccept(url: string): boolean {
        return url.startsWith('https://headlines.yahoo.co.jp/videonews');
    }

    async scrape(url: string): Promise<IncidentArticle[]> {
        console.info(`updating ${url}. source ${this.source}`)
        let articles: IncidentArticle[] = await this.axios.get(url)
            .then(res => {
                let $ = cheerio.load(res.data)
                return $(this.articleCssSelector).map((i, el) => {
                    let tmpUpdatedDate: string = $('#ym_newsarticle div div p.source').text()
                    let subject: string = $('#ym_newsarticle div.hd h1').text()
                    let content: string = $('#ym_newsarticle div.articleMain div.yjDirectSLinkTarget').text()
                    let author: string = $('.ynCpName a').text()

                    let matchedDate = tmpUpdatedDate.match(/\d\d?\/\d\d?/);
                    if (!matchedDate) {
                        console.error(`cannot parse ${tmpUpdatedDate} on scraping ${url}.`)
                        return undefined;
                    }

                    let matchedTime = tmpUpdatedDate.match(/\d\d?\:\d\d?/);
                    if (!matchedTime) {
                        console.error(`cannot parse ${tmpUpdatedDate} on scraping ${url}.`)
                        return undefined;
                    }

                    let now = moment().startOf('day')
                    let date = moment.tz(moment(now.year() + '-' + matchedDate[0].replace('/', '-') + ' '+ matchedTime[0], 'YYYY-M-D HH:mm'), 'Asia/Tokyo')
                    // published dateが2019-01-01で、dateが12/31となっていたばあい、2019-12-31となるので2018-12-31に戻す
                    if (date.isAfter(now)) {
                        date.subtract(1, 'year')
                    }
                    let publishedDateStr: string = date.format()
                    let dateStr = date.format()
                    let article = new IncidentArticle(this.source, this.sourceName, url, subject, content, dateStr, publishedDateStr, new Date(), author)

                    article.category.add('山岳事故')
                    article.category.add('__private-use')

                    article.scraper = YahooVideoArticleScraper.name

                    return article
                }).get()
            });

        if (articles.length == 0) {
            console.error(`cannot scrape ${url}`)
        }
        return articles;
    }
}
