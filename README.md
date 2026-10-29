# MagicLore · 星藏

独立的移动端 PWA。暖纸白与灰绿视觉，手机优先；电脑端保持 460px 居中布局。保留生命灵数、关系合盘、八字、西洋占星、印度占星及各自已有专业功能。

## 运行

可直接双击 `index.html` 进行本地文件预览；请保留完整文件夹，包括生成的 `app.file.js`、`module-mobile.file.js`、`civil-offset.file.js`。此模式不启用 PWA。不同浏览器可能隔离 file:// 各页面的档案存储，不建议在此模式长期保存唯一一份资料。

Windows 推荐双击 **Start-MagicLore.cmd**：自动启动/复用本机预览并打开浏览器，需要桌面安装 Python 3。也可运行 `python tools/serve_preview.py --port 8897` 后打开 http://127.0.0.1:8897/index.html 。已有构建产物，预览不需要安装 Node 开发依赖。

**当前处于开发阶段，不生成发布 ZIP。** HTML、JavaScript、地点库和 vendor 都是静态资源，排盘在浏览器端计算；未来部署静态 HTTPS 站点及在 iPhone 运行均不需要 Python。

## 继续开发

开发依赖使用 `pnpm install --frozen-lockfile`。执行 `pnpm test` 运行全部测试。八字构建用 `pnpm run build:bazi`，出生时区转换用 `pnpm run build:mobile-time`；已有印占正式入口构建为 `pnpm run build:vedic:classic`，西洋为 `pnpm run build:western`。

修改源码后运行对应构建，再执行 `pnpm run build:pwa` 同步双击兼容产物与 PWA 资源哈希。该命令不生成 ZIP。修改运行资源时同步更新 `sw.js` 的 `VERSION`，避免已有预览页面长期使用旧缓存。静态运行不依赖 `node_modules/`、`src/`、`tests/`、`tools/` 或 `maintenance/`；但继续开发需要保留源码、锁文件和测试基准。

在 Safari 中打开，分享 → 添加到主屏幕。用户档案与程序缓存分离；首页“档案”支持出生资料编辑、各体系旧档案查看、全量导出和合并导入，“我的”提供修改前快照恢复。档案只在当前站点、当前设备保存，不会跨域自动迁移，请定期导出备份。

“档案”搜索框下方支持横滑分组筛选，默认“全部”；末尾“＋”新建分组，选中分组后点“⋯”可在原页改名、删除或左右调整顺序，也可长按组名拖动。档案行右侧可移动分组，拖动手柄调整组内顺序；组内顺序与“全部”顺序分别保留。删除分组仅将档案归入未分组。分组、归属及排序随 v2 备份一起导出／导入；导入旧备份保留本地分组，合并时保留已有本地归属并正确映射冲突另存的人物 ID。

原 ZIP、空 `release/` 目录和打包脚本已移除。不要直接编辑 `bazi_app.js`、占星应用包、`civil-offset.js` 与 `.file.js` 等生成产物；应修改其源码后重建。

完整审计、数据结构、验收和待真机项目见 [MOBILE_REDESIGN.md](MOBILE_REDESIGN.md)。一次性移植脚本与旧主题资源已清理，明细见 [CLEANUP_AUDIT.md](CLEANUP_AUDIT.md)。八字仍保持 Beta / 待人工验盘状态。

双击兼容与子路径验收见 [FILE_PREVIEW.md](FILE_PREVIEW.md)。`pnpm run build:pwa` 会先从相同源码重建双击兼容包，再生成资源清单；不要直接编辑生成的 `.file.js`。

深入移植遗留审计、保留边界和本轮验收见 [DEEP_CLEANUP_AUDIT.md](DEEP_CLEANUP_AUDIT.md)。`build:vedic` 是开发核对页入口，当前正式印占 UI 使用 `build:vedic:classic`。

八字统一判断引擎包含格局、旺衰、从格、季节调候、干支作用与四主题岁运趋势。规则参数、经典结构回归和未评分边界见 [BAZI_ACCURACY.md](BAZI_ACCURACY.md#统一判断引擎-v22026-10-28)；趋势分是可复算的软件规则指标，尚未校准为事件概率。

2026-10-29 加载优化：入口在解析 HTML 时预加载，在 DOM 初始化后执行；公共页面不再等待所有图片与背景资源完成。八字基础页只生成命盘与当前点击解读，参考页首次打开才生成完整趋势报告，同一出生资料切换大运／流年复用现有计算结果。地点库在打开参数／重置盘或编辑地点时加载，单次请求共享，失败可手填坐标或重试；延迟加载保留已有出生、坐标和现居资料。档案时区校验及时间解析复用最多 128 个格式器，不缓存人物数据或某个出生日期的 UTC 结果。

独立浏览器测量（390×844、CPU 4 倍降速、100ms 延迟、750000 字节／秒下载、禁用 HTTP 缓存和 Service Worker，采用本地未压缩预览）中，初始化完成约为：八字 7.04→3.91 秒，西洋 2.29→1.76 秒，印占 2.15→1.65 秒，灵数 1.10→1.01 秒，首页 0.82→0.66 秒。档案、笔记、设置约 0.55—0.65 秒，单次小差异属于波动，不宣称每页均有显著提升。这是模拟环境的冷启动比较，不是真机或线上耗时保证。HTTP 与 file:// 已验证基础页不提前评分、参考页四主题曲线、出生资料变更、地点加载失败重试和现居资料保留；本地证据为 `maintenance/page-performance-before.json`、`maintenance/page-performance-after.json`、`maintenance/loading-behavior-http.json`、`maintenance/loading-behavior-file.json`。

`pnpm test` 与 `pnpm run test:bazi` 会在单元测试后执行八字覆盖矩阵；也可单独运行 `pnpm run test:bazi:coverage`。矩阵覆盖 1960—2019 年、十二个月、双性别、四个地区及真太阳／民用时，并将实际遇到的日主与旺衰组合逐一测试六十甲子阶段，另含从格、专旺、化气结构反例。每个分数验证贡献复算与解读一致性，每个空值记录原因。若出现基准以外的未评分点或专题有效率下降，命令失败，明细写入本地 `maintenance/bazi-matrix.json`。不能通过盲目刷新 `tests/fixtures/bazi-matrix-baseline.json` 绕过失败；先核对实际作用和规则变更。已知未覆盖与争议项保留在报告中，基准通过不表示所有命盘均可可靠评分。
