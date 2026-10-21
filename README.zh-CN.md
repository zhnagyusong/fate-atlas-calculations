# Fate Atlas Calculations · 观星集计算模块

用于文化研究与软件核对的 JavaScript 计算模块：**北派河洛紫微四化关系、皇极元会运世、邵子神数规则试算、吠陀占星基础几何计算**。保留计算过程、规则版本和未完成项。

[English](README.md) · [观星集](https://fateatlas.net) · [皇极在线试算](https://fateatlas.net/huangji?utm_source=github&utm_medium=referral&utm_campaign=calculations) · [吠陀在线排盘](https://fateatlas.net/vedic?utm_source=github&utm_medium=referral&utm_campaign=calculations)

## 下载后即可运行

需要 Node.js 22 或更新版本。依赖已随代码保留，**不需要安装包、不需要 API 密钥，计算时不联网**。

```sh
git clone https://github.com/zhnagyusong/fate-atlas-calculations.git
cd fate-atlas-calculations
npm run verify
npm test
npm run example
```

目前没有发布 npm 包，请使用本地代码导入。合成示例位于 `examples/quickstart.mjs`。

## 能算什么？

| 方法 | 已实现 | 边界 |
|---|---|---|
| 北派紫微 | 生年四化、来因宫、宫干飞化、向离心自化与分象 | 安星仍为iztro 2.6.1；仅实现本命结构，不自动断事 |
| 皇极时间尺度 | 积年分解、指定纪元映射、反向合成、大整数边界核对 | 不默认纪元，不从时间尺度直接推出个人命卦 |
| 邵子试算 | 四柱取数、天地数、本命卦草案、刻分、互错综卦、指定动爻变卦、出生时间误差采样 | 用户选定规则尚未全面溯源；元堂、后天命卦与正本条文未实现 |
| 吠陀基础盘 | 七曜、平均罗睺与计都、上升、整宫 D1、27 月宿及分足、D9 位置、逆行与 tithi | 使用明确标识的 Lahiri 近似岁差；不计算大运、合盘和预测 |

邵子采用 `shaozi-selected-rules-v2` 和 `shaozi-workflow-v3`。未定义的余数保留未解决状态，不猜测补卦；用户指定动爻得到的变卦不冒充元堂或后天命卦。

吠陀采用 `vedic-geometry-v1`：输入当地钟表时间和实际历史时区，不先换真太阳时。1990 年夏季的上海合成样例使用 UTC+9；不是所有中国出生日期都直接使用 UTC+8。默认岁差是 Lahiri 基准近似模型，**不等同于精确 Swiss Ephemeris Lahiri**。

## 依据和核对

- [API 与输入约定](docs/api.md)
- [皇极层级与邵子试算规则](docs/huangji-shaozi.md)
- [历史时区、夏令时与换日](docs/time-zones.md)
- [月宿、分足与 D9 的计算](docs/vedic-model.md)
- [独立样例与测试限制](docs/validation.md)
- [常见问题](docs/faq.md)

九组独立星历参考样例用于回归核对，不代表全日期范围的精度保证。靠近星座、月宿和分足交界时应复核；天文学位置的数值核对也不等于验证命理解释。

## 隐私、许可与网站

本库不上传、不保存出生资料，没有账号、支付、AI 或付费权限。项目只导出列明的计算文件，不包含网站后台、密钥、账号数据和原网站 Git 历史。网站是独立产品；开源库的 MIT 许可不包含品牌授权。

原创代码采用 MIT，第三方依赖版权和许可完整保留。来源见 [第三方说明](THIRD_PARTY_NOTICES.md)。提交问题请使用合成输入、版本号与可核对来源，不公开真实个人出生资料。贡献方式见 [CONTRIBUTING](CONTRIBUTING.md)。

## 北派算法资料

[原创规则摘要与书目](docs/sources/north-ziwei.md)和[来源索引](docs/sources/north-ziwei-index.json)记录本次11份资料及选页核对范围。代码单独标记安盘层与北派关系层；不将单星提示直接当作人格或命运结论。原PDF、Word、扫描页、OCR全文、命例出生资料与广告不分发，原资料版权不由MIT许可覆盖。
