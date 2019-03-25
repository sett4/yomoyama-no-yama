
import * as cheerio from 'cheerio'
import axios, { AxiosStatic, AxiosInstance } from 'axios'
import * as Url from 'url'
import UrlParse from 'url-parse'
import moment from 'moment-timezone'

import { IncidentArticle, ArticleRepository, ArticleKey } from '../'

export class Np24Scraper {
    indexCssSelector: string = "tr td p a";
    articleCssSelector: string = "#tmp_readcontents h2"
    baseUrl: string
    origin: string
    source: string = 'np24'
    sourceName: string = '長野県警ニュース24時'
    repository: ArticleRepository;
    axios: AxiosInstance;

    constructor(repository: ArticleRepository);
    constructor(repository: ArticleRepository, baseUrl?: string) {
        this.repository = repository
        if (baseUrl == null) {
            baseUrl = 'https://www.pref.nagano.lg.jp/police/news24/index.html'
        }
        this.baseUrl = baseUrl
        this.origin = new UrlParse(baseUrl).origin
        this.axios = axios.create({ headers: { 'User-Agent': 'mountain-incident-collector (please feel free to contact fjt.seth@gmail.com)' }})
    }
    async update(): Promise<String> {
        let urls: string[] = await this.axios.get("https://www.pref.nagano.lg.jp/police/news24/index.html")
            .then((res) => {
                const $ = cheerio.load(res.data)
                const urls = $(this.indexCssSelector).map((i, el) => { return $(el).attr('href') }).get();
                return urls
            }).catch((err) => {
                return err
            })

        await urls.map(async url => {
            return this.updateDaily(url)
        })

        return "OK"
    }

    async updateDaily(url: string): Promise<IncidentArticle[]> {
        var fullUrl: string
        if (url.startsWith('/')) {
            fullUrl = this.origin + url
        } else {
            fullUrl = url
        }

        console.info(`updating ${fullUrl}. source ${this.source}`)
        let articles: IncidentArticle[] = await this.axios.get(fullUrl)
            .then(res => {
                let $ = cheerio.load(res.data)
                let tmpUpdatedDate = $('#tmp_update').text()
                let tmpDate = $('#tmp_readcontents h1').text()
                return $(this.articleCssSelector).map((i, el) => {
                    let subject: string = $(el).text()
                    let content: string = $(el).next('p').text()
                    let publishedDate = moment(tmpUpdatedDate.replace(/更新日：|日/g, '').replace(/[年月]/g, '-')).tz('Asia/Tokyo').startOf('day')
                    let publishedDateStr: string = publishedDate.format()
                    let date = moment(publishedDate.year() +'-'+ tmpDate.replace(/[月]/g, '-').replace(/[日]/g,'')).tz('Asia/Tokyo').startOf('day')
                    // published dateが2019-01-01で、dateが12/31となっていたばあい、2019-12-31となるので2018-12-31に戻す
                    if (date.isAfter(publishedDate)) {
                        date.subtract(1, 'year')
                    }
                    let dateStr = date.format()
                    let article = new IncidentArticle(this.source, this.sourceName, fullUrl, subject, content, dateStr, publishedDateStr, new Date())

                    if (this.isMountainIncident(article)) {
                        article.category.add('山岳事故')
                    }

                    return article
                }).get()
            });

        let result = articles.map(article => { return this.saveArticle(article) })
        return Promise.all(result)
    }

    async saveArticle(article: IncidentArticle): Promise<IncidentArticle> {
        await this.repository.save(article)
        console.info(`updating source ${article.source} ${article.url} ${article.subject}`)
        return article
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
