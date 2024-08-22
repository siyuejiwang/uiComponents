import { useRef, useEffect } from "react";
import { DataItem } from "./dto";
import Chart from "./drawChart";
const data: DataItem[] = [
  { name: "A", value: 50, color: "" },
  { name: "B", value: 120, color: "" },
  { name: "C", value: 90, color: "" },
  { name: "D", value: 180, color: "" },
  { name: "E", value: 150, color: "" },
];
export default function NewChart() {
  const canvasRef = useRef<HTMLCanvasElement>();
  useEffect(() => {
    const chart = new Chart({
      element: canvasRef.current,
      data: data,
      barWidth: 30,
      xAxisSpace: 50,
      yAxisSpace: 30
    });
    chart.zhuzi.on("mouseover", (index) => {
      chart.zhuzi.eq(index).animate({ width: 45, duration: 100 });
    });
    chart.zhuzi.on("mouseout", (index) => {
      chart.zhuzi.eq(index).animate({ width: 30, duration: 100 });
    });
  }, []);
  return <canvas ref={canvasRef} width="600" height="400"></canvas>;
}
