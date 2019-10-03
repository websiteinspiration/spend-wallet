import { Component, OnInit, HostListener, Renderer, Input, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { Symbol } from '../models/symbol.model';
import { EventListener } from '@angular/core/src/debug/debug_node';
import * as _ from 'lodash';

@Component({
  selector: 'app-wallet-chart',
  templateUrl: './wallet-chart.component.html',
  styleUrls: ['./wallet-chart.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WalletChartComponent implements OnInit {

  @Input() option: string;
  @Input() symbol: Symbol;
  @Input() data: any = [];
  @Output() changeFilter: EventEmitter<number> = new EventEmitter();

  maxWindowWidth = 1920;
  maxWindowHeight = 1080;
  minYAxisWidth = 90;
  ctx; chartWrapper; canvas; priceTooltip; dateTooltip; divider; dot;
  marketCap; volume; circSupply; maxSupply; onMouseMove;
  scrollInfo = {
    offsetX: 0,
    offsetY: 0
  };
  months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  options = {
    // Y Axis option
    yAxis: {
      ticks: 4,
      margin: 10,
      color: "#d3d3d3",
      font: "20px Avenir, serif"
    },
    // X Axis option
    xAxis: {
      ticks: 12,
      textMargin: 15,
      color: "#d3d3d3",
      font: "16px Avenir, serif"
    },
    // Grid option
    grid: {
      x: true,
      y: true,
      color: "#d3d3d3"
    },
    // Line chart option
    lineChart: {
      color: "#2574c7",
      width: 4,
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#2574c7',
      pointHoverRadius: 10,
    },
    // Bar chart option
    barChart: {
      fillColor: "#efefef",
      width: 30
    },
    data: [],
    type: '24h'
  }
  chartRect = {
    width: 0,
    height: 0,
    marginX: 150,
    marginY: 50
  };

  constructor(private renderer: Renderer) { }

  ngOnInit() {
    this.priceTooltip = document.getElementById("priceTooltip");
    this.dateTooltip = document.getElementById("dateTooltip");
    this.divider = document.getElementById("divider");
    this.dot = document.getElementById("dot");
    this.marketCap = document.getElementById("marketCap");
    this.volume = document.getElementById("volume");
    this.circSupply = document.getElementById("circSupply");
    this.maxSupply = document.getElementById("maxSupply");
    this.chartWrapper = document.getElementById("chartWrapper");

    this.initCanvas();
  }

  @HostListener('window:resize', ['$event'])
  onresize() {
    this.resizeCanvas(false);
    this.hideTooltip();
    this.drawChart(this.data);
  }

  // Initiate canvas
  initCanvas() {
    this.canvas = document.getElementById("chart");
    this.resizeCanvas(true);
    this.ctx = this.canvas.getContext("2d");

    window.addEventListener('scroll', this.scroll.bind(this), true);
  }

  scroll() {
    this.hideTooltip();

    this.scrollInfo.offsetX = this.chartWrapper.scrollLeft;
    this.scrollInfo.offsetY = this.chartWrapper.scrollTop;
  }

  // Set canvas width and height when resize
  resizeCanvas(isInit) {
    this.canvas.width = document.getElementById("chartContainer").offsetWidth;
    const width = this.canvas.width - (isInit ? this.canvas.width / 500 * 10 : 0);
    const height = this.canvas.width < 1280 ? 300 : this.maxWindowHeight - 100;

    this.setCanvasSize(this.canvas, width, height);
    
    this.chartRect.marginX = this.canvas.width / 7 < this.minYAxisWidth
                              ? this.minYAxisWidth
                              : this.canvas.width / 7
    this.chartRect.width = this.canvas.width - this.chartRect.marginX;
    this.chartRect.height = this.canvas.height - this.chartRect.marginY;
  }

  setCanvasSize(canvas, width, height) {
    var ratio = window.devicePixelRatio,
        style = canvas.style;

    style.width  = '' + (width  / ratio) + 'px';
    style.height = '' + (height / ratio) + 'px';

    canvas.width  = width;
    canvas.height = height;
}

  // Call this function when click period buttons
  selectPeriod(type, index) {
    this.options.type = type;
    this.changeFilter.emit(type);
  }

  // Draw chart function
  drawChart(data) {
    this.clearChart();
    this.hideTooltip();

    this.options.data = data;

    // Set number of tick in X Axis regarding the period
    switch (this.options.type) {
      case '24h':
        this.options.xAxis.ticks = 6;
        break;
      case '7d':
        this.options.xAxis.ticks = 7;
        break;
      case '1m':
        this.options.xAxis.ticks = 6;
        break;
      case '3m':
        this.options.xAxis.ticks = 6;
        break;
      case '1y':
        this.options.xAxis.ticks = 6;
        break;
      case 'all':
        this.options.xAxis.ticks = 9;
        break;
      default:
        this.options.xAxis.ticks = 6;
        break;
    }

    this.drawGrid();

    let minPrice = 1000000, maxPrice = 0, minVolume = 10000000000000, maxVolume = 0;
    let lineDataSet = [], barDataSet = [];

    // Change data for line chart and bar chart
    data.price.sort(function (a, b) {
      if (a.date > b.date) {
        return 1;
      } else if (a.date < b.date) {
        return -1;
      }
      return 0;
    }).forEach((p, i) => {
      // Merge marketCap and volume data
      for (let i:any = 0; i < data.marketCap.length; i++) {
        if (data.marketCap[i].date.substr(0, 16) === p.date.substr(0, 16)) {
          p.marketCap = data.marketCap[i].amount;
          p.marketCapFormatted = data.marketCap[i].amountFormatted;
          break;
        }
      }
      for (let i:any = 0; i < data.volume.length; i++) {
        if (data.volume[i].date.substr(0, 16) === p.date.substr(0, 16)) {
          p.volume = data.volume[i].amount;
          p.volumeFormatted = data.volume[i].amountFormatted;
          break;
        }
      }

      switch (this.options.type) {
        case '24h':
          if (i % 2 === 1) {
            lineDataSet.push(p);
          }
          barDataSet.push(p);
          break;
        case '7d':
          if (i % 12 === 6) {
            lineDataSet.push(p);
          }
          if (i % 4 === 2) {
            barDataSet.push(p);
          }
          break;
        case '1m':
          if (i % 3 === 1) {
            lineDataSet.push(p);
          }
          barDataSet.push(p);
          break;
        case '3m':
          if (i % 6 === 3) {
            lineDataSet.push(p);
          }
          if (i % 2 === 1) {
            barDataSet.push(p);
          }
          break;
        case '1y':
          if (i % 20 == 2) {
            lineDataSet.push(p);
          }
          if (i % 7 === 2) {
            barDataSet.push(p);
          }
          break;
        case 'all':
          if (i % 150 === 50) {
            lineDataSet.push(p);
          }
          if (i % 30 === 10) {
            barDataSet.push(p);
          }
          break;
        default:
          if (i % 12 === 11) {
            lineDataSet.push(p);
          }
          if (i % 3 === 2) {
            barDataSet.push(p);
          }
          break;
      }

      let price = parseFloat(p.amount), volumeValue = parseFloat(p.volume);
      if (price < minPrice) {
        minPrice = price;
      }
      if (price > maxPrice) {
        maxPrice = price;
      }
      if (volumeValue < minVolume) {
        minVolume = volumeValue - 100000000;
      }
      if (volumeValue > maxVolume) {
        maxVolume = volumeValue + 100000000;
      }
    });

    minPrice = minPrice - (maxPrice - minPrice) / (this.options.yAxis.ticks * 2);
    maxPrice = maxPrice + (maxPrice - minPrice) / (this.options.yAxis.ticks * 2);

    // Set details first
    if (barDataSet.length) {
      this.showDetailData(barDataSet[0])
    }

    // Draw bar chart
    let deltaVolume = this.chartRect.height / ((maxVolume - minVolume) * 2), bars = [];
    this.ctx.beginPath();
    this.ctx.fillStyle = this.options.barChart.fillColor;
    for (let i = 0; i < barDataSet.length; i++) {
      bars.push({
        x1: i * this.chartRect.width / barDataSet.length,
        x2: i * this.chartRect.width / barDataSet.length + this.options.barChart.width * this.chartRect.width / this.maxWindowWidth,
        y1: this.chartRect.height - deltaVolume * (parseFloat(barDataSet[i].volume) - minVolume),
        y2: this.chartRect.height - deltaVolume * (parseFloat(barDataSet[i].volume) - minVolume) + deltaVolume * (parseFloat(barDataSet[i].volume) - minVolume),
        i: i
      });
      this.ctx.rect(i * this.chartRect.width / barDataSet.length, this.chartRect.height - deltaVolume * (parseFloat(barDataSet[i].volume) - minVolume),
        this.options.barChart.width * this.chartRect.width / this.maxWindowWidth, deltaVolume * (parseFloat(barDataSet[i].volume) - minVolume));
      this.ctx.fill();
    }
    this.ctx.closePath();

    // Draw line chart
    let delta = this.chartRect.height / (maxPrice - minPrice);
    let circles = [];
    this.ctx.beginPath();
    this.ctx.strokeStyle = this.options.lineChart.color;
    this.ctx.lineWidth = this.options.lineChart.width;
    this.ctx.arc(50 * this.chartRect.width / this.maxWindowWidth, this.chartRect.height - delta * (parseFloat(lineDataSet[0].amount) - minPrice), 2, 0, 2 * Math.PI);
    circles.push({
      x: 50 * this.chartRect.width / this.maxWindowWidth,
      y: this.chartRect.height - delta * (parseFloat(lineDataSet[0].amount) - minPrice),
      i: 0
    });
    this.ctx.stroke();
    for (let i = 1; i < lineDataSet.length; i++) {
      this.ctx.moveTo(50 * this.chartRect.width / this.maxWindowWidth + (i - 1) * this.chartRect.width / lineDataSet.length, this.chartRect.height - delta * (parseFloat(lineDataSet[i - 1].amount) - minPrice));
      this.ctx.lineTo(50 * this.chartRect.width / this.maxWindowWidth + i * this.chartRect.width / lineDataSet.length, this.chartRect.height - delta * (parseFloat(lineDataSet[i].amount) - minPrice));
      this.ctx.arc(50 * this.chartRect.width / this.maxWindowWidth + i * this.chartRect.width / lineDataSet.length, this.chartRect.height - delta * (parseFloat(lineDataSet[i].amount) - minPrice), 1, 0, 2 * Math.PI);
      circles.push({
        x: 50 * this.chartRect.width / this.maxWindowWidth + i * this.chartRect.width / lineDataSet.length +  3,
        y: this.chartRect.height - delta * (parseFloat(lineDataSet[i].amount) - minPrice),
        i: i
      });
      this.ctx.stroke();
    }
    this.ctx.closePath();

    const that = this;

    // Remove previous listener due to cached data
    this.canvas.removeEventListener('mousemove', this.onMouseMove, true)
    
    this.onMouseMove = e => {
      let isPointActive = false;
      circles.forEach(c => {
        if (c.x + 10 > e.offsetX && c.x - 10 < e.offsetX && c.y + 10 > e.offsetY && c.y - 10 < e.offsetY) {
          that.showTooltip(lineDataSet[c.i], c.x - this.scrollInfo.offsetX, c.y - this.scrollInfo.offsetY);
          isPointActive = true;
        }
      });

      bars.forEach(b => {
        if (b.x1 < e.offsetX && b.x2 > e.offsetX && b.y1 < e.offsetY && b.y2 > e.offsetY) {
          that.showDetailData(barDataSet[b.i]);
        }
      });

      if (!isPointActive) {
        that.hideTooltip();
      }
    }
    // Add mousemove event
    this.canvas.addEventListener('mousemove', this.onMouseMove, true);

    this.drawYAxis(maxPrice, minPrice);
    this.drawXAxis(barDataSet);
  }

  // Clean chart rectangle for redraw
  clearChart() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // Show tooltip when mouseover the circles of line chart
  showTooltip(data, x, y) {
    this.dot.style.display = "block";    
    this.dot.style.width = `${this.options.lineChart.pointHoverRadius * 2}px`;
    this.dot.style.height = `${this.options.lineChart.pointHoverRadius * 2}px`;
    this.dot.style.backgroundColor = this.options.lineChart.pointHoverBackgroundColor;
    this.dot.style.borderRadius = `${this.options.lineChart.pointHoverRadius}px`;
    this.dot.style.border =  `${this.options.lineChart.width}px solid ${this.options.lineChart.color}`;
    this.dot.style.left = `${x - this.options.lineChart.pointHoverRadius - this.options.lineChart.width}px`;
    this.dot.style.top = `${y + this.options.lineChart.pointHoverRadius}px`;

    this.priceTooltip.style.display = "block";
    this.priceTooltip.innerHTML = data.amountFormatted;
    this.priceTooltip.style.left = (x - 35 > 0 ? x - 35 : x) + "px";
    this.priceTooltip.style.top = (y - 70 > 0 ? y - 70 : (y + 15)) + "px";
    
    this.dateTooltip.style.display = "block";
    this.dateTooltip.style.left = (x - 20 > 0 ? x - 20 : x) + "px";
    this.dateTooltip.style.top = (this.chartRect.height) + "px";
    if (this.options.type === '24h') {
      this.dateTooltip.innerHTML = this.getTime(data.date);
    } else {
      const day = new Date(data.date).getDate() + " " + this.months[new Date(data.date).getMonth()]

      if (['7d', '1m', '3m'].indexOf(this.options.type) !== -1) {
        this.dateTooltip.innerHTML = day;
      } else {
        this.dateTooltip.innerHTML = day + ", " + new Date(data.date).getFullYear();
      }
    }
    
    this.divider.style.display = "block";
    this.divider.style.left = (x - 5) + "px";
    this.divider.style.top = (y - 70 > 0 ? y - 35 : (y + 50)) + "px";
    this.divider.style.height = ((this.chartRect.height + 10) - (y - 70 > 0 ? y - 40 : (y + 45)) - 20) + "px";

    this.marketCap.innerHTML = data.marketCapFormatted;
    this.volume.innerHTML = data.volumeFormatted;
  }

  // Update marketCap and volume text field when mouseover line chart or bar chart
  showDetailData(data) {
    this.marketCap.innerHTML = data.marketCapFormatted;
    this.volume.innerHTML = data.volumeFormatted;
    this.circSupply.innerHTML = this.symbol.marketData.totalSupplyFormatted !== "0"
                                ? `${this.symbol.marketData.totalSupplyFormatted} ${this.symbol.symbol}`
                                : 'N/A';
    this.maxSupply.innerHTML = this.symbol.marketData.maxSupplyFormatted !== "0"
                                ? `${this.symbol.marketData.maxSupplyFormatted} ${this.symbol.symbol}`
                                : 'N/A';
  }

  // Get time as HH:MM
  getTime(dateString) {
    return ("0" + new Date(dateString).getHours()).slice(-2) + ":" + ("0" + new Date(dateString).getMinutes()).slice(-2);
  }

  // Hide tooltip
  hideTooltip() {
    this.priceTooltip.style.display = "none";
    this.dateTooltip.style.display = "none";
    this.divider.style.display = "none";
    this.dot.style.display = "none";
  }

  // Draw Y Axis labels
  drawYAxis(max:any, min:any) {
    this.ctx.beginPath();
    this.ctx.fillStyle = this.options.yAxis.color;
    this.ctx.font = this.options.yAxis.font;
    const fontArgs = this.ctx.font.split(' ');
    const padding = this.chartRect.marginX / 8;
    this.ctx.font = '16px ' + fontArgs.slice(1, fontArgs.length).join(' ');

    let delta: any = (max - min) / this.options.yAxis.ticks;
    for (let i: any = 0; i < this.options.yAxis.ticks; i++) {
      this.ctx.fillText("$" + (max - i * delta).toFixed(2), this.chartRect.width + 5 + padding, i * this.chartRect.height / this.options.yAxis.ticks + 40);
    }
    this.ctx.closePath();
  }

  // Draw X Axis labels
  drawXAxis(data) {
    let days = [], hours = [];
    let deltaXAxis = Math.floor(data.length / this.options.xAxis.ticks);
    data.forEach((d, index) => {
      let day = new Date(d.date).getDate() + " " + this.months[new Date(d.date).getMonth()];
      
      if (index % deltaXAxis === Math.floor(deltaXAxis / 2)) {
        if (this.options.type === '1y') {
          days.push(day);
        } else if (this.options.type === 'all') {
          days.push(new Date(d.date).getFullYear())
        } else {
          if (this.options.type === '24h') {
            hours.push(this.getTime(d.date));
          } else {
            days.push(day);
          }
        }
      }
    });

    // remove duplication due to static tick counts
    if (this.options.type === 'all') {
      days = _.uniq(days);
      this.options.xAxis.ticks = days.length;      
    }
    this.ctx.beginPath();
    this.ctx.fillStyle = this.options.xAxis.color;
    this.ctx.font = '100 ' + this.options.xAxis.font;

    let delta = this.chartRect.width / this.options.xAxis.ticks;
    for (let i = 0; i < this.options.xAxis.ticks; i++) {
      if (this.options.type === '24h') {
        this.ctx.fillText(hours[i], delta / 2 - 30 + i * delta, this.chartRect.height + this.chartRect.marginY - 10);
      } else {
        this.ctx.fillText(days[i], delta / 2 - 15 + i * delta, this.chartRect.height + this.chartRect.marginY - 10);
      }
    }
    this.ctx.closePath();
  }

  // Draw chart grid
  drawGrid() {
    this.ctx.beginPath();
    this.ctx.lineWidth = 0.5;
    this.ctx.strokeStyle = this.options.grid.color;
    if (this.options.grid.y) {
      for (let i = 1; i <= this.options.yAxis.ticks; i++) {
        this.ctx.moveTo(0, i * this.chartRect.height / this.options.yAxis.ticks);
        this.ctx.lineTo(this.chartRect.width + this.chartRect.marginX, i * this.chartRect.height / this.options.yAxis.ticks);
        this.ctx.stroke();
      }
    }
    if (this.options.grid.x) {
      for (let i = 1; i <= this.options.xAxis.ticks; i++) {
        this.ctx.moveTo(10 + i * this.chartRect.width / this.options.xAxis.ticks, 0);
        this.ctx.lineTo(10 + i * this.chartRect.width / this.options.xAxis.ticks, this.chartRect.height);
        this.ctx.stroke();
      }
    }
    this.ctx.closePath();
  }

  ngOnChanges() {
    if (this.data) {
      this.drawChart(this.data);
    }
  }
}
