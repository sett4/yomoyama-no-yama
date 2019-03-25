import * as admin  from 'firebase-admin'
import * as Url from 'url'
import crypto from 'crypto';

export interface ArticleRepository {
    exists(key: ArticleKey): boolean;
    save(article: IncidentArticle): Promise<any>;
    load(key: ArticleKey): Promise<IncidentArticle>;
    findAll(source: string): Promise<IncidentArticle[]>;
}

export class EmptyArticleRepository implements ArticleRepository {
    exists(key: ArticleKey): boolean {
        throw new Error("Method not implemented.");
    }
    save(article: any): Promise<any> {
        return new Promise<any>( (resolve, reject) => { resolve(); })
    }
    load(key: ArticleKey): Promise<IncidentArticle> {
        throw new Error("Method not implemented.");
    }
    findAll(source: string): Promise<IncidentArticle[]> {
        throw new Error("Method not implemented.");
    }
}

export class FirestoreArticleRepository implements ArticleRepository {
    db: admin.firestore.Firestore;
    readonly COLLECTION_ARTICLE: string = 'incident';

    constructor() {
        admin.initializeApp({
        credential: admin.credential.applicationDefault()
        });

        this.db = admin.firestore();
    }

    exists(key: ArticleKey): boolean {
        throw new Error("Method not implemented.");
    }    
    save(article: IncidentArticle): Promise<any> {
        return this.db.collection(this.COLLECTION_ARTICLE)
        .doc(article.toKey().getId())
        .set(article.toData())
    }
    load(key: ArticleKey): Promise<IncidentArticle> {
        throw new Error("Method not implemented.");
    }
    findAll(source: string): Promise<IncidentArticle[]> {
        throw new Error("Method not implemented.");
    }

    
}

export interface IndexScraper {
    getArticleUrls(): Promise<string[]>;
}
export class IncidentArticle {
    source: string
    url: string;
    subject: string;
    content: string;
    publishedDate: string;
    processedDate: Date;
    category: Set<string> = new Set<string>();
    date: string;
    sourceName: string;
    author: string;
    _kc: ArticleKeyCreator;
    set keyCreator(kc: ArticleKeyCreator) {
        this._kc = kc
    }

    constructor(source: string, sourceName: string, url: string, subject: string, content: string, date: string, publishedDate: string, processedDate: Date, author: string) {
        this.source = source
        this.sourceName = sourceName
        this.url = url
        this.subject = subject
        this.content = content
        this.publishedDate = publishedDate
        this.processedDate = processedDate
        this.date = date
        this.author = author
        this._kc = (a) => new SingleArticleKey(a.source, a.url);
    }

    toKey(): ArticleKey {
        return this._kc(this)
    }



    toData(): any {
        let category: string[] = [];
        this.category.forEach(v => category.push(v))

        return {
            source: this.source,
            sourceName: this.sourceName,
            url: this.url,
            subject: this.subject,
            content: this.content,
            date: this.date,
            publishedDate: this.publishedDate,
            processedDate: this.processedDate,
            category: category
        }
    }
}

export interface ArticleKey {
    getId(): string
}

export type ArticleKeyCreator = (a: IncidentArticle) => ArticleKey;
export class MultipleArticleKey {
    source: string
    url: string;
    subject: string;
    constructor(source: string, url: string, subject: string) {
        this.source = source
        this.url = url
        this.subject = subject
    }

    getId(): string {
        let hash = crypto.createHash('sha256')
        hash.update(this.source)
        hash.update(this.url)
        hash.update(this.subject)
        return this.source+'.'+hash.digest('hex')
    }
}

export class SingleArticleKey {
    source: string
    url: string;
    constructor(source: string, url: string) {
        this.source = source
        this.url = url
    }

    getId(): string {
        let hash = crypto.createHash('sha256')
        hash.update(this.source)
        hash.update(this.url)
        return this.source+'.'+hash.digest('hex')
    }
}
