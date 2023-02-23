import { describe, expect, it } from 'vitest'
import type { Collector } from '../../src/types'
import type { TransformVueOptions } from '../../src/transform/transformVue'
import transformVue from '../../src/transform/transformVue'

const genTransOptions = (collector: Collector): TransformVueOptions => {
  return {
    rule: {
      transCaller: '',
      transIdentifier: 't',
      variableDeclaration: 'const t = useI18n()',
      importDeclaration: 'import { useI18n } from \'vue-i18n\'',
    },
    replace: true,
    collector,
  }
}

describe('#transformVue', () => {
  it('should transform vue', async () => {
    const words: string[] = []
    const reslut = transformVue(
    `<template>
      <div>这是{{title}}</div>
    </template>
    <script setup>
      let title = "标题"
    </script>
    `,
    genTransOptions(
      {
        add(str) {
          words.push(str)
        },
        getKey(str: string) {
          return `Key of ${str}`
        },
      }),
    )
    expect(words).toEqual(['这是', '标题'])
    expect(reslut.code).toMatchSnapshot()
  })

  it('should transform attributes in vue template', async () => {
    const words: string[] = []
    const reslut = transformVue(
    `<template>
      <div>这{{title}}</div>
      <comp v-if="'吃'"> 这是 {{ "什么东西啊" }}</comp>
      <comp @click="()=>{a=t('我啊')}" :title="'好呢'"/>
      <!--auto-i18n-ignore-->
      <comp>忽略</comp>
    </template>
    <script setup>
      let title = "标题"
    </script>
    `,
    genTransOptions(
      {
        add(str) {
          words.push(str)
        },
        getKey(str: string) {
          return `Key of ${str}`
        },
      }),
    )
    expect(words.sort()).toEqual([
      '吃',
      '好呢',
      '标题',
      '这是',
      '这',
    ].sort())
    expect(reslut.code).toMatchSnapshot()
  })
})
