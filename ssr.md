# Midway + Vue3 + Vite 的全栈 SSR demo 工程

从头开始搭建一个基于 [Midway](https://www.midwayjs.org/docs/intro) 是 Node.js 后端框架和 [Vue3](https://cn.vuejs.org/guide/introduction.html) + [Vite](https://cn.vitejs.dev/) 的 SSR + CSR 全栈 demo 工程

## 合并 Midway 和 Vue 工程

先使用命令 `npm init midway` 初始化一个 Midway koa-v3 标准项目，项目根目录结构如下：

├── README.md
├── README.zh-CN.md
├── bootstrap.js
├── jest.config.js
├── package.json
├── src
├── test
└── tsconfig.json

前端代码我选择放在项目根目录下的 view 目录，在其中初始化一个 Vite 的 Vue3 项目

```bash
npm init vue@latest

# Project name 输入 view
# TypeScript yes
# JSX yes
# Vue Router yes
# Pinia yes
# ESLint yes
# Prettier yes
```

view 的根目录结构如下：

├── README.md
├── env.d.ts
├── index.html
├── package.json
├── public
├── src
├── tsconfig.config.json
├── tsconfig.json
└── vite.config.ts

将前端 package.json 的依赖和 scripts 命令按需移动到项目根目录 package.json，重复的 scripts 命令用 midway 和 view 区分前后端，前端一些命令指定 view 目录，合并后如下：

```json
{
  "dependencies": {
    "@midwayjs/bootstrap": "^3.0.0",
    "@midwayjs/core": "^3.0.0",
    "@midwayjs/decorator": "^3.0.0",
    "@midwayjs/info": "^3.0.0",
    "@midwayjs/koa": "^3.0.0",
    "@midwayjs/logger": "^2.14.0",
    "@midwayjs/validate": "^3.0.0",
    "pinia": "^2.0.21",
    "vue": "^3.2.38",
    "vue-router": "^4.1.5"
  },
  "devDependencies": {
    "@midwayjs/cli": "^1.2.90",
    "@midwayjs/mock": "^3.0.0",
    "@types/jest": "^26.0.10",
    "@types/koa": "^2.13.4",
    "@types/node": "14",
    "cross-env": "^6.0.0",
    "jest": "^26.4.0",
    "mwts": "^1.0.5",
    "ts-jest": "^26.2.0",
    "@rushstack/eslint-patch": "^1.1.4",
    "@vitejs/plugin-vue": "^3.0.3",
    "@vitejs/plugin-vue-jsx": "^2.0.1",
    "@vue/eslint-config-prettier": "^7.0.0",
    "@vue/eslint-config-typescript": "^11.0.0",
    "@vue/tsconfig": "^0.1.3",
    "eslint": "^8.22.0",
    "eslint-plugin-vue": "^9.3.0",
    "npm-run-all": "^4.1.5",
    "prettier": "^2.7.1",
    "typescript": "~4.7.4",
    "vite": "^3.0.9",
    "vue-tsc": "^0.40.7"
  },
  "scripts": {
    "start": "NODE_ENV=production node ./bootstrap.js",
    "dev": "cross-env NODE_ENV=local midway-bin dev --ts",
    "build:midway": "midway-bin build -c",
    "test": "midway-bin test --ts",
    "cov": "midway-bin cov --ts",
    "lint": "run-p lint:midway lint:view",
    "lint:midway": "mwts fix",
    "ci": "npm run cov",
    "dev:view": "vite -c view/vite.config.ts view",
    "preview:view": "vite preview --port 4173",
    "build:view": "run-p type-check build-only:view",
    "build-only:view": "vite -c view/vite.config.ts build view",
    "type-check": "vue-tsc -p view/tsconfig.json --noEmit",
    "lint:view": "eslint view -c ./view/.eslintrc.cjs --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix"
  },
}
```

view 目录删除 README.md、.gitignore 等无用文件。vite.config.ts 增加 build.outDir 配置 '../public'，让前端编译的代码在项目根目录下的 public

分别修改项目根目录的 tsconfig.json、.eslintrc.json，排除 view 目录前端代码
