import fs from 'node:fs'
import { resolve } from 'path'
import pkg from './package.json'
import { defineConfig } from 'vite'
import { builtinModules } from 'node:module'

/**
 * 初始化一下package.json
 */
pkg.name = '@karinjs/moment'
// @ts-ignore
pkg.files = ['dist', 'moment.d.ts']
// @ts-ignore
delete pkg.typesVersions
// @ts-ignore
delete pkg['jsnext:main']

fs.rmSync('moment.js', { force: true })
fs.rmSync('locale', { force: true })

fs.writeFileSync(
  resolve(__dirname, 'package.json'),
  JSON.stringify(pkg, null, 2),
  'utf-8'
)

export default defineConfig({
  build: {
    target: 'es2022',
    lib: {
      formats: ['es'],
      fileName: (format, entryName) => {
        // 如果是moment主文件，直接放在dist目录下
        if (entryName === 'moment') {
          return `${entryName}.js`
        }
        // 否则为语言包，放在locale目录下
        return `locale/${entryName}.js`
      },
      entry: [
        resolve(__dirname, 'src/moment.js'),
        // 读取src/locale文件夹下的所有js 这里的文件是moment的语言包
        ...fs
          .readdirSync(resolve(__dirname, 'src/locale'))
          .filter((file) => file.endsWith('.js'))
          .map((file) => resolve(__dirname, 'src/locale', file)),
      ],
    },
    outDir: 'dist',
    rollupOptions: {
      external: [
        ...builtinModules,
        ...builtinModules.map((mod) => `node:${mod}`),
      ],
    },
    minify: 'terser'
  }
})
