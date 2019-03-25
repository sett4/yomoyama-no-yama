
import * as cheerio from 'cheerio'
import axios, { AxiosInstance } from 'axios'
import moment from 'moment-timezone'

import { IncidentArticle, MultipleArticleKey } from '.'
import { ErrorBase } from '../exceptioin';
import { auth } from 'firebase-admin';

export interface ArticleScraper {
    canAccept(url: string): boolean;
    scrape(url: string): Promise<IncidentArticle[]>;
    readonly source: string;
    readonly sourceName: string;
}

export class Np24ArticleScraper implements ArticleScraper {
    readonly source: string = 'np24';
    readonly sourceName: string = '長野県警ニュース24時';

    readonly articleCssSelector: string = "#tmp_readcontents h2"
    axios: AxiosInstance;

    constructor() {
        this.axios = axios.create({ headers: { 'User-Agent': 'mountain-incident-collector (please feel free to contact twitter.com/sett4)' } })
    }

    canAccept(url: string): boolean {
        return url.startsWith('https://www.pref.nagano.lg.jp/police/news24/');
    }

    async scrape(url: string): Promise<IncidentArticle[]> {
        console.info(`updating ${url}. source ${this.source}`)
        let articles: IncidentArticle[] = await this.axios.get(url)
            .then(res => {
                let $ = cheerio.load(res.data)
                let tmpUpdatedDate = $('#tmp_update').text()
                let tmpDate = $('#tmp_readcontents h1').text()
                let author = '長野県警察'
                return $(this.articleCssSelector).map((i, el) => {
                    let subject: string = $(el).text()
                    let content: string = $(el).next('p').text()
                    let publishedDate = moment(tmpUpdatedDate.replace(/更新日：|日/g, '').replace(/[年月]/g, '-'), 'YYYY-M-D').tz('Asia/Tokyo').startOf('day')
                    let publishedDateStr: string = publishedDate.format()
                    let date = moment(publishedDate.year() + '-' + tmpDate.replace(/[月]/g, '-').replace(/[日]/g, ''), 'YYYY-M-D').tz('Asia/Tokyo').startOf('day')
                    // published dateが2019-01-01で、dateが12/31となっていたばあい、2019-12-31となるので2018-12-31に戻す
                    if (date.isAfter(publishedDate)) {
                        date.subtract(1, 'year')
                    }
                    let dateStr = date.format()
                    let article = new IncidentArticle(this.source, this.sourceName, url, subject, content, dateStr, publishedDateStr, new Date(), author)
                    article.keyCreator = (a) => new MultipleArticleKey(a.source, a.url, a.subject);

                    if (this.isMountainIncident(article)) {
                        article.category.add('山岳事故')
                    }

                    return article
                }).get()
            });

        return articles;
    }

    isMountainIncident(article: IncidentArticle): boolean {
        if (article.subject.match(/遭難/)) {
            return true;
        }

        if (article.content.match(/遭難/)) {
            return true;
        }

        return false;
    }

}

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

                    let m = tmpUpdatedDate.match(/\d\d?\/\d\d?/);
                    if (!m) {
                        console.error(`cannot parse ${tmpUpdatedDate} on scraping ${url}.`)
                        return undefined;
                    }
                    
                    let now = moment().startOf('day')
                    let date = moment(now.year() + '-' + m[0].replace('/', '-'), 'YYYY-M-D').tz('Asia/Tokyo').startOf('day')
                    // published dateが2019-01-01で、dateが12/31となっていたばあい、2019-12-31となるので2018-12-31に戻す
                    if (date.isAfter(now)) {
                        date.subtract(1, 'year')
                    }
                    let publishedDateStr: string = date.format()
                    let dateStr = date.format()
                    let article = new IncidentArticle(this.source, this.sourceName, url, subject, content, dateStr, publishedDateStr, new Date(), author)

                    article.category.add('山岳事故')
                    article.category.add('__private-use')

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
    readonly source: string = 'yahoo-mt-incident'
    readonly sourceName: string = '山岳事故の関連情報 Yahoo! JAPAN'

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

                    let m = tmpUpdatedDate.match(/\d\d?\/\d\d?/);
                    if (!m) {
                        console.error(`cannot parse ${tmpUpdatedDate} on scraping ${url}.`)
                        return undefined;
                    }
                    
                    let now = moment().startOf('day')
                    let date = moment(now.year() + '-' + m[0].replace('/', '-'), 'YYYY-M-D').tz('Asia/Tokyo').startOf('day')
                    // published dateが2019-01-01で、dateが12/31となっていたばあい、2019-12-31となるので2018-12-31に戻す
                    if (date.isAfter(now)) {
                        date.subtract(1, 'year')
                    }
                    let publishedDateStr: string = date.format()
                    let dateStr = date.format()
                    let article = new IncidentArticle(this.source, this.sourceName, url, subject, content, dateStr, publishedDateStr, new Date(), author)

                    article.category.add('山岳事故')
                    article.category.add('__private-use')

                    return article
                }).get()
            });

        if (articles.length == 0) {
            console.error(`cannot scrape ${url}`)
        }
        return articles;
    }
}

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

                    let m = tmpUpdatedDate.match(/\d\d?月\d\d?/);
                    if (!m) {
                        console.error(`cannot parse ${tmpUpdatedDate} on scraping ${url}.`)
                        return undefined;
                    }
                    
                    let now = moment().startOf('day')
                    let date = moment(now.year() + '-' + m[0].replace('月', '-'), 'YYYY-M-D').tz('Asia/Tokyo').startOf('day')
                    // published dateが2019-01-01で、dateが12/31となっていたばあい、2019-12-31となるので2018-12-31に戻す
                    if (date.isAfter(now)) {
                        date.subtract(1, 'year')
                    }
                    let publishedDateStr: string = date.format()
                    let dateStr = date.format()
                    let article = new IncidentArticle(this.source, this.sourceName, url, subject, content, dateStr, publishedDateStr, new Date(), author)

                    article.category.add('山岳事故')
                    article.category.add('__private-use')

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

                    let date = moment(tmpUpdatedDate).tz('Asia/Tokyo').startOf('day')
                    let publishedDateStr: string = date.format()
                    let dateStr = date.format()
                    let article = new IncidentArticle(this.source, this.sourceName, url, subject, content, dateStr, publishedDateStr, new Date(), author)

                    article.category.add('山岳事故')
                    article.category.add('__private-use')

                    return article
                }).get()
            });

        if (articles.length == 0) {
            console.error(`cannot scrape ${url}`)
        }
        return articles;
    }
}


export class ArticleScrapers {
    private scrapers: ArticleScraper[] = [new Np24ArticleScraper(), new YahooArticleScraper(), new YahooVideoArticleScraper(), new NhkLocalArticleScraper(), new NhkArticleScraper()];
    register(scraper: ArticleScraper): void {
        this.scrapers.push(scraper);
    }

    scrape(url: string): Promise<IncidentArticle[]> {
        let scraper = this.scrapers.find(s => s.canAccept(url))
        if (!scraper) {
            return new Promise<IncidentArticle[]>((resolve, reject) => { resolve([]); });
        }

        return scraper.scrape(url);
    }
}