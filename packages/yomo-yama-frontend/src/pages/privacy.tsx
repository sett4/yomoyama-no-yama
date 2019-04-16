import React from "react"
import Layout from "../components/layout"
import { Theme } from "@material-ui/core/styles/createMuiTheme"
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles"
import createStyles from "@material-ui/core/styles/createStyles"
import Typography from "@material-ui/core/Typography"
import withRoot from "../withRoot"
import { Paper, Link } from "@material-ui/core"
import Helmet from "react-helmet"

const styles = (theme: Theme) => {
  return createStyles({})
}

interface AboutPageProps extends WithStyles<typeof styles> {
  data: {}
}

class AboutPage extends React.PureComponent<AboutPageProps> {
  constructor(props: AboutPageProps) {
    super(props)
  }
  render() {
    return (
      <Layout>
        <Helmet>
          <title>Privacy Policy: よもやまごとのやま</title>
          <meta
            name="description"
            content="よもやまごとのやまのプライバシーポリシー"
          />
        </Helmet>
        <Paper>
          {/* http://liberty-life-blog.com/wordpress/privacy-policy/ */}
          <Typography variant="h2">Privacy Policy</Typography>

          <Typography variant="h3">広告の配信について</Typography>

          <Typography>
            当サイトは第三者配信の広告サービス「Google Adsense
            グーグルアドセンス」を利用しています。
            広告配信事業者は、ユーザーの興味に応じた広告を表示するためにCookie（クッキー）を使用することがあります。
            Cookie（クッキー）を無効にする設定およびGoogleアドセンスに関する詳細は「広告
            – ポリシーと規約 – Google」をご覧ください。
            また、[サイト名]は、Amazon.co.jpを宣伝しリンクすることによってサイトが紹介料を獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、Amazonアソシエイト・プログラムの参加者です。
            第三者がコンテンツおよび宣伝を提供し、訪問者から直接情報を収集し、訪問者のブラウザにCookie（クッキー）を設定したりこれを認識したりする場合があります。
          </Typography>

          <Typography variant="h3">アクセス解析ツールについて</Typography>

          <Typography>
            当サイトでは、Googleによるアクセス解析ツール「Googleアナリティクス」を利用しています。
            このGoogleアナリティクスはトラフィックデータの収集のためにCookieを使用しています。このトラフィックデータは匿名で収集されており、個人を特定するものではありません。この機能はCookieを無効にすることで収集を拒否することが出来ますので、お使いのブラウザの設定をご確認ください。この規約に関して、詳しくはここをクリックしてください。
          </Typography>

          <Typography variant="h3">免責事項</Typography>

          <Typography>
            当サイトで掲載している画像の著作権・肖像権等は各権利所有者に帰属致します。権利を侵害する目的ではございません。記事の内容や掲載画像等に問題がございましたら、各権利所有者様本人が直接メールでご連絡下さい。確認後、対応させて頂きます。
            当サイトからリンクやバナーなどによって他のサイトに移動された場合、移動先サイトで提供される情報、サービス等について一切の責任を負いません。
            当サイトのコンテンツ・情報につきまして、可能な限り正確な情報を掲載するよう努めておりますが、誤情報が入り込んだり、情報が古くなっていることもございます。
            当サイトに掲載された内容によって生じた損害等の一切の責任を負いかねますのでご了承ください。
          </Typography>
        </Paper>
      </Layout>
    )
  }
}

export default withRoot(withStyles(styles)(AboutPage))
