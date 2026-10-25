# MagicLore 移植遗留文件清理

> 本文为第一轮历史记录。当前开发状态以 `DEEP_CLEANUP_AUDIT.md` 为准；ZIP、打包工具及本轮进一步确认的旧导航/主题内容已移除。

审计日期：2026-10-24。未执行 Git 操作、未新增依赖、未修改排盘规则或档案存储格式。

## 范围与依据

从 `index.html`、八字、灵数、西洋与印度占星入口检查 HTML 引用、CSS URL、ES 模块导入、运行时注入、经典脚本兼容包、构建入口、测试依赖、Service Worker 和发布清单。没有仅凭文件名或文本搜索无命中就删除资源。

动态链路继续保留：`entry-loader.js` 选择模块/双击兼容入口；`birth-offset-loader.js` 按需载入时区计算；`vedic_formal_boot.js` 注入天文库、正式印占包和六份专业样式。地点 JS 提供浏览器数据，JSON 提供测试基准；档案存储、备份、恢复与导入逻辑均未改动。

## 已删除（26 个文件）

| 文件 | 原因 |
| --- | --- |
| `destiny_web.html` | 未被现有入口或运行代码引用的旧灵数页面；当前完整功能在 `destiny_book_web.html` |
| `aligned_date_picker.js` | 原生日期/时间控件替换后已无加载入口 |
| `tiangong_embed.js`、`tiangong_embed.css` | 旧项目 iframe 主题桥接；当前无页面加载 |
| `图片/已批准/` 下 `baihu_brocade_tile_master_v01.png`、`qinglong_brocade_tile_master_v01.png`、`xuanwu_brocade_tile_master_v01.png`、`zhuque_brocade_tile_master_v01.png` | 仅由上述废弃主题 CSS 引用，合计约 13.55 MiB |
| `world_switch.js`、`world_switch.css` | 旧东西玄世界切换脚本已停用，CSS 仅服务于该组件；同步删除三个页面的 CSS 引用 |
| `web_theme_dots.js` | 停用的旧主题圆点注入脚本，无加载入口 |
| `COPY_MANIFEST.json`、`VALIDATION.json` | 首次复制清单及过时的未完成浏览器验证记录；现有资源清单和本次报告取代其用途 |
| `tools/mobile_migrate.py`、`finish_mobile.py`、`polish_mobile.py`、`native_inputs.py`、`stable_archive_links.py`、`reconcile_bazi_ui.py` | 一次性迁移/替换脚本，改动已落入当前源码，不属于构建链；重复执行可能覆盖后续工作 |
| `maintenance/bazi-before-mobile.js` | 旧八字完整构建备份；缺失的 UI 接入已回补到当前源码，正常构建不依赖该备份 |
| `maintenance/baseline-tests.txt`、`final-tests.txt`、`storage-tests.txt`、`file-preview-tests.txt` | 被本次完整测试日志取代的重复运行输出 |
| `tools/__pycache__/launch_preview.cpython-314.pyc`、`serve_preview.cpython-314.pyc` | Python 自动生成缓存，源文件保留 |

逐文件原大小和 SHA-256 见 `maintenance/cleanup-audit.json`。已移除空图片目录和空 Python 缓存目录。

## 保留项

- `library_home.*`、`library_layout.js`：仍注入体系导航、档案、行运等业务界面。
- `library_themes.css`、`numerology_light_themes.css`、`web_theme_dots.css`、页面内嵌旧样式：仍被加载；其中圆点样式首行还负责隐藏旧主题控件。无法在本轮低风险确认每条选择器都无效，因此保留，不进行大规模 CSS 重构。
- 印占六份动态专业样式、天文 vendor、八字/占星构建产物及 `.file.js`：运行或双击预览需要；不可视作重复文件删除。
- `china_places.json`：约 434 KiB，与 JS 数据重复，但 `tests/western/chinaPlaces.test.js` 明确依赖它验证行政区及坐标；不加入 PWA 运行资源。
- `src/vedic/ui/vedicVerifyApp.js` 和 `build:vedic`：独立开发核对入口，正式产品使用 `build:vedic:classic`；保留验证用途。
- 全部业务测试、参考案例、算法哈希、构建源码与锁文件：仍有验证或重建作用。
- `node_modules/`：约 67.92 MiB 的本机开发依赖，不属于发布包；保留以继续离线构建及运行测试。

## 发布与缓存

重建双击兼容产物、`asset-manifest.json` 和 `release/MagicLore-pwa.zip`。SW 版本提升至 `20261024-12`；更新时仅迁移仍在新清单内的旧资源，清除旧程序缓存，不触碰 localStorage 档案。更新失败保留旧版本的机制未改变。

静态发布清单含 62 个资源，发布包不包含图片、源码、开发依赖、测试或维护记录。全部发布 HTML/CSS 静态资源引用、JS 显式本地导入/注入路径均检查存在；动态入口另经浏览器运行检查。

## 验证

- `node --test tests/bazi/*.test.js tests/vedic/*.test.js tests/western/*.test.js tests/mobile/*.test.js`：253 通过，0 失败。日志：`maintenance/cleanup-tests.txt`。
- 八字核心计算、时间、节气、规则、基础数据与既有保护哈希逐字节一致。回归通过不等于所有传统规则已完成专业人工验盘，原 Beta 状态保留。
- 独立测试地址 `http://127.0.0.1:8902/MagicLore/`，使用新端口避免旧站点缓存和用户档案掩盖问题；未清空原站点数据。
- 首页进入八字，地点选择器展开显示完整省级列表；默认命例实际生成四柱、大运和解读：男，2000-01-01 05:30，武汉，真太阳时开启，得到己卯 / 丙子 / 戊午 / 乙卯。保存后统一档案显示相同结果。
- 档案实际导出为 JSON，再通过文件选择器导入同一备份，显示“备份已合并，相同条目自动去重”；刷新后档案仍存在。
- 生命灵数实际生成 2000-01-01 报告：生命路径 4、生日数 1、态度数 2；人生周期、个人流年、数字图鉴均展示。
- 西洋本命盘实际生成，显示四轴、行星/宫位/相位折叠入口与解读；印度占星正式动态模块成功显示本命报告及达莎。
- 浏览器验收期间检查到的错误日志为空。截图：`maintenance/cleanup-bazi.png`、`maintenance/cleanup-numerology.png`。
- 62 个清单资源加 SW 和清单本身，合计 64 个 HTTP 子路径请求全部 200；明细：`maintenance/cleanup-http.json`。
- 发布清单哈希与 ZIP 打包校验通过。SW 更新失败回退、缓存隔离等现有自动测试通过。

尚未实测：真实 GitHub Pages HTTPS 发布、iPhone Safari/主屏幕安装、真实设备离线与跨版本升级、所有专业子功能的完整手工遍历。本轮没有重新声明这些项目已通过。`file://` 完整交互受当前浏览器工具限制，未实测；兼容入口自动测试通过。

## 体积口径

项目工作文件统计排除 `.git/` 与 `node_modules/`，包含发布 ZIP、源码、测试和审计产物。清理前 215 文件、22,427,664 字节；删除文件合计 16,180,944 字节。最终净体积另计本次新增报告、日志和截图，详见 `maintenance/cleanup-audit.json` 的 `after` 字段。

发布 ZIP：766,372 → 750,771 字节，减少 15,601 字节（约 2.04%）。旧大型背景图原本已不在发布包，因此工作目录降幅远大于发布包降幅；这次不会让首页首屏少下载 15 MiB。首页加载策略与计算模块保持原样。
