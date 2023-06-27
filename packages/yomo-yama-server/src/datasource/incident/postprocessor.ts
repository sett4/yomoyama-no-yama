import { Trie } from "@tanishiking/aho-corasick"
import { IncidentArticle } from "."
import fs from "fs"
import zlib from "zlib"
import { DictionaryBuilder } from "../mountain/gsi-prefecture/buildDictionary"
import { log } from "../../logger"
import { Configuration, OpenAIApi } from "openai"
import { Post, PostExtraType, PrismaClient } from "@prisma/client"

export interface ArticlePostProcessor {
  postProcess(article: IncidentArticle): Promise<IncidentArticle>
}

export class AddMountainTagProcessor {
  private mountainTrie: Trie

  constructor() {
    this.mountainTrie = new Trie()
  }

  async initialize() {
    log.info("initializing Mountain name Trie.")
    const stream = fs
      .createReadStream(
        "src/datasource/mountain/gsi-prefecture/gsi_experimental_nnfpt_with_prefecture.csv.gz"
      )
      .pipe(zlib.createGunzip())

    const dictionaryBuilder = new DictionaryBuilder()
    const mountainList = await dictionaryBuilder.loadMountains(stream)
    this.mountainTrie = await dictionaryBuilder.build(mountainList)
    log.info("initializing Mountain name Trie. finished.")
  }

  async postProcess(article: IncidentArticle): Promise<IncidentArticle> {
    const tags = this.extractMountain(this.mountainTrie, article.content)
    if (tags.length > 0) {
      log.info(`tags ${tags}`)
    }
    tags
      .filter(
        (t) =>
          !t.match(
            "[都道府県]$"
          ) /* 富山県に富山をマッチさせないために富山県を辞書に入れてある。でも、都道府県名は要救助者の住んでいる県としてでることもあるので除外する*/
      )
      .forEach((t) => article.tags.add(t))
    return article
  }

  extractMountain(trie: Trie, content: string): string[] {
    const emitted = trie.parseText(content)

    return Array.from(new Set(emitted.map((e) => e.keyword)))
  }
}

export class ChatGptPostExtraProcessor {
  private openai: OpenAIApi
  private prisma: PrismaClient
  private chatGptModel: string

  constructor(
    openaiApiKey: string,
    prisma: PrismaClient,
    model: string = "gpt-3.5-turbo"
  ) {
    const configuration = new Configuration({
      organization: "org-jETSENZkkC9Pye2vSp2NHDgJ",
      apiKey: openaiApiKey,
    })
    // console.log("Key", openaiApiKey)
    this.openai = new OpenAIApi(configuration)
    this.prisma = prisma
    this.chatGptModel = model
  }

  async initialize() {}

  async postProcess(article: IncidentArticle): Promise<IncidentArticle> {
    const tmpPostExtra = await this.prisma.postExtra.findUnique({
      where: { id: article.toKey().getId() },
    })
    if (tmpPostExtra) {
      log.info({ message: "already processed", key: article.toKey().getId() })
      return article
    }

    const content = `
    ## 指示
    以下の入力テキストは山岳事故のニュース記事です。指示する出力テンプレートに沿って情報を抽出してください。
    
    ## 入力テキスト
    ${article.content}
    
    ## 出力の制約
    回答はJSONとしてパース可能であること

    ## 出力テンプレート
    {
    "articleTags":  <入力テキストを表すタグをArrayで表現。最大5つ>,
    "isMountainIncidentArticle": <入力テキストが山岳事故のニュース記事かどうかbooleanで表現>,
    "incidentProbability": <isMountainIncidentArticleの確からしさを0-1で表現>,
    "isSurveyArticle": <特定の事故ではなく統計的な記事かどうかbooleanで表現>,
    "surveyProbability": <isSurveyArticleの確からしさを0-1で表現>,
    "summary":  "<入力テキストの230文字以内の要約>",
    "incidentLocation": ["<事故の場所>", ...],
    "mountain": "<事故の発生した山の名前>",
    "prefecture": "<都道府県名>",
    "incidentDate": "<事故の発生した日をISO 8601形式で>"
    }`
    let response
    try {
      response = await this.openai.createChatCompletion({
        model: this.chatGptModel,
        messages: [{ role: "user", content: content }],
      })
    } catch (e) {
      log.error({
        error: e,
        key: article.toKey().getId(),
        message: "error occured on asking to ChatGPT. continue...",
      })
      return article
    }

    await new Promise((r) => setTimeout(r, 0.2))

    const answer = response.data.choices[0].message?.content
    log.info({ message: "ChatGPT Answer is", answer })

    if (answer) {
      let parsed
      try {
        parsed = JSON.parse(answer)
      } catch (e) {
        log.error({ message: "cannot parse ChatGPT answer", error: e, answer })
        return article
      }
      if (parsed.isMountainIncidentArticle) {
        article.tags.add("山岳事故")
      } else {
        article.tags.delete("山岳事故")
      }

      if (parsed.isSurveyArticle) {
        article.tags.add("__hidden")
      } else {
        article.tags.delete("__hidden")
      }

      if (parsed.tags) {
        parsed.tags.forEach((t: string) => article.tags.add(t))
      }

      if (parsed.prefecture) {
        article.tags.add(parsed.prefecture)
      }

      if (parsed.mountain) {
        article.tags.add(parsed.mountain)
      }

      if (article.tags.has("__private-use") && parsed.summary) {
        article.content = parsed.summary
      }

      log.info({ postId: article.toKey().getId(), article })
      await this.prisma.postExtra.upsert({
        where: { id: article.toKey().getId() },
        update: {
          id: article.toKey().getId(),
          type: PostExtraType.INCIDENT_GPT,
          content: answer,
        },
        create: {
          id: article.toKey().getId(),
          type: PostExtraType.INCIDENT_GPT,
          content: answer,
        },
      })
    }

    return article
  }
}
