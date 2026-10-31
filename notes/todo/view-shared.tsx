import './folio.css';
import {useUi} from '@dsh-workbench/react';
import {ui} from './messages';
import { Button } from '@heroui/react/button';
import { CloseButton } from '@heroui/react/close-button';
import { Modal } from '@heroui/react/modal';
import React, { useState } from "react";
import "@heroui/styles/css";
import type { TodoImage, TodoPriority, TodoStatus } from "./actions";

export function normalizeStatus(item: { status?: string; completed?: boolean }): TodoStatus {
  if (item.status === "in_progress" || item.status === "blocking" || item.status === "blocked") {
    return item.status === "blocked" ? "blocking" : item.status;
  }
  if (item.status === "done" || item.status === "todo") return item.status;
  return item.completed ? "done" : "todo";
}

export const PRIORITY_CONFIG: Record<TodoPriority, { label: string; accent: boolean }> = {
  high: { get label() { return ui("紧急"); }, accent: true },
  medium: { get label() { return ui("重点"); }, accent: false },
  low: { get label() { return ui("常规"); }, accent: false },
};

// 四列统一中性观感：不使用彩色徽标，仅阻塞列带一支强调色圆点
export const COLUMNS: Array<{
  id: TodoStatus;
  title: string;
  tag: string;
  emphasized: boolean;
}> = [
  { id: "todo", get title() { return ui("待办"); }, tag: "TO DO", emphasized: false },
  { id: "in_progress", get title() { return ui("进行中"); }, tag: "DOING", emphasized: false },
  { id: "blocking", get title() { return ui("阻塞中"); }, tag: "BLOCKING", emphasized: true },
  { id: "done", get title() { return ui("已完成"); }, tag: "DONE", emphasized: false },
];

export function SvgCheckMark({ size = 11 }: { size?: number }) {
  useUi(ui);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function SvgSparkles({ size = 12 }: { size?: number }) {
  useUi(ui);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" />
    </svg>
  );
}

export function SvgTrash({ size = 12 }: { size?: number }) {
  useUi(ui);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

// The "all" filter is a sentinel, never a translated label that could equal or miss a category.
export const ALL_CATEGORIES = "";
export const MAX_PASTED_IMAGES = 3;
const MAX_PASTED_IMAGE_SOURCE_BYTES = 12 * 1024 * 1024;
const MAX_PASTED_IMAGE_DATA_URL_LENGTH = 600_000;
const MAX_PASTED_IMAGE_TOTAL_LENGTH = 900_000;
const PASTED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

function imageDataUrlSize(images: TodoImage[]): number {
  return images.reduce((total, image) => total + image.dataUrl.length, 0);
}

export function mergePastedImages(current: TodoImage[], additions: TodoImage[]): TodoImage[] {
  const next = [...current, ...additions];
  if (next.length > MAX_PASTED_IMAGES) throw new Error(ui("最多添加 {p0} 张图片", { p0: MAX_PASTED_IMAGES }));
  if (imageDataUrlSize(next) > MAX_PASTED_IMAGE_TOTAL_LENGTH) throw new Error(ui("图片附件总大小过大，请减少图片数量或换小图"));
  return next;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(ui("读取图片失败")));
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error(ui("读取图片失败")));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(ui("无法解析这张图片")));
    image.src = dataUrl;
  });
}

async function convertClipboardImage(file: File, index: number): Promise<TodoImage> {
  if (!PASTED_IMAGE_TYPES.has(file.type)) throw new Error(ui("仅支持 PNG、JPG、WebP 或 GIF 图片"));
  if (file.size > MAX_PASTED_IMAGE_SOURCE_BYTES) throw new Error(ui("图片文件过大，请先压缩后再粘贴"));

  const sourceUrl = await readFileAsDataUrl(file);
  const image = await loadImage(sourceUrl);
  const maxDimension = 1600;
  const sourceMax = Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height);
  const scale = sourceMax > maxDimension ? maxDimension / sourceMax : 1;
  const width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale));
  const height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale));

  // Small GIFs keep their original bytes so a pasted animation is not silently flattened.
  let dataUrl = file.type === "image/gif" && sourceUrl.length <= MAX_PASTED_IMAGE_DATA_URL_LENGTH
    ? sourceUrl
    : "";
  if (!dataUrl) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error(ui("当前环境无法处理图片"));
    context.drawImage(image, 0, 0, width, height);
    dataUrl = canvas.toDataURL("image/webp", 0.88);
    if (!dataUrl.startsWith("data:image/webp")) dataUrl = canvas.toDataURL("image/jpeg", 0.82);
    if (dataUrl.length > MAX_PASTED_IMAGE_DATA_URL_LENGTH) dataUrl = canvas.toDataURL("image/jpeg", 0.68);
  }
  if (dataUrl.length > MAX_PASTED_IMAGE_DATA_URL_LENGTH) throw new Error(ui("图片压缩后仍然过大，请换一张图片"));

  return {
    id: `image-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
    dataUrl,
    name: file.name || "clipboard-image",
    type: dataUrl.slice(5, dataUrl.indexOf(";")) as TodoImage["type"],
    width,
    height,
  };
}

export async function pasteClipboardImages(event: React.ClipboardEvent<HTMLElement>): Promise<TodoImage[]> {
  const files = Array.from(event.clipboardData.items)
    .filter((item) => PASTED_IMAGE_TYPES.has(item.type))
    .map((item) => item.getAsFile())
    .filter((file): file is File => file !== null);
  if (!files.length) return [];
  event.preventDefault();
  return Promise.all(files.slice(0, MAX_PASTED_IMAGES).map((file, index) => convertClipboardImage(file, index)));
}

export function ImageAttachments({
  images,
  onRemove,
  compact = false,
}: {
  images?: TodoImage[];
  onRemove?: (id: string) => void;
  compact?: boolean;
}) {
  useUi(ui);
  const [previewImage, setPreviewImage] = useState<TodoImage | null>(null);
  const validImages = (images ?? []).filter((image) => typeof image?.dataUrl === "string" && image.dataUrl.startsWith("data:image/"));
  if (!validImages.length) return null;
  return (
    <>
      <div className={`folio-image-strip ${compact ? "is-compact" : ""}`} aria-label={ui("{p0} 张图片", { p0: validImages.length })}>
        {validImages.map((image, index) => (
          <figure className="folio-image-thumb" key={image.id || `${image.dataUrl.slice(0, 24)}-${index}`}>
            <Button
              variant="ghost"
              className="folio-image-preview"
              aria-label={ui("放大预览：{p0}", { p0: image.name || ui("图片 {p0}", { p0: index + 1 }) })}
              aria-haspopup="dialog"
              onPress={() => setPreviewImage(image)}
            >
              <img src={image.dataUrl} alt="" loading="lazy" />
            </Button>
            {onRemove && <CloseButton className="folio-image-remove" aria-label={ui("移除图片 {p0}", { p0: index + 1 })} onPress={() => onRemove(image.id)} />}
          </figure>
        ))}
      </div>
      <Modal isOpen={Boolean(previewImage)} onOpenChange={(isOpen) => { if (!isOpen) setPreviewImage(null); }}>
        <Modal.Backdrop className="folio-image-modal-backdrop" variant="blur" onClick={(event) => event.stopPropagation()}>
          <Modal.Container className="folio-image-modal-container" placement="center" size="md">
            <Modal.Dialog
              aria-label={ui("图片预览")}
              className="folio-image-modal-dialog"
              style={{ width: "fit-content", maxWidth: "min(94vw, 1200px)", maxHeight: "94dvh", padding: "34px 10px 10px" }}
            >
              <Modal.CloseTrigger className="folio-image-modal-close" aria-label={ui("关闭图片预览")} />
              <Modal.Body className="folio-image-modal-body" style={{ display: "grid", placeItems: "center", padding: 0, maxWidth: "calc(94vw - 20px)", maxHeight: "calc(94dvh - 44px)" }}>
                {previewImage && (
                  <img
                    src={previewImage.dataUrl}
                    alt={previewImage.name || ui("图片预览")}
                    style={{ display: "block", width: "auto", height: "auto", maxWidth: "calc(94vw - 40px)", maxHeight: "calc(88dvh - 48px)", objectFit: "contain", borderRadius: 4 }}
                  />
                )}
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
