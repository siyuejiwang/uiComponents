import { useRef, useEffect } from "react";
import { DataItem } from "./dto";
const data: DataItem[] = [
  { name: "A", value: 50, color: "" },
  { name: "B", value: 120, color: "" },
  { name: "C", value: 90, color: "" },
  { name: "D", value: 180, color: "" },
  { name: "E", value: 150, color: "" },
];
export default function Chart() {
  const canvasRef = useRef<HTMLCanvasElement>();
  // 设置间距、宽度
  const barWidth = 30;
  const xAxisSpace = 50;
  const yAxisSpace = 30;

  // 柱状图颜色
  const defaultColor = "#4285F4";
  const hoverColor = "red";
  function drawBars(ctx, gap, canvas) {
    ctx.clearRect(0, yAxisSpace, canvas.width, canvas.height - xAxisSpace);

    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      d.color = d.color || defaultColor;
      d.x = gap + i * (barWidth + 2 * gap) - ((d.width || barWidth) - barWidth) / 2;
      d.y = canvas.height - d.value - xAxisSpace;
      d.width = d.width || barWidth;
      d.height = d.value;

      ctx.fillStyle = d.color;
      ctx.fillRect(d.x, d.y, d.width, d.height);
    }
  }

  function drawAxis(ctx, gap, canvas) {
    // 绘制 x 轴
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - xAxisSpace);
    ctx.lineTo(canvas.width, canvas.height - xAxisSpace);
    ctx.stroke();

    // 绘制 y 轴
    ctx.beginPath();
    ctx.moveTo(yAxisSpace, 0);
    ctx.lineTo(yAxisSpace, canvas.height);
    ctx.stroke();

    // 在 x 轴上绘制标签
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    data.forEach((d, i) => {
      const x = gap + i * (barWidth + 2 * gap) + barWidth / 2;
      const y = canvas.height - xAxisSpace;
      ctx.fillText(d.name, x, y);
    });
  }
  function excuteAnimationFrame(ctx, gap, canvas) {
    for (const d of data) {
      if (d.hoverAnimate) {
        if (d.width < 60) {
          d.width += 3;
        } else {
          d.hoverAnimate = false;
        }
      }
      if (d.width > 30 && !d.hover) {
        d.outAnimate = true;
      }
      if (d.outAnimate) {
        if (d.width > 30) {
          d.width -= 3;
        } else {
          d.outAnimate = false;
        }
      }
    }
    const hasAnimate = data.find(item => item.hoverAnimate || item.outAnimate);
    if (hasAnimate) {
      drawBars(ctx, gap, canvas);
      requestAnimationFrame(() => {
        excuteAnimationFrame(ctx, gap, canvas)
      })
    }
  }
  function addEvents(ctx, gap, canvas) {
    canvas.addEventListener(
      "mousemove",
      function (event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        for (const d of data) {
          if (x > d.x && x < d.x + d.width && y > d.y && y < d.y + d.height) {
            if (!d.hoverAnimate) {
              d.color = hoverColor;
              d.hoverAnimate = true;
            }
            d.hover = true;
          } else {
            if (!d.hoverAnimate) {
              d.color = defaultColor;
            }
            d.hover = false;
          }
        }
        excuteAnimationFrame(ctx, gap, canvas);
      },
      false
    );
  }
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const gap = (canvas.width / data.length - barWidth) / 2;
    drawBars(ctx, gap, canvas);
    drawAxis(ctx, gap, canvas);

    addEvents(ctx, gap, canvas);
  }, []);
  return <canvas ref={canvasRef} width="600" height="400"></canvas>;
}
