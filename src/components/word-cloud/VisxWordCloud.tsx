"use client";

import React from "react";
import { Wordcloud } from "@visx/wordcloud";
import { scaleLog, scaleOrdinal } from "d3-scale";
import { schemeCategory10 } from "d3-scale-chromatic";

export interface WordCloudWord {
  text: string;
  value: number;
}

interface Props {
  words: WordCloudWord[];
  width?: number;
  height?: number;
}

export default function WordCloud({ words, width = 600, height = 400 }: Props) {
  // color scale is a function that maps a string input to a color string
  const colorScale = scaleOrdinal<string, string>(schemeCategory10);

  // font scale for word size
  const fontScale = scaleLog()
    .domain([
      Math.max(1, Math.min(...words.map((w) => w.value))),
      Math.max(...words.map((w) => w.value)),
    ])
    .range([10, 80]);

  return (
    <div className="flex justify-center items-center">
      <svg width={width} height={height}>
        <Wordcloud<WordCloudWord>
          words={words}
          width={width}
          height={height}
          font="Impact"
          spiral="archimedean"
          fontSize={(w) => fontScale(w.value)}
          rotate={() => 0}
          padding={4}
        >
          {(cloudWords) =>
            cloudWords.map((w:any, i) => (
              <text
                key={i}
                transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
                textAnchor="middle"
                fontSize={w.size}
                fill={colorScale(w.text)} // color from scale using text
              >
                {w.text ?? ""}
              </text>
            ))
          }
        </Wordcloud>
      </svg>
    </div>
  );
}
