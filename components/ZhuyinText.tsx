import type { ElementType, ReactNode } from "react";
import { segmentWithZhuyin } from "@/lib/zhuyin";

interface ZhuyinTextProps {
  children: string;
  className?: string;
  as?: ElementType;
}

export function ZhuyinText({ children, className, as: Tag = "span" }: ZhuyinTextProps) {
  const segments = segmentWithZhuyin(children);

  return (
    <Tag className={className}>
      {segments.map((segment, index) =>
        segment.type === "ruby" ? (
          <ruby key={`${index}-${segment.char}`} className="zhuyin-ruby">
            {segment.char}
            {segment.zhuyin ? <rt>{segment.zhuyin}</rt> : null}
          </ruby>
        ) : (
          <span key={`${index}-plain`}>{segment.text}</span>
        )
      )}
    </Tag>
  );
}

export function withZhuyin(children: ReactNode): ReactNode {
  if (typeof children === "string") {
    return <ZhuyinText>{children}</ZhuyinText>;
  }

  if (Array.isArray(children)) {
    return children.map((child, index) =>
      typeof child === "string" ? <ZhuyinText key={index}>{child}</ZhuyinText> : child
    );
  }

  return children;
}
