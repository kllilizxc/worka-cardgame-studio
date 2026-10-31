import {defineMessages, getLocale, selectMessages} from '@dsh-workbench/runtime';
import {cloneElement, isValidElement, type ReactNode} from 'react';

/** Only authored interface copy. Persisted content keeps its original language. */
export const english = {
  "Mermaid 图表": "Mermaid diagram",
  "图表暂时无法渲染，请检查 Mermaid 语法或继续加载完整代码块。": "Could not render the diagram. Check the Mermaid syntax or load the complete code block.",
  "错误详情": "Error details",
  "正在准备图表…": "Preparing diagram…",
  "图表源码": "Diagram source",
  "知识库": "Knowledge",
  "知识与规范 · 本机原文": "Knowledge and guidelines · Local source",
  "添加你的第一份资料": "Add your first reference",
  "登记本机文档或资料目录，直接阅读原文。": "Register a local document or reference folder to read its source directly.",
  "添加资料": "Add reference",
  "+ 添加资料": "+ Add reference",
  "共 {p0} 份资料，还有 {p1} 份": "{p0} references · {p1} more",
  "{p0} 份资料": "{p0} references",
  "展开阅读 ↗": "Expand to read ↗",
  "资料入口": "Reference",
  "添加本机资料": "Add local reference",
  "支持 Markdown、JSON、文本，或包含 index.md / README.md 的资料目录。原文件保持在本机。": "Supports Markdown, JSON, text, or folders containing index.md / README.md. Original files stay on this computer.",
  "文件或目录路径": "File or folder path",
  "填写绝对路径": "Enter an absolute path",
  "显示名称（可选）": "Display name (optional)",
  "默认使用文件或目录名": "Uses the file or folder name by default",
  "正在检查资料…": "Checking reference…",
  "检查并添加": "Check and add",
  "查看已添加资料": "View the added reference",
  "取消": "Cancel",
  "← 返回": "← Back",
  "读取本机资料": "Read local reference",
  "重新读取": "Reload",
  "正在读取…": "Loading…",
  "继续阅读 · 已读 {p0} / {p1} 行": "Continue reading · {p0} / {p1} lines read",
  "本机原文 · 自动同步 · 版本 {p0}": "Local source · Auto sync · Version {p0}",
  "原文图片": "Original image"
};
const chinese = Object.fromEntries(Object.keys(english).map(key => [key,key])) as {[K in keyof typeof english]: string};
export const messages = defineMessages('zh-CN', chinese, {en: english});
export function ui(key: keyof typeof english, values: Record<string,string|number|undefined> = {}) {
  return selectMessages(messages, getLocale())[key].replace(/\{(p\d+)\}/g, (_, name) => String(values[name] ?? ''));
}
ui.rich = (key: keyof typeof english, values: Record<string,ReactNode> = {}) => selectMessages(messages,getLocale())[key].split(/(\{p\d+\})/g).map((part,index) => { if (!/^\{p\d+\}$/.test(part)) return part; const value = values[part.slice(1,-1)]; return isValidElement(value) ? cloneElement(value,{key:index}) : value; });
