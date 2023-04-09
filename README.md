## pnavi

做了一个自用的导航页，技术栈是 Vite + React + TypeScript + Less

搜索窗口自己摸索了一下，工具箱照搬 Google 的 CSS

整理一下开源出来，算是给前端之旅划上一个句号

#### 特性

1. 隐私安全，数据100%本地存储，导入导出方便
2. 100%无广告，可以自己部署
3. 自定义程度高，可以自行 增删改 工具箱和搜索窗口的项
4. 按照 LRU 排序
5. 可配置初始的默认项

#### 示例

[示例网站](https://sora-blue.github.io)

![截图](https://i.ibb.co/Kz9zPms/image.png)


#### 静态部署 (以 Github Pages 为例)
0. 安装依赖
1. 构建静态文件
```shell
git clone https://github.com/sora-blue/pnavi
cd pnavi
npm i && npm run build
```
2. 新建Github公开库，库名为`你的Github用户名.github.io`，[详见](https://pages.github.com/)
3. 将`dist`目录下的文件都上传到这个库里
#### 动态部署 (以 ubuntu 22.04 为例，开发环境热更新，加载较慢，默认端口 80)
0. 购买服务器，建议最低配置1核2G
1. 安装 `nodejs` `npm`
```shell
curl -fsSL https://deb.nodesource.com/setup_19.x | sudo -E bash - &&\
sudo apt-get install -y nodejs
sudo npm config set registry https://registry.npm.taobao.org
```
2. 运行
```shell
git clone https://github.com/sora-blue/pnavi
cd pnavi
npm i && npm run devhost
```
