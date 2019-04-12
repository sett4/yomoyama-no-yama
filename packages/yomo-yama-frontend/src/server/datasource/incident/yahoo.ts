
import * as cheerio from 'cheerio'
import axios, { AxiosStatic, AxiosInstance } from 'axios'
import * as Url from 'url'
import UrlParse from 'url-parse'
import moment from 'moment-timezone'

import { IncidentArticle, ArticleRepository, ArticleKey, IndexScraper } from '.'

export default class YahooIndexScraper implements IndexScraper {
    indexCssSelector: string = "li a.detailFeed__wrap";
    articleCssSelector: string = "#tmp_readcontents h2"
    baseUrl: string
    origin: string
    axios: AxiosInstance;

    constructor(baseUrl?: string) {
        if (baseUrl == null) {
            baseUrl = 'https://follow.yahoo.co.jp/themes/0132518173d5c48d4428'
        }
        this.baseUrl = baseUrl
        this.origin = new UrlParse(baseUrl).origin
        this.axios = axios.create({ headers: { 'User-Agent': 'mountain-incident-collector (please feel free to contact twitter.com/sett4 )' }})
    }
    async getArticleUrls(): Promise<string[]> {
        let urls: string[] = await this.axios.get(this.baseUrl)
            .then((res) => {
                const $ = cheerio.load(res.data)
                const urls = $(this.indexCssSelector).map((i, el) => { return $(el).attr('href') }).get();
                return urls
            }).catch((err) => {
                return err
            })

        return urls
    }
}
