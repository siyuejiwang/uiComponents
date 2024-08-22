export default class Chart {
  private ctx;
  private barWidth;
  private gap;
  private data;
  private xAxisSpace;
  private yAxisSpace;
  private canvas;
  public zhuzi;
  constructor(config) {
    const { element, data, barWidth, xAxisSpace, yAxisSpace } = config;
    const canvas = (this.canvas = element);
    this.ctx = canvas.getContext("2d");
    this.data = data;
    this.barWidth = barWidth;
    this.gap = (canvas.width / data.length - barWidth) / 2;
    this.yAxisSpace = yAxisSpace;
    this.xAxisSpace = xAxisSpace;
    this.drawBars();
    this.drawAxis();
    this.addEvents();
  }
  drawAxis() {
    const ctx = this.ctx;
    const canvas = this.canvas;
    const gap = this.gap;
    // 绘制 x 轴
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - this.xAxisSpace);
    ctx.lineTo(canvas.width, canvas.height - this.xAxisSpace);
    ctx.stroke();

    // 绘制 y 轴
    ctx.beginPath();
    ctx.moveTo(this.yAxisSpace, 0);
    ctx.lineTo(this.yAxisSpace, canvas.height);
    ctx.stroke();

    // 在 x 轴上绘制标签
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    this.data.forEach((d, i) => {
      const x = gap + i * (this.barWidth + 2 * gap) + this.barWidth / 2;
      const y = canvas.height - this.xAxisSpace;
      ctx.fillText(d.name, x, y);
    });

    // 在 y 轴上绘制标签
    ctx.textAlign = "right";
    ctx.textBaseline = "center";
    const verticalGap = (canvas.height - this.xAxisSpace) / 5;
    for (let i = 1; i < 5; i++) {
      const x = this.yAxisSpace - 5;
      const y = i * verticalGap;
      ctx.fillText((5 - i) * verticalGap, x, y);
    }
  }
  drawBars() {
    const canvas = this.canvas;
    const ctx = this.ctx;
    const gap = this.gap;
    ctx.clearRect(
      0,
      this.yAxisSpace,
      canvas.width,
      canvas.height - this.xAxisSpace
    );

    for (let i = 0; i < this.data.length; i++) {
      const d = this.data[i];
      d.color = d.color || "#4285F4";
      d.x =
        gap +
        i * (this.barWidth + 2 * gap) -
        ((d.width || this.barWidth) - this.barWidth) / 2;
      d.y = canvas.height - d.value - this.xAxisSpace;
      d.width = d.width || this.barWidth;
      d.height = d.value;
      d.clearWidth = canvas.width / this.data.length;
      d.clearX = i * d.clearWidth;
    }
    this.zhuzi = new Zhuzi(this.data, this.ctx);
  }
  addEvents() {
    const that = this;
    this.canvas.addEventListener(
      "mousemove",
      function (event) {
        const rect = this.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        that.zhuzi.triggerEvents(x, y);
      },
      false
    );
  }
}
class Zhuzi {
  private subscribes = {};
  private zhuArr = [];
  private data;
  constructor(data, ctx) {
    this.data = data;
    this.zhuArr = data.map((item) => {
      return new Zhu(item, ctx);
    });
  }
  on(event, callback) {
    let eventSubs = this.subscribes[event];
    !eventSubs && (eventSubs = this.subscribes[event] = []);
    eventSubs.push(callback);
  }
  emit(event, data) {
    let eventSubs = this.subscribes[event];
    console.log(eventSubs);
    (eventSubs || []).forEach((cb) => {
      cb(data);
    });
  }
  eq(index) {
    return this.zhuArr[index];
  }
  triggerEvents(x, y) {
    let index = 0;
    let hasMouseOver = false;
    for (const d of this.data) {
      if (x > d.x && x < d.x + d.width && y > d.y && y < d.y + d.height) {
        d.mouseover = true;
        hasMouseOver = true;
        this.emit("mouseover", index);
      } else {
        if (d.mouseover) {
          d.mouseover = false;
          this.emit("mouseout", index);
        }
      }
      index++;
    }
    if (hasMouseOver) {
      document.body.style.cursor = "pointer";
    } else {
      document.body.style.cursor = "default";
    }
  }
}
class Zhu {
  private data;
  private ctx;
  private animating = false;
  private animateConfig = { width: 0 };
  private animationId;
  constructor(data, ctx) {
    this.data = data;
    this.ctx = ctx;
    this.render();
  }
  animate(config) {
    // if (this.animating) {
    //   return;
    // }
    cancelAnimationFrame(this.animationId);
    const times = config.duration / 16;
    const gap = (config.width - this.data.width) / times;
    this.animateAction(config, gap);
  }
  animateAction(config, gap) {
    this.animateConfig = config;
    if (this.data.width !== config.width) {
      this.animating = true;
      const fixGap =
        gap < 0
          ? Math.max(gap, config.width - this.data.width)
          : Math.min(gap, config.width - this.data.width);
      this.data.width += fixGap;
      this.data.x -= fixGap / 2;
      this.render();
      const that = this;
      this.animationId = requestAnimationFrame(() => {
        that.animateAction(config, gap);
      });
    } else {
      this.animating = false;
    }
  }
  render() {
    const d = this.data;
    const ctx = this.ctx;
    const radius = 5;
    ctx.clearRect(Math.max(31, d.clearX), d.y - 1, d.clearWidth, d.height);
    // ctx.fillStyle = d.color;
    // ctx.fillRect(d.x, d.y, d.width, d.height);
    const { x, y, width, height } = d;
    ctx.beginPath();
    ctx.moveTo(d.x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
    ctx.fillStyle = d.color;
    // 你可以选择绘制边框、填充实心色，也可以两者兼有
    // ctx.stroke(); // 绘制边框
    ctx.fill(); // 填充实心色
  }
}
