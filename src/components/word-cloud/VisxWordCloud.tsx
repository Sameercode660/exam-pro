"use client";

import React from "react";
import { Wordcloud } from "@visx/wordcloud";
import { scaleLog } from "d3-scale";

export interface WordCloudWord {
  text: string;
  value: number;
}

interface VisxWordCloudProps {
  words: WordCloudWord[];
}

export default function VisxWordCloud({ words }: VisxWordCloudProps) {
  const fontScale = scaleLog()
    .domain([
      Math.min(...words.map((w) => w.value)),
      Math.max(...words.map((w) => w.value)),
    ])
    .range([10, 60]);

  return (
    <svg width={500} height={300}>
      <Wordcloud
        words={words}
        fontScale={fontScale}
        font="Arial"
        spiral="archimedean"
        rotate={() => 0}
        padding={5}
      >
        {(cloudWords) =>
          cloudWords.map((word, i) => (
            <text
              key={i}
              fontSize={word.size}
              textAnchor="middle"
              transform={`translate(${word.x}, ${word.y}) rotate(${word.rotate})`}
              fill="#1e40af"
              fontWeight="bold"
            >
              {word.text}
            </text>
          ))
        }
      </Wordcloud>
    </svg>
  );
}
